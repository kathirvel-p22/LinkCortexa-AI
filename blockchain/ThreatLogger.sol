// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title LinkCortexa Threat Logger
/// @notice Tamper-proof threat logging on Ethereum Sepolia Testnet
/// @dev Deploy on Sepolia testnet using Remix IDE (free)
contract ThreatLogger {
    address public owner;
    uint256 public totalLogs;

    struct ThreatLog {
        uint256 id;
        string dataHash;        // SHA-256 hash of threat data
        string status;          // safe | suspicious | phishing | malware
        uint8 riskScore;        // 0-100
        uint256 timestamp;
        address reporter;
    }

    mapping(uint256 => ThreatLog) public logs;
    mapping(string => bool) public hashExists;

    event ThreatLogged(uint256 indexed id, string dataHash, string status, uint8 riskScore, uint256 timestamp);

    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }

    constructor() { owner = msg.sender; }

    function logThreat(string memory dataHash, string memory status, uint8 riskScore) external returns (uint256) {
        require(!hashExists[dataHash], "Hash already logged");
        require(riskScore <= 100, "Risk score must be 0-100");
        
        uint256 id = ++totalLogs;
        logs[id] = ThreatLog(id, dataHash, status, riskScore, block.timestamp, msg.sender);
        hashExists[dataHash] = true;
        
        emit ThreatLogged(id, dataHash, status, riskScore, block.timestamp);
        return id;
    }

    function verifyLog(uint256 id, string memory dataHash) external view returns (bool) {
        return keccak256(bytes(logs[id].dataHash)) == keccak256(bytes(dataHash));
    }

    function getLog(uint256 id) external view returns (ThreatLog memory) {
        return logs[id];
    }

    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }
}
