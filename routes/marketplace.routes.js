// routes/marketplace.routes.js
const express = require('express');
const router = express.Router();
const MarketplaceService = require('../server/services/marketplaceService');

let marketplaceService = null;

const getService = () => {
  if (!marketplaceService) {
    marketplaceService = new MarketplaceService();
  }
  return marketplaceService;
};

/**
 * POST /api/marketplace/artisan
 * Create artisan profile
 */
router.post('/artisan', async (req, res, next) => {
  try {
    const artisanData = req.body;
    const service = getService();
    const artisan = await service.createArtisan(artisanData);

    res.json({
      success: true,
      artisan,
      message: 'Artisan profile created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/marketplace/artisans
 * Get artisans
 */
router.get('/artisans', (req, res, next) => {
  try {
    const filters = {
      craft: req.query.craft,
      location: req.query.location,
      verified: req.query.verified === 'true' ? true : 
                req.query.verified === 'false' ? false : undefined,
      search: req.query.search
    };

    const service = getService();
    const artisans = service.getArtisans(filters);

    res.json({
      success: true,
      artisans,
      count: artisans.length,
      filters,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/marketplace/artisan/:artisanId
 * Get artisan by ID
 */
router.get('/artisan/:artisanId', (req, res, next) => {
  try {
    const { artisanId } = req.params;
    const service = getService();
    const artisan = service.getArtisan(artisanId);

    if (!artisan) {
      return res.status(404).json({
        success: false,
        error: 'Artisan not found'
      });
    }

    res.json({
      success: true,
      artisan,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/marketplace/product
 * Create product
 */
router.post('/product', async (req, res, next) => {
  try {
    const { artisanId, productData } = req.body;

    if (!artisanId || !productData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: artisanId, productData'
      });
    }

    const service = getService();
    const product = await service.createProduct(artisanId, productData);

    res.json({
      success: true,
      product,
      message: 'Product created successfully',
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
 * GET /api/marketplace/products
 * Get products
 */
router.get('/products', (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      artisanId: req.query.artisanId,
      craft: req.query.craft,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
      search: req.query.search,
      featured: req.query.featured === 'true' ? true : 
                req.query.featured === 'false' ? false : undefined,
      inStock: req.query.inStock === 'true' ? true : 
                req.query.inStock === 'false' ? false : undefined,
      sortBy: req.query.sortBy
    };

    const service = getService();
    const products = service.getProducts(filters);

    res.json({
      success: true,
      products,
      count: products.length,
      filters,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/marketplace/product/:productId
 * Get product by ID
 */
router.get('/product/:productId', (req, res, next) => {
  try {
    const { productId } = req.params;
    const service = getService();
    const product = service.getProduct(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Get similar products
    const similar = service.getSimilarProducts(productId);
    const artisan = service.getArtisanByProduct(productId);

    res.json({
      success: true,
      product,
      artisan,
      similar,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/marketplace/cart/add
 * Add to cart
 */
router.post('/cart/add', (req, res, next) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, productId'
      });
    }

    const service = getService();
    const cart = service.addToCart(userId, productId, quantity || 1);

    res.json({
      success: true,
      cart,
      message: 'Added to cart successfully',
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
 * DELETE /api/marketplace/cart/remove
 * Remove from cart
 */
router.delete('/cart/remove', (req, res, next) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, productId'
      });
    }

    const service = getService();
    const cart = service.removeFromCart(userId, productId);

    res.json({
      success: true,
      cart,
      message: 'Removed from cart successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/marketplace/cart/:userId
 * Get cart
 */
router.get('/cart/:userId', (req, res, next) => {
  try {
    const { userId } = req.params;
    const service = getService();
    const cart = service.getCart(userId);

    res.json({
      success: true,
      cart,
      total: cart.reduce((sum, item) => sum + item.subtotal, 0),
      count: cart.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/marketplace/order
 * Place order
 */
router.post('/order', async (req, res, next) => {
  try {
    const { userId, orderData } = req.body;

    if (!userId || !orderData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, orderData'
      });
    }

    const service = getService();
    const result = await service.placeOrder(userId, orderData);

    res.json({
      success: true,
      ...result,
      message: 'Order placed successfully',
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
 * GET /api/marketplace/orders/:userId
 * Get user orders
 */
router.get('/orders/:userId', (req, res, next) => {
  try {
    const { userId } = req.params;
    const service = getService();
    const orders = service.getUserOrders(userId);

    res.json({
      success: true,
      orders,
      count: orders.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/marketplace/order/:orderId
 * Get order by ID
 */
router.get('/order/:orderId', (req, res, next) => {
  try {
    const { orderId } = req.params;
    const service = getService();
    const order = service.getOrder(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      order,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/marketplace/order/:orderId/status
 * Update order status
 */
router.put('/order/:orderId/status', (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: status'
      });
    }

    const service = getService();
    const order = service.updateOrderStatus(orderId, status);

    res.json({
      success: true,
      order,
      message: 'Order status updated',
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
 * POST /api/marketplace/review
 * Add review
 */
router.post('/review', (req, res, next) => {
  try {
    const { productId, userId, reviewData } = req.body;

    if (!productId || !userId || !reviewData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: productId, userId, reviewData'
      });
    }

    const service = getService();
    const review = service.addReview(productId, userId, reviewData);

    res.json({
      success: true,
      review,
      message: 'Review added successfully',
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
 * GET /api/marketplace/reviews/:productId
 * Get product reviews
 */
router.get('/reviews/:productId', (req, res, next) => {
  try {
    const { productId } = req.params;
    const service = getService();
    const reviews = service.getProductReviews(productId);

    res.json({
      success: true,
      reviews,
      count: reviews.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/marketplace/categories
 * Get categories
 */
router.get('/categories', (req, res, next) => {
  try {
    const service = getService();
    const categories = service.getCategories();

    res.json({
      success: true,
      categories,
      count: categories.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/marketplace/stats
 * Get marketplace statistics
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
