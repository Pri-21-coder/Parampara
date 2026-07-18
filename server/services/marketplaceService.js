// services/marketplaceService.js
const store = require('../../data/store');
const { v4: uuidv4 } = require('uuid');

class MarketplaceService {
  constructor() {
    this.artisans = [];
    this.products = [];
    this.orders = [];
    this.reviews = [];
    this.categories = [];
    this.transactions = [];
    this.cart = new Map();
    
    this.init();
  }

  init() {
    this.loadCategories();
    this.loadSampleArtisans();
    this.loadSampleProducts();
    console.log('✅ Marketplace Service initialized');
  }

  loadCategories() {
    this.categories = [
      { id: 'cat_1', name: 'Textiles', icon: '🧵', description: 'Traditional fabrics and garments' },
      { id: 'cat_2', name: 'Pottery', icon: '🏺', description: 'Handcrafted pottery and ceramics' },
      { id: 'cat_3', name: 'Jewelry', icon: '💎', description: 'Traditional ornaments and jewelry' },
      { id: 'cat_4', name: 'Paintings', icon: '🎨', description: 'Folk and traditional paintings' },
      { id: 'cat_5', name: 'Woodcraft', icon: '🪵', description: 'Wooden artifacts and furniture' },
      { id: 'cat_6', name: 'Metal Craft', icon: '🔨', description: 'Metal artifacts and sculptures' },
      { id: 'cat_7', name: 'Handicrafts', icon: '✋', description: 'Various handicraft items' },
      { id: 'cat_8', name: 'Home Decor', icon: '🏠', description: 'Decorative items for home' },
      { id: 'cat_9', name: 'Accessories', icon: '🧣', description: 'Accessories and fashion items' },
      { id: 'cat_10', name: 'Art & Sculptures', icon: '🗿', description: 'Art pieces and sculptures' }
    ];
  }

  loadSampleArtisans() {
    this.artisans = [
      {
        id: 'artisan_1',
        name: 'Lakshmi Devi',
        bio: 'Master Kantha embroidery artist with 30 years of experience',
        location: 'West Bengal',
        craft: 'Kantha Embroidery',
        yearsExperience: 30,
        rating: 4.9,
        totalProducts: 12,
        totalSales: 245,
        verified: true,
        badges: ['master_craftsman', 'heritage_artist'],
        profileImage: 'https://via.placeholder.com/200',
        story: 'Lakshmi learned Kantha embroidery from her grandmother...',
        socialMedia: { instagram: '@lakshmi_kantha', facebook: 'lakshmi.kantha' },
        contact: { email: 'lakshmi@example.com', phone: '+91 9876543210' },
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'artisan_2',
        name: 'Ravi Kumar',
        bio: 'Traditional Dokra metal casting artisan',
        location: 'Odisha',
        craft: 'Dokra Metal Casting',
        yearsExperience: 25,
        rating: 4.8,
        totalProducts: 8,
        totalSales: 180,
        verified: true,
        badges: ['master_craftsman', 'heritage_artist'],
        profileImage: 'https://via.placeholder.com/200',
        story: 'Ravi comes from a family of Dokra artisans...',
        socialMedia: { instagram: '@ravi_dokra', facebook: 'ravi.dokra' },
        contact: { email: 'ravi@example.com', phone: '+91 9876543211' },
        createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'artisan_3',
        name: 'Priya Sharma',
        bio: 'Madhubani painting artist',
        location: 'Bihar',
        craft: 'Madhubani Painting',
        yearsExperience: 20,
        rating: 4.7,
        totalProducts: 15,
        totalSales: 210,
        verified: true,
        badges: ['heritage_artist'],
        profileImage: 'https://via.placeholder.com/200',
        story: 'Priya started painting at the age of 10...',
        socialMedia: { instagram: '@priya_madhubani', facebook: 'priya.madhubani' },
        contact: { email: 'priya@example.com', phone: '+91 9876543212' },
        createdAt: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  loadSampleProducts() {
    this.products = [
      {
        id: 'prod_1',
        artisanId: 'artisan_1',
        name: 'Kantha Embroidered Saree',
        description: 'Beautiful hand-embroidered traditional saree with intricate Kantha work',
        category: 'cat_1',
        price: 2500,
        originalPrice: 3000,
        discount: 17,
        stock: 15,
        images: ['https://via.placeholder.com/300', 'https://via.placeholder.com/300'],
        craft: 'Kantha Embroidery',
        material: 'Silk',
        size: 'One Size',
        color: 'Multicolor',
        careInstructions: 'Dry clean only',
        story: 'This saree took 2 months to complete...',
        culturalSignificance: 'Kantha embroidery represents the rich textile tradition of Bengal',
        rating: 4.8,
        totalReviews: 15,
        featured: true,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'prod_2',
        artisanId: 'artisan_2',
        name: 'Dokra Brass Elephant',
        description: 'Traditional Dokra brass elephant sculpture with intricate detailing',
        category: 'cat_6',
        price: 1500,
        originalPrice: 2000,
        discount: 25,
        stock: 20,
        images: ['https://via.placeholder.com/300'],
        craft: 'Dokra Metal Casting',
        material: 'Brass',
        size: '8 inches',
        color: 'Golden',
        careInstructions: 'Wipe with soft cloth',
        story: 'Each Dokra piece is unique and made using the lost wax technique...',
        culturalSignificance: 'Dokra is one of the oldest metal casting techniques in India',
        rating: 4.9,
        totalReviews: 12,
        featured: true,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'prod_3',
        artisanId: 'artisan_3',
        name: 'Madhubani Painting - Peacock',
        description: 'Hand-painted Madhubani artwork featuring a peacock motif',
        category: 'cat_4',
        price: 3500,
        originalPrice: 4000,
        discount: 12,
        stock: 8,
        images: ['https://via.placeholder.com/300'],
        craft: 'Madhubani Painting',
        material: 'Canvas',
        size: '24x36 inches',
        color: 'Multicolor',
        careInstructions: 'Keep away from direct sunlight',
        story: 'This painting depicts the beauty of nature in traditional Madhubani style...',
        culturalSignificance: 'Madhubani painting originated in the Mithila region of Bihar',
        rating: 4.7,
        totalReviews: 10,
        featured: false,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'prod_4',
        artisanId: 'artisan_1',
        name: 'Kantha Stitched Wall Hanging',
        description: 'Beautiful wall hanging with traditional Kantha embroidery',
        category: 'cat_8',
        price: 1800,
        originalPrice: 2200,
        discount: 18,
        stock: 12,
        images: ['https://via.placeholder.com/300'],
        craft: 'Kantha Embroidery',
        material: 'Cotton',
        size: '20x30 inches',
        color: 'Multicolor',
        careInstructions: 'Dry clean only',
        story: 'Each wall hanging tells a story through its embroidery...',
        culturalSignificance: 'Kantha embroidery is known for its unique stitching patterns',
        rating: 4.6,
        totalReviews: 8,
        featured: false,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'prod_5',
        artisanId: 'artisan_2',
        name: 'Dokra Tribal Mask',
        description: 'Traditional tribal mask made using Dokra technique',
        category: 'cat_6',
        price: 1200,
        originalPrice: 1500,
        discount: 20,
        stock: 25,
        images: ['https://via.placeholder.com/300'],
        craft: 'Dokra Metal Casting',
        material: 'Brass',
        size: '6 inches',
        color: 'Golden-Brown',
        careInstructions: 'Wipe with soft cloth',
        story: 'These masks represent the tribal culture of Odisha...',
        culturalSignificance: 'Used in traditional tribal ceremonies',
        rating: 4.8,
        totalReviews: 9,
        featured: false,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  /**
   * Create artisan profile
   */
  async createArtisan(artisanData) {
    const artisan = {
      id: `artisan_${Date.now()}_${uuidv4().slice(0, 8)}`,
      ...artisanData,
      rating: 0,
      totalProducts: 0,
      totalSales: 0,
      verified: false,
      badges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.artisans.push(artisan);
    return artisan;
  }

  /**
   * Get artisan by ID
   */
  getArtisan(artisanId) {
    return this.artisans.find(a => a.id === artisanId);
  }

  /**
   * Get all artisans
   */
  getArtisans(filters = {}) {
    let filtered = [...this.artisans];

    if (filters.craft) {
      filtered = filtered.filter(a => a.craft.toLowerCase().includes(filters.craft.toLowerCase()));
    }

    if (filters.location) {
      filtered = filtered.filter(a => a.location.toLowerCase().includes(filters.location.toLowerCase()));
    }

    if (filters.verified !== undefined) {
      filtered = filtered.filter(a => a.verified === filters.verified);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(search) ||
        a.craft.toLowerCase().includes(search) ||
        a.bio.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  /**
   * Create product
   */
  async createProduct(artisanId, productData) {
    const artisan = this.getArtisan(artisanId);
    if (!artisan) {
      throw new Error('Artisan not found');
    }

    const product = {
      id: `prod_${Date.now()}_${uuidv4().slice(0, 8)}`,
      artisanId,
      ...productData,
      rating: 0,
      totalReviews: 0,
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.products.push(product);
    
    // Update artisan stats
    artisan.totalProducts = (artisan.totalProducts || 0) + 1;
    artisan.updatedAt = new Date().toISOString();

    return product;
  }

  /**
   * Get product by ID
   */
  getProduct(productId) {
    return this.products.find(p => p.id === productId);
  }

  /**
   * Get products with filters
   */
  getProducts(filters = {}) {
    let filtered = [...this.products];

    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    if (filters.artisanId) {
      filtered = filtered.filter(p => p.artisanId === filters.artisanId);
    }

    if (filters.craft) {
      filtered = filtered.filter(p => p.craft.toLowerCase().includes(filters.craft.toLowerCase()));
    }

    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= filters.minPrice);
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.craft.toLowerCase().includes(search)
      );
    }

    if (filters.featured !== undefined) {
      filtered = filtered.filter(p => p.featured === filters.featured);
    }

    if (filters.inStock !== undefined) {
      filtered = filtered.filter(p => p.stock > 0);
    }

    // Sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_low':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price_high':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'popular':
          filtered.sort((a, b) => b.totalReviews - a.totalReviews);
          break;
        default:
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    }

    return filtered;
  }

  /**
   * Add to cart
   */
  addToCart(userId, productId, quantity = 1) {
    const product = this.getProduct(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    if (!this.cart.has(userId)) {
      this.cart.set(userId, []);
    }

    const cart = this.cart.get(userId);
    const existingItem = cart.find(item => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }

    this.cart.set(userId, cart);
    return this.getCart(userId);
  }

  /**
   * Remove from cart
   */
  removeFromCart(userId, productId) {
    if (!this.cart.has(userId)) {
      return [];
    }

    const cart = this.cart.get(userId);
    const filtered = cart.filter(item => item.productId !== productId);
    this.cart.set(userId, filtered);
    return this.getCart(userId);
  }

  /**
   * Get cart
   */
  getCart(userId) {
    if (!this.cart.has(userId)) {
      return [];
    }

    const cart = this.cart.get(userId);
    return cart.map(item => {
      const product = this.getProduct(item.productId);
      return {
        ...item,
        product,
        subtotal: product ? product.price * item.quantity : 0
      };
    });
  }

  /**
   * Place order
   */
  async placeOrder(userId, orderData) {
    const cart = this.getCart(userId);
    if (cart.length === 0) {
      throw new Error('Cart is empty');
    }

    // Calculate total
    let total = 0;
    const items = cart.map(item => {
      const subtotal = item.product.price * item.quantity;
      total += subtotal;
      return {
        productId: item.productId,
        product: item.product,
        quantity: item.quantity,
        price: item.product.price,
        subtotal
      };
    });

    // Create order
    const order = {
      id: `order_${Date.now()}_${uuidv4().slice(0, 8)}`,
      userId,
      items,
      total,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      status: 'pending',
      paymentStatus: 'pending',
      trackingNumber: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update stock
    cart.forEach(item => {
      const product = this.getProduct(item.productId);
      if (product) {
        product.stock -= item.quantity;
        product.updatedAt = new Date().toISOString();
      }
    });

    // Create transaction
    const transaction = {
      id: `txn_${Date.now()}_${uuidv4().slice(0, 8)}`,
      orderId: order.id,
      userId,
      amount: total,
      status: 'pending',
      paymentMethod: orderData.paymentMethod,
      createdAt: new Date().toISOString()
    };

    this.transactions.push(transaction);
    this.orders.push(order);
    
    // Clear cart
    this.cart.set(userId, []);

    // Send notifications (in production)
    await this.sendOrderNotifications(order);

    return { order, transaction };
  }

  /**
   * Get order by ID
   */
  getOrder(orderId) {
    return this.orders.find(o => o.id === orderId);
  }

  /**
   * Get user orders
   */
  getUserOrders(userId) {
    return this.orders.filter(o => o.userId === userId);
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId, status) {
    const order = this.getOrder(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();

    return order;
  }

  /**
   * Add review
   */
  addReview(productId, userId, reviewData) {
    const product = this.getProduct(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const review = {
      id: `review_${Date.now()}_${uuidv4().slice(0, 8)}`,
      productId,
      userId,
      rating: reviewData.rating,
      comment: reviewData.comment,
      images: reviewData.images || [],
      helpful: 0,
      createdAt: new Date().toISOString()
    };

    this.reviews.push(review);

    // Update product rating
    const productReviews = this.reviews.filter(r => r.productId === productId);
    const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = totalRating / productReviews.length;
    product.totalReviews = productReviews.length;
    product.updatedAt = new Date().toISOString();

    return review;
  }

  /**
   * Get product reviews
   */
  getProductReviews(productId) {
    return this.reviews.filter(r => r.productId === productId);
  }

  /**
   * Get marketplace statistics
   */
  getStats() {
    const totalRevenue = this.orders.reduce((sum, o) => sum + o.total, 0);
    const completedOrders = this.orders.filter(o => o.status === 'completed').length;
    const pendingOrders = this.orders.filter(o => o.status === 'pending').length;

    return {
      totalArtisans: this.artisans.length,
      totalProducts: this.products.length,
      totalOrders: this.orders.length,
      totalRevenue,
      completedOrders,
      pendingOrders,
      verifiedArtisans: this.artisans.filter(a => a.verified).length,
      featuredProducts: this.products.filter(p => p.featured).length,
      categories: this.categories,
      topArtisans: this.getTopArtisans(),
      topProducts: this.getTopProducts(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get top artisans
   */
  getTopArtisans(limit = 5) {
    const sorted = [...this.artisans].sort((a, b) => b.totalSales - a.totalSales);
    return sorted.slice(0, limit);
  }

  /**
   * Get top products
   */
  getTopProducts(limit = 5) {
    const sorted = [...this.products].sort((a, b) => b.totalReviews - a.totalReviews);
    return sorted.slice(0, limit);
  }

  /**
   * Send order notifications
   */
  async sendOrderNotifications(order) {
    // In production: send email, SMS, push notifications
    console.log(`📧 Sending order confirmation for order ${order.id}`);
    
    // Notify artisan
    order.items.forEach(item => {
      const artisan = this.getArtisan(item.product.artisanId);
      if (artisan) {
        console.log(`📧 Notifying artisan ${artisan.name} about order`);
      }
    });

    // Notify user
    console.log(`📧 Sending order confirmation to user ${order.userId}`);
  }

  /**
   * Get artisan by product ID
   */
  getArtisanByProduct(productId) {
    const product = this.getProduct(productId);
    if (!product) return null;
    return this.getArtisan(product.artisanId);
  }

  /**
   * Get similar products
   */
  getSimilarProducts(productId, limit = 4) {
    const product = this.getProduct(productId);
    if (!product) return [];

    return this.products
      .filter(p => p.id !== productId && p.category === product.category)
      .slice(0, limit);
  }

  /**
   * Get artisan products
   */
  getArtisanProducts(artisanId) {
    return this.products.filter(p => p.artisanId === artisanId);
  }

  /**
   * Verify artisan
   */
  verifyArtisan(artisanId) {
    const artisan = this.getArtisan(artisanId);
    if (!artisan) {
      throw new Error('Artisan not found');
    }

    artisan.verified = true;
    artisan.updatedAt = new Date().toISOString();
    return artisan;
  }

  /**
   * Add badge to artisan
   */
  addBadgeToArtisan(artisanId, badge) {
    const artisan = this.getArtisan(artisanId);
    if (!artisan) {
      throw new Error('Artisan not found');
    }

    if (!artisan.badges.includes(badge)) {
      artisan.badges.push(badge);
      artisan.updatedAt = new Date().toISOString();
    }

    return artisan;
  }

  /**
   * Get categories
   */
  getCategories() {
    return this.categories;
  }
}

module.exports = MarketplaceService;
