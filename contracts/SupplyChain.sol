// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./PrescriptionContract.sol";

contract DrugSupplyChain is ERC1155 {

    //importing prescriptionContract
    PrescriptionContract prescriptionContract;

    // Drug Metadata from the company
    struct DrugMetadata {
        uint drugId;
        string drugName;
        uint manufacturingDate;
        address manufacturer;
        uint expirationDate;
        uint mrp;
    }

    // Storing the Transfer history for review
    struct TransferHistory {
        address from;
        address to;
        uint amount;
        uint timestamp;
    }

    //Mapping tokenId to the metaData
    mapping(uint => DrugMetadata) public drugMetadata;

    //Mapping tokenId to the Transfer History
    mapping(uint => TransferHistory[]) public ownershipHistory;

    //Mapping tokenId to the current Owner
    mapping(uint => address) public currentOwner;

    //having a token Counter
    uint public tokenCounter;

    // Constructor for initializing the prescriptionContract
    constructor(address _prescriptionContract) ERC1155("") {
        prescriptionContract = PrescriptionContract(_prescriptionContract);
    }

    // Minting the batch from only the Pharmasecutical company
    function mintBatch(address to, uint drugId, string memory drugName, uint manufacturingDate, uint expirationDate, uint mrp, uint amount ) external {
        require( prescriptionContract.roles(msg.sender) == PrescriptionContract.Role.PharmaceuticalCompany, "Not a pharmaceutical company" );

        tokenCounter++;
        drugMetadata[tokenCounter] = DrugMetadata({
            drugId: drugId,
            drugName: drugName,
            manufacturingDate: manufacturingDate,
            manufacturer: msg.sender,
            expirationDate: expirationDate,
            mrp: mrp
        });

        _mint(to, tokenCounter, amount, "");
        _updateOwnershipHistory(tokenCounter, address(0), to, amount);
    }

    // This function just before every transfer of a token
    function _updateWithAcceptanceCheck( address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data ) internal override {
        super._updateWithAcceptanceCheck(from, to, ids, amounts, data);

        for (uint i = 0; i < ids.length; i++) {
            uint tokenId = ids[i];
            uint amount = amounts[i];

            _updateOwnershipHistory(tokenId, from, to, amount);

            if (prescriptionContract.roles(to) == PrescriptionContract.Role.Pharmacy) {
                _burn(to, tokenId, amount);
                DrugMetadata memory metadata = drugMetadata[tokenId];
                prescriptionContract.updatePharmacyInventory(
                    to,
                    metadata.drugId,
                    amount,
                    metadata.expirationDate
                );
            }
        }
    }

    // Helper function to update teh Ownership History
    function _updateOwnershipHistory(uint tokenId, address from, address to, uint amount ) internal {
        ownershipHistory[tokenId].push(TransferHistory({
            from: from,
            to: to,
            amount: amount,
            timestamp: block.timestamp
        }));
        currentOwner[tokenId] = to;
    }

    // Getter function to get Ownership History given a tokenId
    function getOwnershipHistory(uint tokenId) external view returns (TransferHistory[] memory) {
        return ownershipHistory[tokenId];
    }
}