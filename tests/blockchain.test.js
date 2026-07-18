const assert = require('assert');
const BlockchainService = require('../server/services/blockchainService');

console.log('🧪 Starting BlockchainService unit tests...');

const service = new BlockchainService();

// Test 1: Genesis Block Creation
console.log('- Testing Genesis Block...');
const chain = service.getBlockchain();
assert.strictEqual(chain.length > 0, true, 'Blockchain should not be empty');
assert.strictEqual(chain[0].index, 0, 'First block should be index 0');
assert.strictEqual(chain[0].previousHash, '0', 'Genesis block previous hash should be 0');

// Test 2: Calculate Hash
console.log('- Testing Hash Calculation...');
const hash1 = service.calculateHash(1, 'prev_hash', [{ from: 'alice', to: 'bob', amount: 50 }]);
const hash2 = service.calculateHash(1, 'prev_hash', [{ from: 'alice', to: 'bob', amount: 50 }]);
assert.strictEqual(hash1, hash2, 'Hash calculation must be deterministic');

// Test 3: Add Transactions and Create Block
console.log('- Testing Block Creation...');
const initialPendingLength = service.pendingTransactions.length;
const tx1 = { id: 'tx_1', from: 'system', to: 'user1', type: 'award', amount: 10 };
service.addTransaction(tx1);

const pending = service.pendingTransactions;
assert.strictEqual(pending.length, initialPendingLength + 1, 'Pending transactions should increase by 1');

const block = service.createBlock(pending, 'validator_node_1');
assert.strictEqual(block.index, chain.length - 1, 'New block index should match current chain tip');
assert.strictEqual(block.transactions.length, pending.length, 'Block should contain the pending transactions');
assert.strictEqual(block.validator, 'validator_node_1', 'Validator node should match');

// Test 4: Chain Integrity verification
console.log('- Testing Blockchain Integrity Verification...');
const validationResult = service.validateBlockchain();
assert.strictEqual(validationResult.valid, true, 'Blockchain should be valid');

// Test 5: Mining block simulation
console.log('- Testing Block Mining Simulation...');
const nonce = service.mineBlock(block.hash, []);
assert.strictEqual(typeof nonce, 'number', 'Nonce should be a number');

// Test 6: NFT listings and retrieval
console.log('- Testing NFT Lifecycle...');
const nfts = service.getAllNFTs();
assert.strictEqual(nfts.length > 0, true, 'Should load sample NFTs');

const testNft = nfts[0];
const initialPrice = testNft.price;
service.listNFTForSale(testNft.tokenId, initialPrice * 2);

const updatedNft = service.getNFT(testNft.tokenId);
assert.strictEqual(updatedNft.price, initialPrice * 2, 'NFT price should be updated on listing');

// Test 7: Wallet ownership queries
console.log('- Testing Wallet Ownership queries...');
const ownerNFTs = service.getNFTsByOwner(testNft.owner || testNft.creator);
assert.strictEqual(Array.isArray(ownerNFTs), true, 'Should return array of owned NFTs');

// Test 8: Stats and Distribution calculations
console.log('- Testing Stats Generation...');
const stats = service.getStats();
assert.strictEqual(stats.totalBlocks, chain.length, 'Total blocks count should match chain length');
assert.strictEqual(stats.totalNFTs, nfts.length, 'Total NFTs count should match loaded NFTs');

const categories = service.getCategoryDistribution();
assert.strictEqual(typeof categories, 'object', 'Category distribution should be an object');

console.log('✅ All BlockchainService tests passed successfully!');
