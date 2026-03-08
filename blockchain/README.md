# LinkCortexa Blockchain Smart Contract

## Deploy to Ethereum Sepolia Testnet (FREE)

### Step 1: Get Free Test ETH
1. Go to https://sepoliafaucet.com
2. Paste your MetaMask wallet address
3. Receive free Sepolia ETH (no real money needed)

### Step 2: Deploy Contract (Remix IDE - Free)
1. Go to https://remix.ethereum.org
2. Create new file: ThreatLogger.sol
3. Paste the smart contract code
4. Compile with Solidity 0.8.19+
5. In "Deploy & Run" tab: select "Injected Provider - MetaMask"
6. Connect MetaMask to Sepolia network
7. Click Deploy
8. Copy the deployed contract address

### Step 3: Configure Backend
In backend/.env:
```
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_ID
BLOCKCHAIN_PRIVATE_KEY=your_metamask_private_key
SMART_CONTRACT_ADDRESS=deployed_contract_address
```

### Get Free Infura RPC
1. Go to https://infura.io (free account)
2. Create new project
3. Copy Sepolia RPC URL

## How it Works
Every threat detected → SHA-256 hash generated → Logged on-chain → Transaction hash returned → Stored permanently
