const { SuiClient, getFullnodeUrl } = require("@mysten/sui/client");
const { WalrusClient } = require('@mysten/walrus');
const { SealClient, SessionKey } = require('@mysten/seal');
const { Transaction } = require('@mysten/sui/transactions');
const { Ed25519Keypair } = require('@mysten/sui/keypairs/ed25519');
const { webcrypto } = require('crypto');
globalThis.crypto = webcrypto;


// bootstrap.js (or put at the very top of your existing file)

// 1) Ensure Web Crypto API exists (Node >= 18 has webcrypto)
// If running in Node, expose webcrypto as globalThis.crypto
if (typeof globalThis.crypto === "undefined") {
  try {
    // Node's built-in webcrypto
    const { webcrypto } = require("crypto");
    globalThis.crypto = webcrypto;
  } catch (err) {
    // fallback - if no webcrypto available, warn (you should upgrade Node)
    console.warn("No webcrypto available. Upgrade Node to >=18 or provide a crypto polyfill.");
  }
}

// 2) Polyfill Array.prototype.toReversed if missing (ES2023)
if (typeof Array.prototype.toReversed !== "function") {
  Object.defineProperty(Array.prototype, "toReversed", {
    configurable: true,
    writable: true,
    enumerable: false,
    value: function () {
      // return a shallow copy reversed, don't mutate original
      // use slice to handle array-like objects
      return Array.prototype.slice.call(this).reverse();
    },
  });
}

// 3) (Optional) polyfill other newer Array methods if you hit them later.
// e.g. toSorted, toSpliced... same pattern can be used.





async function sealWalrusIntegration() {
  console.log("Starting sealWalrusIntegration");
  const privateKey = "suiprivkey1qpqywg8f9kdhcfs3j23l0g0ejljxdawmxkjyypfs58ggzuj5j5hhxy7gaex";

  // Initialize clients
  const suiClient = new SuiClient({
    url: getFullnodeUrl('testnet')
  });

  const walrusClient = new WalrusClient({
    network: 'testnet',
    suiClient: suiClient
  });

  // Create keypair
  const keypair = Ed25519Keypair.fromSecretKey(privateKey);
  const userAddress = keypair.getPublicKey().toSuiAddress();

  console.log('Using address:', userAddress);

  // Initialize Seal client
  const serverObjectIds = [
    '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75',
    '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8',
    '0x6068c0acb197dddbacd4746a9de7f025b2ed5a5b6c1b1ab44dade4426d141da2',
  ];
  const sealClient = new SealClient({
    suiClient,
    serverConfigs: serverObjectIds.map((id) => ({
      objectId: id,
      weight: .1,
    })),
    verifyKeyServers: false,
  });

  // Seal configuration
  const packageId = '0x312ffd6d30c8e7c3bd3a2d369fcab323bcd05a7ad3509d189b8f7abcd26662fa';
  const id = '77616c7275732d7365616c2d696e746567726174696f6e'; // hex encoded "walrus-seal-integration"
  const accessControlId = '0x3825e23fb40d5697fd4b11e3f307e32349c5e3a6daf66a452b71661d2b6119b1';

  // Step 1: Create sensitive data to encrypt
  const sensitiveData = {
    message: 'This is highly sensitive data that should be encrypted!',
    timestamp: new Date().toISOString(),
    userId: 'user123',
    secretKey: 'super-secret-key-12345',
    metadata: {
      priority: 'high',
      category: 'confidential',
      tags: ['private', 'encrypted', 'walrus']
    }
  };

  const dataToEncrypt = new TextEncoder().encode(JSON.stringify(sensitiveData, null, 2));
  
  console.log('Original sensitive data size:', dataToEncrypt.length, 'bytes');
  console.log('Original data:', JSON.stringify(sensitiveData, null, 2));

  // Step 2: Encrypt data with Seal
  console.log('\n--- Step 1: Encrypting with Seal ---');
  const { encryptedObject: encryptedBytes, key: backupKey } = await sealClient.encrypt({
    threshold: 3,
    packageId: packageId,
    id: id,
    data: dataToEncrypt,
  });

  console.log('Seal encryption successful!');
  console.log('Encrypted data size:', encryptedBytes.length, 'bytes');
  console.log('Backup key:', backupKey);

  

  console.log('Data retrieved from Walrus successfully!');

  // Step 5: Demonstrate decryption setup (note: actual decryption may fail on testnet)