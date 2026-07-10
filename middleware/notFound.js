const path = require('path');
const fs = require('fs');

const config = {
    api: {
        enabled: true,
        statusCode: 404,
        response: {
            success: false,
            status: 404,
            message: 'The requested API endpoint could not be found.'
        }
    },
    web: {
        enabled: true,
        statusCode: 404,
        htmlFile: '404.html',
        htmlPath: path.join(__dirname, '../public', '404.html')
    },
    logging: {
        enabled: process.env.NODE_ENV === 'development' || process.env.LOG_404 === 'true'
    }
};

const isApiRequest = (req) => {
    return req.path.startsWith('/api') || 
           req.path.startsWith('/v1') || 
           req.headers.accept === 'application/json';
};

const logNotFound = (req) => {
    if (!config.logging.enabled) return;
    
    console.log(`[404] ${req.method} ${req.url} - ${req.ip || req.connection.remoteAddress}`);
    
    if (process.env.LOG_TO_FILE === 'true') {
        const logDir = path.join(__dirname, '../logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        const logFile = path.join(logDir, '404.log');
        const logData = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'] || 'unknown'
        };
        fs.appendFile(logFile, JSON.stringify(logData) + '\n', (err) => {
            if (err) console.error('Error writing to 404 log:', err);
        });
    }
};

const sendApiResponse = (res) => {
    const response = {
        ...config.api.response,
        path: req.path,
        timestamp: new Date().toISOString()
    };
    res.status(config.api.statusCode).json(response);
};

const sendHtmlResponse = (res) => {
    const htmlPath = config.web.htmlPath;
    
    if (fs.existsSync(htmlPath)) {
        res.status(config.web.statusCode).sendFile(htmlPath);
    } else {
        res.status(config.web.statusCode).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>404 - Page Not Found</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    h1 { font-size: 48px; color: #333; }
                    p { color: #666; }
                    a { color: #088178; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                <h1>404</h1>
                <h2>Page Not Found</h2>
                <p>The page you are looking for does not exist.</p>
                <a href="/">Go back to Home</a>
            </body>
            </html>
        `);
    }
};

const notFound = (req, res) => {
    logNotFound(req);
    
    if (isApiRequest(req) && config.api.enabled) {
        sendApiResponse(res);
    } else if (config.web.enabled) {
        sendHtmlResponse(res);
    } else {
        res.status(404).send('Not Found');
    }
};

module.exports = notFound;
module.exports.config = config;

module.exports.setConfig = function(newConfig) {
    Object.assign(config, newConfig);
};

module.exports.enableLogging = function(enabled = true) {
    config.logging.enabled = enabled;
};

module.exports.setApiResponse = function(response) {
    config.api.response = { ...config.api.response, ...response };
};

module.exports.setHtmlPath = function(htmlPath) {
    config.web.htmlPath = htmlPath;
};