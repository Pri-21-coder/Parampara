// middleware/auditMiddleware.js
const AuditLoggingService = require('../services/auditLoggingService');
const { v4: uuidv4 } = require('uuid');

let auditService = null;

const getAuditService = () => {
  if (!auditService) {
    auditService = new AuditLoggingService();
  }
  return auditService;
};

/**
 * Middleware to log all requests
 */
const logRequest = (req, res, next) => {
  const service = getAuditService();
  const startTime = Date.now();
  
  // Generate request ID
  req.requestId = req.headers['x-request-id'] || uuidv4();
  req.startTime = startTime;
  
  // Log request start
  service.log({
    level: 'INFO',
    action: `${req.method} ${req.path}`,
    userId: req.user?.id || 'anonymous',
    userRole: req.user?.role || 'guest',
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent'],
    resource: req.path.split('/')[1] || 'root',
    resourceId: req.params.id || null,
    metadata: {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type']
      }
    },
    requestId: req.requestId,
    status: 'pending'
  });

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const level = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    
    service.log({
      level,
      action: `${req.method} ${req.path}`,
      userId: req.user?.id || 'anonymous',
      userRole: req.user?.role || 'guest',
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      resource: req.path.split('/')[1] || 'root',
      resourceId: req.params.id || null,
      status: res.statusCode < 400 ? 'success' : 'failed',
      message: `${req.method} ${req.path} - ${res.statusCode}`,
      metadata: {
        statusCode: res.statusCode,
        duration,
        responseSize: res.get('Content-Length') || 0
      },
      requestId: req.requestId,
      duration
    });
  });

  next();
};

/**
 * Middleware to log CRUD operations
 */
const logCRUD = (action, resource) => {
  return (req, res, next) => {
    const service = getAuditService();
    const startTime = Date.now();
    
    // Store original send function
    const originalSend = res.send;
    
    // Override send to capture response
    res.send = function(data) {
      const duration = Date.now() - startTime;
      const status = res.statusCode < 400 ? 'success' : 'failed';
      
      // Log the CRUD operation
      service.log({
        level: status === 'success' ? 'INFO' : 'ERROR',
        action: `${action}.${resource}`,
        userId: req.user?.id || 'anonymous',
        userRole: req.user?.role || 'guest',
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        resource: resource,
        resourceId: req.params.id || req.body?.id || null,
        status: status,
        message: `${action} ${resource} - ${res.statusCode}`,
        metadata: {
          action,
          resource,
          requestId: req.requestId,
          statusCode: res.statusCode,
          duration,
          requestBody: req.body,
          responseData: data
        },
        requestId: req.requestId,
        duration
      });
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Middleware to log authentication events
 */
const logAuth = (action) => {
  return (req, res, next) => {
    const service = getAuditService();
    
    // Store original send function
    const originalSend = res.send;
    
    res.send = function(data) {
      const status = res.statusCode < 400 ? 'success' : 'failed';
      
      service.log({
        level: status === 'success' ? 'INFO' : 'WARN',
        action: `auth.${action}`,
        userId: req.body?.email || req.body?.username || 'unknown',
        userRole: 'user',
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        resource: 'auth',
        status: status,
        message: `Authentication ${action} - ${res.statusCode}`,
        metadata: {
          action,
          email: req.body?.email,
          statusCode: res.statusCode
        },
        requestId: req.requestId
      });
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Middleware to log errors
 */
const logError = (err, req, res, next) => {
  const service = getAuditService();
  
  service.log({
    level: 'ERROR',
    action: `${req.method} ${req.path}`,
    userId: req.user?.id || 'anonymous',
    userRole: req.user?.role || 'guest',
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent'],
    resource: req.path.split('/')[1] || 'root',
    resourceId: req.params.id || null,
    status: 'failed',
    message: err.message || 'An error occurred',
    metadata: {
      error: err.message,
      stack: err.stack,
      statusCode: err.status || 500,
      requestId: req.requestId
    },
    requestId: req.requestId,
    error: err.message,
    stackTrace: err.stack
  });
  
  next(err);
};

module.exports = {
  getAuditService,
  logRequest,
  logCRUD,
  logAuth,
  logError
};