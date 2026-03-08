const crypto = require('crypto');

// Simulated blockchain log (works without ETH setup)
// When ETHEREUM_RPC_URL and keys are configured, uses real Sepolia testnet
let mockBlockchain = [];
let blockNumber = 1000;

function hashData(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

function generateMockTxHash() {
  return '0x' + crypto.randomBytes(32).toString('hex');
}

async function logToBlockchain(threatData) {
  const logEntry = {
    url: threatData.url,
    domain: threatData.domain,
    riskScore: threatData.riskScore,
    status: threatData.status,
    timestamp: new Date().toISOString(),
    threatTypes: threatData.threatTypes
  };
  const dataHash = hashData(logEntry);

  // Try real blockchain if configured
  if (process.env.ETHEREUM_RPC_URL && 
      process.env.ETHEREUM_RPC_URL !== 'https://sepolia.infura.io/v3/your_infura_project_id' &&
      process.env.BLOCKCHAIN_PRIVATE_KEY &&
      process.env.BLOCKCHAIN_PRIVATE_KEY !== 'your_metamask_private_key_for_sepolia_testnet') {
    try {
      const { ethers } = require('ethers');
      const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
      const wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, provider);
      const tx = await wallet.sendTransaction({
        to: wallet.address,
        value: 0n,
        data: ethers.hexlify(ethers.toUtf8Bytes(JSON.stringify({ hash: dataHash, status: threatData.status, score: threatData.riskScore }))),
        gasLimit: 100000n
      });
      const receipt = await tx.wait();
      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        network: 'Ethereum Sepolia Testnet',
        dataHash,
        real: true
      };
    } catch (e) {
      console.log('Real blockchain failed, using simulation:', e.message);
    }
  }

  // Simulated blockchain
  blockNumber++;
  const txHash = generateMockTxHash();
  const block = {
    blockNumber,
    txHash,
    dataHash,
    data: logEntry,
    previousHash: mockBlockchain.length > 0 ? mockBlockchain[mockBlockchain.length - 1].dataHash : '0x0',
    timestamp: Date.now()
  };
  mockBlockchain.push(block);

  return {
    success: true,
    txHash,
    blockNumber,
    network: 'LinkCortexa Simulated Chain (Dev)',
    dataHash,
    real: false
  };
}

function getBlockchainLogs(limit = 50) {
  return mockBlockchain.slice(-limit).reverse();
}

function verifyLog(txHash) {
  const entry = mockBlockchain.find(b => b.txHash === txHash);
  if (!entry) return { valid: false, message: 'Transaction not found' };
  const expectedHash = hashData(entry.data);
  return {
    valid: expectedHash === entry.dataHash,
    txHash,
    blockNumber: entry.blockNumber,
    dataHash: entry.dataHash,
    timestamp: entry.timestamp
  };
}

module.exports = { logToBlockchain, getBlockchainLogs, verifyLog, hashData };
