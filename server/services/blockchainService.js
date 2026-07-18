// services/blockchainService.js
const { v4: uuidv4 } = require('uuid');
const store = require('../../data/store');

class BlockchainService {
  constructor() {
    this.blockchain = [];
    this.nfts = [];
    this.transactions = [];
    this.wallets = new Map();
    this.smartContracts = [];
    this.validators = [];
    this.pendingTransactions = [];
    
    this.init();
  }

  init() {
    this.createGenesisBlock();
    this.loadSampleNFTs();
    this.loadSmartContracts();
    console.log('✅ Blockchain Service initialized');
  }

  /**
   * Create genesis block
   */
  createGenesisBlock() {
    const genesisBlock = {
      id: 'block_0',
      index: 0,
      timestamp: new Date().toISOString(),
      transactions: [],
      previousHash: '0',
      hash: this.calculateHash(0, '0', []),
      validator: 'genesis',
      nonce: 0,
      size: 0
    };
    
    this.blockchain.push(genesisBlock);
    console.log('🔗 Genesis block created');
  }

  /**
   * Calculate hash
   */
  calculateHash(index, previousHash, transactions) {
    const data = `${index}${previousHash}${JSON.stringify(transactions)}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  /**
   * Create new block
   */
  createBlock(transactions, validator) {
    const previousBlock = this.blockchain[this.blockchain.length - 1];
    const newBlock = {
      id: `block_${this.blockchain.length}`,
      index: this.blockchain.length,
      timestamp: new Date().toISOString(),
      transactions: transactions,
      previousHash: previousBlock.hash,
      hash: this.calculateHash(this.blockchain.length, previousBlock.hash, transactions),
      validator: validator || 'community',
      nonce: this.mineBlock(previousBlock.hash, transactions),
      size: JSON.stringify(transactions).length
    };
    
    this.blockchain.push(newBlock);
    return newBlock;
  }

  /**
   * Mine block (Proof of Stake simulation)
   */
  mineBlock(previousHash, transactions) {
    // Simplified mining for demo
    let nonce = 0;
    while (nonce < 1000) {
      const hash = this.calculateHash(
        this.blockchain.length,
        previousHash,
        transactions
      );
      if (hash.startsWith('0')) {
        return nonce;
      }
      nonce++;
    }
    return nonce;
  }

  /**
   * Load sample NFTs
   */
  loadSampleNFTs() {
    this.nfts = [
      {
        id: 'nft_1',
        tokenId: 'HERITAGE_001',
        name: 'Ancient Kantha Embroidery',
        description: 'Traditional Kantha embroidery artifact from 1800s',
        category: 'textile',
        creator: 'artisan_1',
        owner: 'artisan_1',
        metadata: {
          image: 'https://via.placeholder.com/500',
          attributes: [
            { trait_type: 'Era', value: '19th Century' },
            { trait_type: 'Region', value: 'West Bengal' },
            { trait_type: 'Technique', value: 'Kantha Stitch' },
            { trait_type: 'Rarity', value: 'Rare' }
          ],
          provenance: 'Passed down through 5 generations',
          cultural_significance: 'Traditional Bengali embroidery technique'
        },
        mintedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        price: 2.5, // ETH equivalent
        royaltyPercentage: 10,
        status: 'available',
        verified: true,
        verificationHistory: [
          { validator: 'expert_1', timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
          { validator: 'expert_2', timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() }
        ]
      },
      {
        id: 'nft_2',
        tokenId: 'HERITAGE_002',
        name: 'Dokra Metal Sculpture',
        description: 'Traditional Dokra metal casting sculpture',
        category: 'metal_art',
        creator: 'artisan_2',
        owner: 'artisan_2',
        metadata: {
          image: 'https://via.placeholder.com/500',
          attributes: [
            { trait_type: 'Era', value: '18th Century' },
            { trait_type: 'Region', value: 'Odisha' },
            { trait_type: 'Technique', value: 'Lost Wax Casting' },
            { trait_type: 'Rarity', value: 'Legendary' }
          ],
          provenance: 'Found in archaeological site',
          cultural_significance: 'One of the oldest metal casting techniques'
        },
        mintedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        price: 5.0,
        royaltyPercentage: 15,
        status: 'available',
        verified: true,
        verificationHistory: [
          { validator: 'expert_1', timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() }
        ]
      },
      {
        id: 'nft_3',
        tokenId: 'HERITAGE_003',
        name: 'Madhubani Painting - Peacock',
        description: 'Traditional Madhubani painting featuring peacock motif',
        category: 'painting',
        creator: 'artisan_3',
        owner: 'artisan_3',
        metadata: {
          image: 'https://via.placeholder.com/500',
          attributes: [
            { trait_type: 'Era', value: '20th Century' },
            { trait_type: 'Region', value: 'Bihar' },
            { trait_type: 'Technique', value: 'Madhubani Art' },
            { trait_type: 'Rarity', value: 'Epic' }
          ],
          provenance: 'Artist created in 1985',
          cultural_significance: 'Traditional folk art of Mithila region'
        },
        mintedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        price: 3.0,
        royaltyPercentage: 10,
        status: 'available',
        verified: true,
        verificationHistory: []
      }
    ];

    // Add to blockchain
    this.nfts.forEach(nft => {
      this.addTransaction({
        type: 'NFT_MINT',
        tokenId: nft.tokenId,
        data: nft,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Load smart contracts
   */
  loadSmartContracts() {
    this.smartContracts = [
      {
        id: 'contract_1',
        name: 'Heritage NFT Contract',
        type: 'ERC-721',
        address: '0xHERITAGE123',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        functions: ['mint', 'transfer', 'burn', 'verify', 'royalty'],
        active: true,
        version: '1.0.0'
      },
      {
        id: 'contract_2',
        name: 'Artisan Royalty Contract',
        type: 'ERC-2981',
        address: '0xROYALTY456',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        functions: ['setRoyalty', 'getRoyalty', 'payRoyalty'],
        active: true,
        version: '1.0.0'
      },
      {
        id: 'contract_3',
        name: 'Cultural Exchange Contract',
        type: 'Custom',
        address: '0xEXCHANGE789',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        functions: ['exchange', 'trade', 'collaborate'],
        active: true,
        version: '0.9.0'
      }
    ];
  }

  /**
   * Mint NFT
   */
  async mintNFT(artifactData, userId) {
    console.log(`🎨 Minting NFT for artifact: ${artifactData.name}`);

    const nft = {
      id: `nft_${Date.now()}_${uuidv4().slice(0, 8)}`,
      tokenId: `HERITAGE_${String(this.nfts.length + 1).padStart(3, '0')}`,
      name: artifactData.name,
      description: artifactData.description,
      category: artifactData.category || 'cultural_artifact',
      creator: userId,
      owner: userId,
      metadata: {
        image: artifactData.image || 'https://via.placeholder.com/500',
        attributes: artifactData.attributes || [],
        provenance: artifactData.provenance || 'Digital heritage artifact',
        cultural_significance: artifactData.cultural_significance || 'Cultural heritage'
      },
      mintedAt: new Date().toISOString(),
      price: artifactData.price || 1.0,
      royaltyPercentage: artifactData.royaltyPercentage || 10,
      status: 'available',
      verified: false,
      verificationHistory: []
    };

    // Add to NFTs
    this.nfts.push(nft);

    // Add to blockchain
    this.addTransaction({
      type: 'NFT_MINT',
      tokenId: nft.tokenId,
      data: nft,
      userId,
      timestamp: new Date().toISOString()
    });

    // Create block
    this.createBlock(
      [{ type: 'NFT_MINT', tokenId: nft.tokenId, userId }],
      'system'
    );

    return nft;
  }

  /**
   * Verify NFT authenticity
   */
  async verifyNFT(tokenId, validatorId) {
    const nft = this.nfts.find(n => n.tokenId === tokenId);
    if (!nft) {
      throw new Error('NFT not found');
    }

    nft.verified = true;
    nft.verificationHistory.push({
      validator: validatorId,
      timestamp: new Date().toISOString()
    });

    // Add to blockchain
    this.addTransaction({
      type: 'NFT_VERIFY',
      tokenId,
      validator: validatorId,
      timestamp: new Date().toISOString()
    });

    return nft;
  }

  /**
   * Transfer NFT ownership
   */
  async transferNFT(tokenId, fromUserId, toUserId) {
    const nft = this.nfts.find(n => n.tokenId === tokenId);
    if (!nft) {
      throw new Error('NFT not found');
    }

    if (nft.owner !== fromUserId) {
      throw new Error('Not the owner');
    }

    nft.owner = toUserId;
    nft.status = 'transferred';
    nft.transferredAt = new Date().toISOString();

    // Add to blockchain
    this.addTransaction({
      type: 'NFT_TRANSFER',
      tokenId,
      from: fromUserId,
      to: toUserId,
      timestamp: new Date().toISOString()
    });

    return nft;
  }

  /**
   * List NFT for sale
   */
  listNFTForSale(tokenId, price) {
    const nft = this.nfts.find(n => n.tokenId === tokenId);
    if (!nft) {
      throw new Error('NFT not found');
    }

    nft.price = price;
    nft.status = 'listed';
    nft.listedAt = new Date().toISOString();

    this.addTransaction({
      type: 'NFT_LIST',
      tokenId,
      price,
      timestamp: new Date().toISOString()
    });

    return nft;
  }

  /**
   * Buy NFT
   */
  async buyNFT(tokenId, buyerId, amount) {
    const nft = this.nfts.find(n => n.tokenId === tokenId);
    if (!nft) {
      throw new Error('NFT not found');
    }

    if (nft.status !== 'listed') {
      throw new Error('NFT not for sale');
    }

    if (amount < nft.price) {
      throw new Error('Insufficient funds');
    }

    const sellerId = nft.owner;
    const royaltyAmount = (amount * nft.royaltyPercentage) / 100;
    const sellerAmount = amount - royaltyAmount;

    // Transfer NFT
    await this.transferNFT(tokenId, sellerId, buyerId);

    // Pay royalty (simulated)
    await this.payRoyalty(tokenId, nft.creator, royaltyAmount);

    // Create transaction
    const transaction = {
      id: `txn_${Date.now()}_${uuidv4().slice(0, 8)}`,
      type: 'NFT_PURCHASE',
      tokenId,
      buyer: buyerId,
      seller: sellerId,
      amount,
      royaltyAmount,
      sellerAmount,
      timestamp: new Date().toISOString()
    };

    this.transactions.push(transaction);

    // Add to blockchain
    this.addTransaction(transaction);

    return { transaction, nft };
  }

  /**
   * Pay royalty
   */
  async payRoyalty(tokenId, creatorId, amount) {
    // In production: actual crypto transaction
    console.log(`💸 Paying ${amount} ETH royalty to ${creatorId} for ${tokenId}`);
    
    const royaltyPayment = {
      tokenId,
      to: creatorId,
      amount,
      timestamp: new Date().toISOString()
    };

    this.transactions.push({
      id: `royalty_${Date.now()}`,
      type: 'ROYALTY_PAYMENT',
      ...royaltyPayment
    });

    return royaltyPayment;
  }

  /**
   * Get NFT by token ID
   */
  getNFT(tokenId) {
    return this.nfts.find(n => n.tokenId === tokenId);
  }

  /**
   * Get NFTs by owner
   */
  getNFTsByOwner(ownerId) {
    return this.nfts.filter(n => n.owner === ownerId);
  }

  /**
   * Get NFTs by creator
   */
  getNFTsByCreator(creatorId) {
    return this.nfts.filter(n => n.creator === creatorId);
  }

  /**
   * Get all NFTs
   */
  getAllNFTs(filters = {}) {
    let filtered = [...this.nfts];

    if (filters.category) {
      filtered = filtered.filter(n => n.category === filters.category);
    }

    if (filters.status) {
      filtered = filtered.filter(n => n.status === filters.status);
    }

    if (filters.verified !== undefined) {
      filtered = filtered.filter(n => n.verified === filters.verified);
    }

    if (filters.minPrice) {
      filtered = filtered.filter(n => n.price >= filters.minPrice);
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(n => n.price <= filters.maxPrice);
    }

    return filtered;
  }

  /**
   * Get blockchain
   */
  getBlockchain() {
    return this.blockchain;
  }

  /**
   * Get block by index
   */
  getBlock(index) {
    return this.blockchain[index];
  }

  /**
   * Get latest block
   */
  getLatestBlock() {
    return this.blockchain[this.blockchain.length - 1];
  }

  /**
   * Add transaction
   */
  addTransaction(transaction) {
    this.pendingTransactions.push(transaction);
    
    // If we have 5 pending transactions, create a block
    if (this.pendingTransactions.length >= 5) {
      this.createBlock(this.pendingTransactions, 'miner');
      this.pendingTransactions = [];
    }
  }

  /**
   * Get transactions
   */
  getTransactions(filters = {}) {
    let transactions = [...this.transactions];

    if (filters.type) {
      transactions = transactions.filter(t => t.type === filters.type);
    }

    if (filters.userId) {
      transactions = transactions.filter(t => 
        t.userId === filters.userId || 
        t.from === filters.userId || 
        t.to === filters.userId ||
        t.buyer === filters.userId ||
        t.seller === filters.userId
      );
    }

    return transactions;
  }

  /**
   * Get smart contracts
   */
  getSmartContracts() {
    return this.smartContracts;
  }

  /**
   * Deploy smart contract
   */
  deploySmartContract(contractData) {
    const contract = {
      id: `contract_${Date.now()}`,
      ...contractData,
      address: `0x${uuidv4().replace(/-/g, '').toUpperCase().slice(0, 10)}`,
      createdAt: new Date().toISOString(),
      active: true,
      version: contractData.version || '1.0.0'
    };

    this.smartContracts.push(contract);
    return contract;
  }

  /**
   * Get blockchain statistics
   */
  getStats() {
    const totalNFTs = this.nfts.length;
    const verifiedNFTs = this.nfts.filter(n => n.verified).length;
    const listedNFTs = this.nfts.filter(n => n.status === 'listed').length;
    const totalTransactions = this.transactions.length;
    const totalBlocks = this.blockchain.length;

    // Calculate total value
    const totalValue = this.nfts.reduce((sum, n) => sum + (n.price || 0), 0);

    // Get top NFTs
    const topNFTs = [...this.nfts]
      .sort((a, b) => b.price - a.price)
      .slice(0, 5);

    return {
      totalBlocks,
      totalNFTs,
      verifiedNFTs,
      listedNFTs,
      totalTransactions,
      totalValue,
      averagePrice: totalNFTs > 0 ? totalValue / totalNFTs : 0,
      topNFTs,
      categories: this.getCategoryDistribution(),
      blockchainSize: this.calculateBlockchainSize(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get category distribution
   */
  getCategoryDistribution() {
    const distribution = {};
    this.nfts.forEach(nft => {
      distribution[nft.category] = (distribution[nft.category] || 0) + 1;
    });
    return distribution;
  }

  /**
   * Calculate blockchain size
   */
  calculateBlockchainSize() {
    let size = 0;
    this.blockchain.forEach(block => {
      size += block.size || JSON.stringify(block).length;
    });
    return size;
  }

  /**
   * Validate blockchain
   */
  validateBlockchain() {
    for (let i = 1; i < this.blockchain.length; i++) {
      const current = this.blockchain[i];
      const previous = this.blockchain[i - 1];

      // Check hash
      const calculatedHash = this.calculateHash(
        current.index,
        previous.hash,
        current.transactions
      );

      if (current.hash !== calculatedHash) {
        return {
          valid: false,
          error: `Invalid hash at block ${i}`,
          block: current
        };
      }

      // Check previous hash
      if (current.previousHash !== previous.hash) {
        return {
          valid: false,
          error: `Invalid previous hash at block ${i}`,
          block: current
        };
      }
    }

    return { valid: true, message: 'Blockchain is valid' };
  }

  /**
   * Get blockchain explorer data
   */
  getExplorerData() {
    return {
      blocks: this.blockchain.map(block => ({
        ...block,
        transactionsCount: block.transactions.length,
        size: JSON.stringify(block).length
      })),
      totalBlocks: this.blockchain.length,
      totalTransactions: this.transactions.length,
      totalNFTs: this.nfts.length,
      lastBlock: this.getLatestBlock()
    };
  }
}

module.exports = BlockchainService;
