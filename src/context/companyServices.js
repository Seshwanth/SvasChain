import { drugSupplyChainAbi, drugSupplyChainAddress } from "./constants";
import { BrowserProvider, Contract } from "ethers";

let provider;
let signer;
let supplyChainContract;

// Initialize the contract
const initialize = async () => {
    try {
        if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
            // Use the window.ethereum provider directly without ENS
            provider = new BrowserProvider(window.ethereum, {
                name: 'local',
                chainId: 1337
            });
            signer = await provider.getSigner();
            supplyChainContract = new Contract(
                drugSupplyChainAddress,
                drugSupplyChainAbi,
                signer
            );
        } else {
            console.error("MetaMask is not installed");
        }
    } catch (error) {
        console.error("Error initializing contract:", error);
    }
}

// Drug Minting Functions
export const mintBatchDrugs = async (to, drugId, drugName, manufacturingDate, expirationDate, mrp, amount) => {
    try {
        const tx = await supplyChainContract.mintBatch(
            to,
            drugId,
            drugName,
            manufacturingDate,
            expirationDate,
            mrp,
            amount
        );
        await tx.wait();
        return true;
    } catch (error) {
        console.error("Error minting batch drugs:", error);
        throw error;
    }
};

// Drug Transfer Functions
export const transferDrugs = async (to, tokenIds, amounts) => {
    try {
        const tx = await supplyChainContract.safeBatchTransferFrom(
            await signer.getAddress(),
            to,
            tokenIds,
            amounts,
            "0x"
        );
        await tx.wait();
        return true;
    } catch (error) {
        console.error("Error transferring drugs:", error);
        throw error;
    }
};

// Getter Functions
export const getDrugMetadata = async (tokenId) => {
    try {
        const metadata = await supplyChainContract.drugMetadata(tokenId);
        return {
            drugId: Number(metadata.drugId),
            drugName: metadata.drugName,
            manufacturingDate: Number(metadata.manufacturingDate),
            manufacturer: metadata.manufacturer,
            expirationDate: Number(metadata.expirationDate),
            mrp: Number(metadata.mrp)
        };
    } catch (error) {
        console.error("Error getting drug metadata:", error);
        throw error;
    }
};

export const getOwnershipHistory = async (tokenId) => {
    try {
        const history = await supplyChainContract.getOwnershipHistory(tokenId);
        return history.map(item => ({
            from: item.from,
            to: item.to,
            amount: Number(item.amount),
            timestamp: Number(item.timestamp)
        }));
    } catch (error) {
        console.error("Error getting ownership history:", error);
        throw error;
    }
};

export const getCurrentOwner = async (tokenId) => {
    try {
        return await supplyChainContract.currentOwner(tokenId);
    } catch (error) {
        console.error("Error getting current owner:", error);
        throw error;
    }
};

export const getTokenCounter = async () => {
    try {
        const counter = await supplyChainContract.tokenCounter();
        return Number(counter);
    } catch (error) {
        console.error("Error getting token counter:", error);
        throw error;
    }
};

export const getBalance = async (account, tokenId) => {
    try {
        const balance = await supplyChainContract.balanceOf(account, tokenId);
        return Number(balance);
    } catch (error) {
        console.error("Error getting balance:", error);
        throw error;
    }
};

export const getBalanceBatch = async (accounts, tokenIds) => {
    try {
        const balances = await supplyChainContract.balanceOfBatch(accounts, tokenIds);
        return balances.map(balance => Number(balance));
    } catch (error) {
        console.error("Error getting batch balances:", error);
        throw error;
    }
};

// Utility Functions
export const isApprovedForAll = async (owner, operator) => {
    try {
        return await supplyChainContract.isApprovedForAll(owner, operator);
    } catch (error) {
        console.error("Error checking approval:", error);
        throw error;
    }
};

export const setApprovalForAll = async (operator, approved) => {
    try {
        const tx = await supplyChainContract.setApprovalForAll(operator, approved);
        await tx.wait();
        return true;
    } catch (error) {
        console.error("Error setting approval:", error);
        throw error;
    }
};

// Run initialization
initialize();
