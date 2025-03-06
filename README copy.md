# SvasChain - A Blockchain-Based Prescription & Drug Supply Chain Management

## A Full Stack Gen AI dApp

### Objective
The pharmaceutical industry faces critical challenges, including prescription fraud, drug misuse, and inefficient & unreliable supply chains. Current systems rely on centralized databases prone to tampering and lack transparency. Our solution leverages blockchain to create a secure, verifiable, and automated prescription and supply chain management system.

### Target Users
- **Healthcare Providers** – Ensuring prescriptions are legitimate and trackable.
- **Patients** – Preventing misuse and enabling secure, verified access to medications.
- **Pharmaceutical Companies** – Keeping track of inventory and reducing wastage.
- **Regulatory Bodies** – Gaining real-time visibility into prescription patterns.

### Approach & Innovation
Our platform records prescriptions and drug transactions on an immutable blockchain, ensuring data integrity. Smart contracts automate prescription verification, dispensing, and inventory updates. Decentralized Identity (DID) ensures only authorized providers can issue prescriptions. Using Gen AI for automated metadata tagging, our system enhances searchability by extracting key medical terms (e.g., drug category, urgency level, patient risk) using Named Entity Recognition (NER).

### Why Blockchain?
- **Tamper-proof records** prevent fraud and unauthorized prescription alterations.
- **Smart contracts** automate verification and reduce human errors.
- **Interoperability** with existing healthcare databases enhances adoption.

### Impact
- **Eliminates Prescription Fraud** – Prevents duplicate prescriptions and “doctor shopping.”
- **Improves Compliance & Transparency** – Provides regulators with an auditable ledger.

### Feasibility
Integrate Solidity smart contracts to manage both prescription transactions and supply chain tracking. For prescriptions, doctors use an interface to create and submit prescriptions with unique transaction IDs, while patients access a dashboard to verify their prescriptions and receive refill alerts. For supply chain management, smart contracts record manufacturing details, batch information, expiry dates, and serial numbers from production to distribution. Integration utilizes Web3.js or Ethers.js to bridge front-end applications with blockchain data, enforcing secure, role-based access for all stakeholders. This approach ensures tamper-proof records and real-time monitoring across both clinical workflows and pharmaceutical logistics.

### Tech Stack
- **Blockchain**: Ethereum/Polygon for smart contract execution.
- **Smart Contracts**: Solidity for automated prescription verification.
- **Backend**: Node.js with Express.js.
- **Frontend**: Next.js, Tailwind CSS, Redux for a seamless user experience.
- **Storage**: IPFS (Pinata) for non-sensitive off-chain data.
- **Gen AI**: Google Gemini for data querying.

### Sustainability & Differentiation
- **Decentralization**: Eliminates reliance on centralized entities, ensuring trust and security.
- **Scalability**: Designed to integrate with healthcare networks and pharmacy chains.
- **AI Integration**: Future integration of AI for demand forecasting and automated compliance checks.
- **Data Security**: Provides a verifiable, tamper-proof record without exposing sensitive patient data.
- **Industry First**: Unlike traditional systems, this applies blockchain beyond finance, transforming prescription verification and drug distribution.