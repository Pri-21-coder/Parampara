// routes/blockchain.routes.js
const express = require('express');
const router = express.Router();
const BlockchainService = require('../server/services/blockchainService');

let blockchainService = null;

const getService = () => {
  if (!blockchainService) {
    blockchainService = new BlockchainService();
  }
  return blockchainService;
};

/**
 * POST /api/blockchain/nft/mint
 * Mint NFT
 */
router.post('/nft/mint', async (req, res, next) => {
  try {
    const { artifactData, userId } = req.body;

    if (!artifactData || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: artifactData, userId'
      });
    }

    const service = getService();
    const nft = await service.mintNFT(artifactData, userId);

    res.json({
      success: true,
      nft,
      message: 'NFT minted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/blockchain/nft/verify
 * Verify NFT
 */
router.post('/nft/verify', async (req, res, next) => {
  try {
    const { tokenId, validatorId } = req.body;

    if (!tokenId || !validatorId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: tokenId, validatorId'
      });
    }

    const service = getService();
    const nft = await service.verifyNFT(tokenId, validatorId);

    res.json({
      success: true,
      nft,
      message: 'NFT verified successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/blockchain/nft/transfer
 * Transfer NFT
 */
router.post('/nft/transfer', async (req, res, next) => {
  try {
    const { tokenId, fromUserId, toUserId } = req.body;

    if (!tokenId || !fromUserId || !toUserId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: tokenId, fromUserId, toUserId'
      });
    }

    const service = getService();
    const nft = await service.transferNFT(tokenId, fromUserId, toUserId);

    res.json({
      success: true,
      nft,
      message: 'NFT transferred successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/blockchain/nft/list
 * List NFT for sale
 */
router.post('/nft/list', (req, res, next) => {
  try {
    const { tokenId, price } = req.body;

    if (!tokenId || !price) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: tokenId, price'
      });
    }

    const service = getService();
    const nft = service.listNFTForSale(tokenId, price);

    res.json({
      success: true,
      nft,
      message: 'NFT listed for sale',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/blockchain/nft/buy
 * Buy NFT
 */
router.post('/nft/buy', async (req, res, next) => {
  try {
    const { tokenId, buyerId, amount } = req.body;

    if (!tokenId || !buyerId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: tokenId, buyerId, amount'
      });
    }

    const service = getService();
    const result = await service.buyNFT(tokenId, buyerId, amount);

    res.json({
      success: true,
      ...result,
      message: 'NFT purchased successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/blockchain/nfts
 * Get all NFTs
 */
router.get('/nfts', (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      status: req.query.status,
      verified: req.query.verified === 'true' ? true : 
                req.query.verified === 'false' ? false : undefined,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null
    };

    const service = getService();
    const nfts = service.getAllNFTs(filters);

    res.json({
      success: true,
      nfts,
      count: nfts.length,
      filters,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/blockchain/nft/:tokenId
 * Get NFT by token ID
 */
router.get('/nft/:tokenId', (req, res, next) => {
  try {
    const { tokenId } = req.params;
    const service = getService();
    const nft = service.getNFT(tokenId);

    if (!nft) {
      return res.status(404).json({
        success: false,
        error: 'NFT not found'
      });
    }

    res.json({
      success: true,
      nft,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/blockchain/nfts/owner/:ownerId
 * Get NFTs by owner
 */
router.get('/nfts/owner/:ownerId', (req, res, next) => {
  try {
    const { ownerId } = req.params;
    const service = getService();
    const nfts = service.getNFTsByOwner(ownerId);

    res.json({
      success: true,
      nfts,
      count: nfts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/blockchain/nfts/creator/:creatorId
 * Get NFTs by creator
 */
router.get('/nfts/creator/:creatorId', (req, res, next) => {
  try {
    const { creatorId } = req.params;
    const service = getService();
    const nfts = service.getNFTsByCreator(creatorId);

    res.json({
      success: true,
      nfts,
      count: nfts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/blockchain/blockchain
 * Get entire blockchain
 */
router.get('/blockchain', (req, res, next) => {
  try {
    const service = getService();
    const blockchain = service.getBlockchain();

    res.json({
      success: true,
      blockchain,
      count: blockchain.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/blockchain/block/:index
 * Get block by index
 */
router.get('/block/:index', (req, res, next) => {
  try {
    const { index } = req.params;
    const service = getService();
    const block = service.getBlock(parseInt(index));

    if (!block) {
      return res.status(404).json({
        success: false,
        error: 'Block not found'
      });
    }

    res.json({
      success: true,
      block,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/blockchain/transactions
 * Get transactions
 */
router.get('/transactions', (req, res, next) => {
  try {
    const filters = {
      type: req.query.type,
      userId: req.query.userId
    };

    const service = getService();
    const transactions = service.getTransactions(filters);

    res.json({
      success: true,
      transactions,
      count: transactions.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/blockchain/contracts
 * Get smart contracts
 */
router.get('/contracts', (req, res, next) => {
  try {
    const service = getService();
    const contracts = service.getSmartContracts();

    res.json({
      success: true,
      contracts,
      count: contracts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/blockchain/contracts/deploy
 * Deploy smart contract
 */
router.post('/contracts/deploy', (req, res, next) => {
  try {
    const contractData = req.body;
    const service = getService();
    const contract = service.deploySmartContract(contractData);

    res.json({
      success: true,
      contract,
      message: 'Smart contract deployed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/blockchain/validate
 * Validate blockchain
 */
router.get('/validate', (req, res, next) => {
  try {
    const service = getService();
    const validation = service.validateBlockchain();

    res.json({
      success: true,
      validation,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/blockchain/explorer
 * Get blockchain explorer data
 */
router.get('/explorer', (req, res, next) => {
  try {
    const service = getService();
    const data = service.getExplorerData();

    res.json({
      success: true,
      ...data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/blockchain/stats
 * Get blockchain statistics
 */
router.get('/stats', (req, res, next) => {
  try {
    const service = getService();
    const stats = service.getStats();

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;