import { prescriptionContractAbi, prescriptionContractAddress } from "./constants";
import { BrowserProvider, Contract, } from "ethers";

let provider;
let signer;
let prescriptionContract;

// Initialize the contract
const initialize = async () => {
    if (typeof window.ethereum !== "undefined") {
        provider = new BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        prescriptionContract = new Contract(
            prescriptionContractAddress,
            prescriptionContractAbi,
            signer
        );
    }else{
        console.error("MetaMask is not installed");
    }
}

// Role Registration Functions
export const registerAsDoctor = async () => {
    try {
        const tx = await prescriptionContract.registerAsDoctor();
        await tx.wait();
        return true;
    } catch (error) {
        console.error("Error registering as doctor:", error);
        throw error;
    }
};

export const registerAsPatient = async () => {
    try {
        const tx = await prescriptionContract.registerAsPatient();
        await tx.wait();
        return true;
    } catch (error) {
        console.error("Error registering as patient:", error);
        throw error;
    }
};

export const registerAsPharmacy = async () => {
    try {
        const tx = await prescriptionContract.registerAsPharmacy();
        await tx.wait();
        return true;
    } catch (error) {
        console.error("Error registering as pharmacy:", error);
        throw error;
    }
};

export const registerAsPharmaceuticalCompany = async () => {
    try {
        const tx = await prescriptionContract.registerAsPharmaceuticalCompany();
        await tx.wait();
        return true;
    } catch (error) {
        console.error("Error registering as pharmaceutical company:", error);
        throw error;
    }
};

// Inventory Management Functions
export const setInventory = async (drugIds, stocks, expirations) => {
    try {
        const tx = await prescriptionContract.setInventory(drugIds, stocks, expirations);
        await tx.wait();
        return true;
    } catch (error) {
        console.error("Error setting inventory:", error);
        throw error;
    }
};

export const updateInventory = async (drugId, amount, newExpiration) => {
    try {
        const tx = await prescriptionContract.updateInventory(drugId, amount, newExpiration);
        await tx.wait();
        return true;
    } catch (error) {
        console.error("Error updating inventory:", error);
        throw error;
    }
};

export const updatePharmacyInventory = async (pharmacy, drugId, amount, expiration) => {
    try {
        const tx = await prescriptionContract.updatePharmacyInventory(pharmacy, drugId, amount, expiration);
        await tx.wait();
        return true;
    } catch (error) {
        console.error("Error updating pharmacy inventory:", error);
        throw error;
    }
};

// Prescription Management Functions
export const createPrescription = async (patient, recommendedPharmacy, detailsHash, medications) => {
    try {
        const tx = await prescriptionContract.createPrescription(
            patient,
            recommendedPharmacy,
            detailsHash,
            medications
        );
        const txReceipt = await tx.wait(1);
        console.log("txReceipt", txReceipt);
        return true;
    } catch (error) {
        console.error("Error creating prescription:", error);
        throw error;
    }
};

export const acceptPrescription = async (prescriptionId) => {
    try {
        const tx = await prescriptionContract.acceptPrescription(prescriptionId);
        await tx.wait();
        return true;
    } catch (error) {
        console.error("Error accepting prescription:", error);
        throw error;
    }
};

export const orderPrescription = async (prescriptionId, pharmacyAddress, orderHash) => {
    try {
        const tx = await prescriptionContract.orderPrescription(prescriptionId, pharmacyAddress, orderHash);
        await tx.wait();
        return true;
    } catch (error) {
        console.error("Error ordering prescription:", error);
        throw error;
    }
};

export const orderPrescriptionMultiPharmacy = async (prescriptionId, pharmacyAddresses, medIndices, orderHashes) => {
    try {
        const tx = await prescriptionContract.orderPrescriptionMultiPharmacy(
            prescriptionId,
            pharmacyAddresses,
            medIndices,
            orderHashes
        );
        await tx.wait();
        return true;
    } catch (error) {
        console.error("Error ordering prescription from multiple pharmacies:", error);
        throw error;
    }
};

// Getter Functions
export const getAllPharmacies = async () => {
    try {
        return await prescriptionContract.getAllPharmacies();
    } catch (error) {
        console.error("Error getting all pharmacies:", error);
        throw error;
    }
};

export const getPatientsOfDoctor = async (doctor) => {
    try {
        return await prescriptionContract.getPatientsOfDoctor(doctor);
    } catch (error) {
        console.error("Error getting patients of doctor:", error);
        throw error;
    }
};

export const getPrescriptionsByDoctor = async (doctor) => {
    try {
        return await prescriptionContract.getPrescriptionsByDoctor(doctor);
    } catch (error) {
        console.error("Error getting prescriptions by doctor:", error);
        throw error;
    }
};

export const getPrescriptionsByPatient = async (patient) => {
    try {
        return await prescriptionContract.getPrescriptionsByPatient(patient);
    } catch (error) {
        console.error("Error getting prescriptions by patient:", error);
        throw error;
    }
};

export const getPharmacyById = async (id) => {
    try {
        return await prescriptionContract.getPharmacyById(id);
    } catch (error) {
        console.error("Error getting pharmacy by id:", error);
        throw error;
    }
};

export const getInventoryForPharmacy = async (pharmacyAddr) => {
    try {
        return await prescriptionContract.getInventoryForPharmacy(pharmacyAddr);
    } catch (error) {
        console.error("Error getting inventory for pharmacy:", error);
        throw error;
    }
};

export const getActiveDrugsOfPatient = async (patient) => {
    try {
        return await prescriptionContract.getActiveDrugsOfPatient(patient);
    } catch (error) {
        console.error("Error getting active drugs of patient:", error);
        throw error;
    }
};

export const getRole = async (account) => {
    try {
        const roleData= await prescriptionContract.getRole(account);
        console.log("roleData", Number(roleData));
        return Number(roleData);
    } catch (error) {
        console.error("Error getting role:", error);    
        throw error;
    }
};

// Run once
initialize();