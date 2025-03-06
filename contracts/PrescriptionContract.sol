// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// Errors
error NotDoctor(uint256 role, address account);
error NotPatient(uint256 role, address account);
error NotPharmacy(uint256 role, address account);
error AlreadyRegistered(address account, uint256 role);
error MismatchLengths();
error NotRegistered(address account);
error PrescriptionAlreadyAccepted(uint256 prescriptionID);
error PrescriptionNotAccepted(uint prescriptionId);
error PrescriptionNotForSender(address sender, address recipient);
error PrescriptionAlreadyOrdered(uint prescriptionId);
error DrugsAlreadyActive(uint drugId, address patient);
error NotEnoughDrugs(address pharmacy, uint prescriptionID, uint drugId);
error InvalidMedIndex(uint index, uint length);
error AlreadyOrdered(uint prescriptionId, uint medIndex);
error InvalidPharmacyId(uint index, uint length);


contract PrescriptionContract {
    
    // Defining Roles
    enum Role { None, Doctor, Patient, Pharmacy, PharmaceuticalCompany }
    mapping(address => Role ) public roles;

    //Storing all the pharmacies also fuck you, index is id for pharmacies
    address[] public pharmacies;
    mapping(address => bool) public isPharmacyRegistered;

    // Defining modifiers
    modifier onlyDoctor() {
        if(roles[msg.sender] != Role.Doctor){
            revert NotDoctor({
                role: uint256(roles[msg.sender]),
                account: msg.sender
            });
        }
        _;
    }

    modifier onlyPatient() {
        if(roles[msg.sender] != Role.Patient){
            revert NotPatient({
                role: uint256(roles[msg.sender]),
                account: msg.sender
            });
        }
        _;
    }

    modifier onlyPharmacy() {
        if(roles[msg.sender] != Role.Pharmacy){
            revert NotPharmacy({
                role: uint256(roles[msg.sender]),
                account: msg.sender
            });
        }
        _;
    }

    //Medication details
    struct Medication {
        uint drugId;
        uint dosage;
        uint no_days;
    }

    //Prescription details
    struct Prescription {
        uint id;
        address doctor;
        address patient;
        address recommendedPharmacy;
        bytes32 detailsHash;
        Medication[] medications;
        bool[] orderedMedications;
        uint timestamp;
        bool accepted;
        bool ordered;
    }

    //all Mappings

    //Having a counter to get prescription id
    uint public prescriptionCounter;
    mapping(uint => Prescription) public prescriptions;

    //Checking if a patient is under a active drug
    mapping(address => mapping(uint => bool)) public activeDrug;
    mapping(address => uint[]) private patientActiveDrugs;

    //Connecting doctor to patients
    mapping(address => address[]) private doctorPatients;

    //Track prescriptions for doctor and patient
    mapping(address => uint[]) private doctorPrescriptions;
    mapping(address => uint[]) private patientPrescriptions;

    //Inventory for pharmacies
    // mapping(address => mapping(uint => uint)) public inventory;

    // adding expiration date to the inventory - brooo so much workkk

    // use UNIX format for expiration date please
    struct InventoryItem {
        uint stock;
        uint expiration;
    }
    mapping(address => mapping(uint => InventoryItem)) public inventory;
    mapping(address => uint[]) private pharmacyDrugIds;


    //Events for logs and shit

    event Registered(address indexed account, Role role);
    event PrescriptionCreated(uint indexed prescriptionId, address indexed doctor, address indexed patient);
    event PrescriptionAccepted(uint indexed prescriptionId, address indexed patient);
    event OrderPlaced(uint indexed prescriptionId, address indexed patient, address indexed pharmacy);
    event MultiOrderPlaced(uint indexed prescriptionId, address indexed patient);

    // Functions to Register Roles
    /// @notice All are external
    function registerAsDoctor() external {
        if( roles[msg.sender] != Role.None ){
            revert AlreadyRegistered(msg.sender, uint256(roles[msg.sender]));
        }
        roles[msg.sender] = Role.Doctor;
        emit Registered(msg.sender, roles[msg.sender]);
    }

    function registerAsPatient() external {
        if( roles[msg.sender] != Role.None ){
            revert AlreadyRegistered(msg.sender, uint256(roles[msg.sender]));
        }
        roles[msg.sender] = Role.Patient;
        emit Registered(msg.sender, roles[msg.sender]);
    }

    function registerAsPharmacy() external {
        if( roles[msg.sender] != Role.None ){
            revert AlreadyRegistered(msg.sender, uint256(roles[msg.sender]));
        }
        roles[msg.sender] = Role.Pharmacy;
        emit Registered(msg.sender, roles[msg.sender]);
        if (!isPharmacyRegistered[msg.sender]) {
            pharmacies.push(msg.sender);
            isPharmacyRegistered[msg.sender] = true;
        }
    }

    function registerAsPharmaceuticalCompany() external {
        if (roles[msg.sender] != Role.None) revert AlreadyRegistered(msg.sender, uint256(roles[msg.sender]));
        roles[msg.sender] = Role.PharmaceuticalCompany;
        emit Registered(msg.sender, roles[msg.sender]);
    }


    // Inventory Management

    // Another summa function to run some shit
    function _addDrugIdForPharmacy(address pharmacyAddr, uint drugId) internal {
        uint[] storage drugs = pharmacyDrugIds[pharmacyAddr];
        bool exists = false;
        for (uint i = 0; i < drugs.length; i++) {
            if (drugs[i] == drugId) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            drugs.push(drugId);
        }
    }

    /// @notice initialize the stock of the pharmacy for now
    /// @param drugIds - array of drugIds
    /// @param stocks - stock for each drugId
    // adding expiration dates
    function setInventory(uint[] calldata drugIds, uint[] calldata stocks, uint[] calldata expirations) external onlyPharmacy {
        if(drugIds.length != stocks.length){
            revert MismatchLengths();
        }
        for (uint i=0;i<drugIds.length;i++){
            inventory[msg.sender][drugIds[i]] = InventoryItem({
                stock: stocks[i],
                expiration: expirations[i]
            });
            _addDrugIdForPharmacy(msg.sender, drugIds[i]);
        }
    }

    /// @notice update the inventroy of a stock
    // adding expiration dates to this as well
    function updateInventory(uint drugId, uint amount, uint newExpiration) external onlyPharmacy {
        inventory[msg.sender][drugId].stock += amount;
        inventory[msg.sender][drugId].expiration = newExpiration;
        _addDrugIdForPharmacy(msg.sender, drugId);
    }

    function updatePharmacyInventory(address pharmacy, uint drugId, uint amount, uint expiration ) external {
        require(roles[msg.sender] == Role.PharmaceuticalCompany, "Unauthorized");
        inventory[pharmacy][drugId].stock += amount;
        inventory[pharmacy][drugId].expiration = expiration;
        _addDrugIdForPharmacy(pharmacy, drugId);
    }

    // Summa function for adding doctor patient relationship cause lazy to write in big function so made is in different one
    function _addDoctorPatient(address doctor, address patient) internal {
        bool exists = false;
        address[] storage patients = doctorPatients[doctor];
        for(uint i=0;i<patients.length;i++){
            if(patients[i] == patient){
                exists = true;
                break;
            }
        }
        if(!exists){
            patients.push(patient);
        }
    }


    // Creating Prescription and Verification
    
    /// @notice create Prescription - Not writing param docs fuck you
    function createPrescription(address patient, address recommendedPharmacy, bytes32 detailsHash, Medication[] calldata meds) external onlyDoctor{
        if(roles[patient] != Role.Patient){
            revert NotRegistered(patient);
        }

        prescriptionCounter++;
        Prescription storage pres = prescriptions[prescriptionCounter];
        pres.id = prescriptionCounter;
        pres.doctor = msg.sender;
        pres.patient = patient;
        pres.recommendedPharmacy = recommendedPharmacy;
        pres.detailsHash = detailsHash;
        pres.timestamp = block.timestamp;
        pres.accepted = false;
        pres.ordered = false;

        for(uint i=0;i<meds.length;i++){
            pres.medications.push(meds[i]);
            pres.orderedMedications.push(false);
        }

        doctorPrescriptions[msg.sender].push(prescriptionCounter);
        patientPrescriptions[patient].push(prescriptionCounter);
        _addDoctorPatient(msg.sender, patient);

        emit PrescriptionCreated(prescriptionCounter, msg.sender, patient);
    }

    /// @notice to accept a prescription
    function acceptPrescription(uint prescriptionId) external onlyPatient{
        Prescription storage pres = prescriptions[prescriptionId];

        if(pres.patient != msg.sender) {
            revert PrescriptionNotForSender(pres.patient, msg.sender);
        }

        if(pres.accepted){
            revert PrescriptionAlreadyAccepted(prescriptionId);
        }

        for(uint i=0;i<pres.medications.length;i++){
            uint drugId = pres.medications[i].drugId;
            if(activeDrug[msg.sender][drugId]){
                revert DrugsAlreadyActive(drugId, msg.sender);
            }
        }

        pres.accepted = true;
        for (uint i=0;i<pres.medications.length;i++){
            uint drugId = pres.medications[i].drugId;
            activeDrug[msg.sender][drugId] = true;
            patientActiveDrugs[msg.sender].push(drugId);
        }

        emit PrescriptionAccepted(prescriptionId, msg.sender);
    }

    function _removeActiveDrug(address patient, uint drugId) internal{
        uint[] storage drugs = patientActiveDrugs[patient];
        for(uint i=0;i<drugs.length;i++){
            if(drugs[i]==drugId){
                drugs[i] = drugs[drugs.length-1];
                drugs.pop();
                break;
            }
        }
    }

    // Ordering a Prescription

    function orderPrescription(uint prescriptionId, address pharmacyAddress, bytes32 /* orderHash */) external onlyPatient {
        Prescription storage pres = prescriptions[prescriptionId];
        if(msg.sender != pres.patient){
            revert PrescriptionNotForSender(msg.sender, pres.patient);
        }
        if(!pres.accepted){
            revert PrescriptionNotAccepted(prescriptionId);
        }
        if(pres.ordered){
            revert PrescriptionAlreadyOrdered(prescriptionId);
        }
        if(roles[pharmacyAddress] != Role.Pharmacy){
            revert NotPharmacy(uint(roles[pharmacyAddress]), pharmacyAddress);
        }

        for(uint i=0;i<pres.medications.length;i++){
            uint drugId = pres.medications[i].drugId;
            uint requiredAmount = pres.medications[i].dosage * pres.medications[i].no_days;
            if(inventory[pharmacyAddress][drugId].stock < requiredAmount){
                revert NotEnoughDrugs(pharmacyAddress, prescriptionId, drugId);
            }
        }

        for(uint i=0;i<pres.medications.length;i++){
            uint drugId = pres.medications[i].drugId;
            uint requiredAmount = pres.medications[i].dosage * pres.medications[i].no_days;
            inventory[pharmacyAddress][drugId].stock -= requiredAmount;
            activeDrug[msg.sender][drugId] = false;
            _removeActiveDrug(msg.sender, drugId);
            pres.orderedMedications[i]=true;
        }

        pres.ordered = true;

        emit OrderPlaced(prescriptionId, msg.sender, pharmacyAddress);
    }

    // function for ordering different drugs from different pharmacies - fuck you for making me write this shit. This shit is too stoopid
    // gonna write param docs for this shit cause will be too confusing to understand
    /// @param pharmacyAddresses Array of pharmacy addresses to order from.
    /// @param medIndices A 2D array where each sub-array contains indices (in the prescription's medications array) to be ordered from the corresponding pharmacy.
    /// @param orderHashes Array of hashes of order details (off-chain) for each pharmacy order.
    function orderPrescriptionMultiPharmacy(uint prescriptionId, address[] calldata pharmacyAddresses, uint[][] calldata medIndices, bytes32[] calldata orderHashes) external onlyPatient{
        Prescription storage pres = prescriptions[prescriptionId];

        if(msg.sender != pres.patient){
            revert PrescriptionNotForSender(msg.sender, pres.patient);
        }

        if(!pres.accepted){
            revert PrescriptionNotAccepted(prescriptionId);
        }

        if(pharmacyAddresses.length != medIndices.length || pharmacyAddresses.length != orderHashes.length){
            revert MismatchLengths();
        }

        for (uint i = 0; i < pharmacyAddresses.length; i++) {
            address pharmacyAddr = pharmacyAddresses[i];

            if(roles[pharmacyAddr] != Role.Pharmacy){
                revert NotPharmacy(uint256(roles[pharmacyAddr]), pharmacyAddr);
            }

            uint[] calldata indices = medIndices[i];
            uint presId = prescriptionId;
            for (uint j = 0; j < indices.length; j++) {
                uint medIndex = indices[j];

                if(medIndex >= pres.medications.length) revert InvalidMedIndex(medIndex, pres.medications.length);
                if(pres.orderedMedications[medIndex]) revert AlreadyOrdered(prescriptionId, medIndex);

                uint drugId = pres.medications[medIndex].drugId;
                uint requiredAmount = pres.medications[medIndex].dosage * pres.medications[medIndex].no_days;

                if(inventory[pharmacyAddr][drugId].stock < requiredAmount) revert NotEnoughDrugs(pharmacyAddr, presId, drugId);
                

                inventory[pharmacyAddr][drugId].stock -= requiredAmount;

                pres.orderedMedications[medIndex] = true;

                activeDrug[msg.sender][drugId] = false;
                _removeActiveDrug(msg.sender, drugId);
            }
        }

        emit MultiOrderPlaced(prescriptionId, msg.sender);
    }

    // Store hash off chain
    // Active drugs - add keepers
    // drug expiration date - add keeper

    // store all pharmacies tick
    // different drugs from different pharmacies tick
    // all pharmacies tick
    // all pharmacies which can satisfy prescription tick
    // all patients of a doctor tick
    // all prescriptions of patient tick
    // all pending prescriptions - not approved / not doing, do this in front end, parse and get nigga
    // all pending prescriptions - not ordered / not doing, do this in front end
    // all prescriptions of doctor tick
    // get all pharmacies tick
    // get all pharmacies from id tick
    // get inventory from pharmacy tick
    // get active drugs tick

    // Getter functions
    
    // All are self explanatory not writing docs

    function getAllPharmacies() external view returns (address[] memory) {
        return pharmacies;
    }

    function getPatientsOfDoctor(address doctor) external view returns (address[] memory) {
        return doctorPatients[doctor];
    }

    function getPrescriptionsByDoctor(address doctor) external view returns (uint[] memory) {
        return doctorPrescriptions[doctor];
    }

    function getPrescriptionsByPatient(address patient) external view returns (uint[] memory) {
        return patientPrescriptions[patient];
    }

    function getPharmacyById(uint id) external view returns (address) {
        if(id >= pharmacies.length) revert InvalidPharmacyId(id, pharmacies.length);
        return pharmacies[id];
    }

    function getInventoryForPharmacy(address pharmacyAddr) external view returns (uint[] memory drugIds, uint[] memory stocks, uint[] memory expirations) {
        uint len = pharmacyDrugIds[pharmacyAddr].length;
        drugIds = new uint[](len);
        stocks = new uint[](len);
        expirations = new uint[](len);
        
        for (uint i = 0; i < len; i++) {
            uint drugId = pharmacyDrugIds[pharmacyAddr][i];
            drugIds[i] = drugId;
            stocks[i] = inventory[pharmacyAddr][drugId].stock;
            expirations[i] = inventory[pharmacyAddr][drugId].expiration;
        }
    }

    function getActiveDrugsOfPatient(address patient) external view returns (uint[] memory) {
        return patientActiveDrugs[patient];
    }

}