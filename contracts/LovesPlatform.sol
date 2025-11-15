// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title LovesPlatform
 * @dev Smart contract for recording consents, verifications, and payments on-chain
 * Stores only cryptographic hashes, not personal data
 */
contract LovesPlatform {
    struct ConsentRecord {
        address user;
        bytes32 consentHash;
        uint256 timestamp;
        bool revoked;
    }

    struct VerificationRecord {
        address user;
        bytes32 verificationHash;
        address verifier;
        uint256 timestamp;
    }

    struct PaymentRecord {
        address user;
        uint256 amount;
        bytes32 txHash;
        uint256 timestamp;
    }

    // Mappings
    mapping(bytes32 => ConsentRecord) public consentRecords;
    mapping(bytes32 => VerificationRecord) public verificationRecords;
    mapping(bytes32 => PaymentRecord) public paymentRecords;
    mapping(address => bytes32[]) public userConsents;
    mapping(address => bytes32[]) public userVerifications;
    mapping(address => bytes32[]) public userPayments;

    // Events
    event ConsentRecorded(
        bytes32 indexed recordId,
        address indexed user,
        bytes32 consentHash,
        uint256 timestamp
    );

    event ConsentRevoked(
        bytes32 indexed recordId,
        address indexed user,
        uint256 timestamp
    );

    event VerificationRecorded(
        bytes32 indexed recordId,
        address indexed user,
        bytes32 verificationHash,
        address verifier,
        uint256 timestamp
    );

    event PaymentRecorded(
        bytes32 indexed recordId,
        address indexed user,
        uint256 amount,
        bytes32 txHash,
        uint256 timestamp
    );

    // Owner (can be set to a multisig in production)
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Record user consent
     * @param user User's wallet address
     * @param consentHash SHA-256 hash of consent data
     * @return recordId Unique identifier for the record
     */
    function recordConsent(
        address user,
        bytes32 consentHash
    ) external onlyOwner returns (bytes32) {
        require(user != address(0), "Invalid user address");
        require(consentHash != bytes32(0), "Invalid consent hash");

        bytes32 recordId = keccak256(
            abi.encodePacked(user, consentHash, block.timestamp, block.number)
        );

        consentRecords[recordId] = ConsentRecord({
            user: user,
            consentHash: consentHash,
            timestamp: block.timestamp,
            revoked: false
        });

        userConsents[user].push(recordId);

        emit ConsentRecorded(recordId, user, consentHash, block.timestamp);

        return recordId;
    }

    /**
     * @dev Revoke a consent record
     * @param recordId Record identifier
     */
    function revokeConsent(bytes32 recordId) external {
        ConsentRecord storage record = consentRecords[recordId];
        require(record.user == msg.sender || msg.sender == owner, "Not authorized");
        require(record.consentHash != bytes32(0), "Record not found");
        require(!record.revoked, "Already revoked");

        record.revoked = true;

        emit ConsentRevoked(recordId, record.user, block.timestamp);
    }

    /**
     * @dev Record verification result
     * @param user User's wallet address
     * @param verificationHash SHA-256 hash of verification data
     * @param verifier Address of the verifier (or zero address if automated)
     * @return recordId Unique identifier for the record
     */
    function recordVerification(
        address user,
        bytes32 verificationHash,
        address verifier
    ) external onlyOwner returns (bytes32) {
        require(user != address(0), "Invalid user address");
        require(verificationHash != bytes32(0), "Invalid verification hash");

        bytes32 recordId = keccak256(
            abi.encodePacked(
                user,
                verificationHash,
                verifier,
                block.timestamp,
                block.number
            )
        );

        verificationRecords[recordId] = VerificationRecord({
            user: user,
            verificationHash: verificationHash,
            verifier: verifier,
            timestamp: block.timestamp
        });

        userVerifications[user].push(recordId);

        emit VerificationRecorded(
            recordId,
            user,
            verificationHash,
            verifier,
            block.timestamp
        );

        return recordId;
    }

    /**
     * @dev Record payment transaction
     * @param user User's wallet address
     * @param amount Payment amount in wei
     * @param txHash Transaction hash of the payment
     * @return recordId Unique identifier for the record
     */
    function recordPayment(
        address user,
        uint256 amount,
        bytes32 txHash
    ) external onlyOwner returns (bytes32) {
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Invalid amount");
        require(txHash != bytes32(0), "Invalid transaction hash");

        bytes32 recordId = keccak256(
            abi.encodePacked(user, amount, txHash, block.timestamp, block.number)
        );

        paymentRecords[recordId] = PaymentRecord({
            user: user,
            amount: amount,
            txHash: txHash,
            timestamp: block.timestamp
        });

        userPayments[user].push(recordId);

        emit PaymentRecorded(recordId, user, amount, txHash, block.timestamp);

        return recordId;
    }

    /**
     * @dev Get consent record
     */
    function getConsentRecord(
        bytes32 recordId
    ) external view returns (ConsentRecord memory) {
        return consentRecords[recordId];
    }

    /**
     * @dev Get verification record
     */
    function getVerificationRecord(
        bytes32 recordId
    ) external view returns (VerificationRecord memory) {
        return verificationRecords[recordId];
    }

    /**
     * @dev Get payment record
     */
    function getPaymentRecord(
        bytes32 recordId
    ) external view returns (PaymentRecord memory) {
        return paymentRecords[recordId];
    }

    /**
     * @dev Get all consent record IDs for a user
     */
    function getUserConsents(
        address user
    ) external view returns (bytes32[] memory) {
        return userConsents[user];
    }

    /**
     * @dev Get all verification record IDs for a user
     */
    function getUserVerifications(
        address user
    ) external view returns (bytes32[] memory) {
        return userVerifications[user];
    }

    /**
     * @dev Get all payment record IDs for a user
     */
    function getUserPayments(
        address user
    ) external view returns (bytes32[] memory) {
        return userPayments[user];
    }

    /**
     * @dev Transfer ownership (for multisig setup)
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        owner = newOwner;
    }
}

