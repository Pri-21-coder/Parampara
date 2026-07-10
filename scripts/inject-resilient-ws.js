const fs = require('fs').promises;
const path = require('path');
const { existsSync } = require('fs');

const config = {
    publicDir: path.join(__dirname, '../public'),
    htmlFiles: [
        'collaborative-map.html',
        'moderation.html',
        'p2p-share.html',
        'trivia.html',
        'sync.html'
    ],
    jsFiles: [
        'scripts/collaborative/map.js',
        'scripts/moderation.js',
        'scripts/p2p-file-share.js',
        'scripts/trivia.js',
        'scripts/sync-engine.js'
    ],
    logging: {
        enabled: true,
        level: 'info'
    }
};

const log = {
    info: (message) => {
        if (config.logging.enabled) {
            console.log(`[INFO] ${message}`);
        }
    },
    success: (message) => {
        if (config.logging.enabled) {
            console.log(`[SUCCESS] ${message}`);
        }
    },
    warn: (message) => {
        if (config.logging.enabled) {
            console.warn(`[WARN] ${message}`);
        }
    },
    error: (message) => {
        if (config.logging.enabled) {
            console.error(`[ERROR] ${message}`);
        }
    }
};

const fileExists = async (filePath) => {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
};

const readFile = async (filePath) => {
    try {
        return await fs.readFile(filePath, 'utf8');
    } catch (error) {
        log.error(`Failed to read ${filePath}: ${error.message}`);
        throw error;
    }
};

const writeFile = async (filePath, content) => {
    try {
        await fs.writeFile(filePath, content, 'utf8');
        return true;
    } catch (error) {
        log.error(`Failed to write ${filePath}: ${error.message}`);
        throw error;
    }
};

const hasResilientWsInjected = (content) => {
    return content.includes('resilient-ws.js');
};

const hasResilientWebSocketUsed = (content) => {
    return content.includes('new ResilientWebSocket');
};

const injectResilientWsScript = (content) => {
    if (content.includes('</head>')) {
        return content.replace('</head>', '  <script src="scripts/resilient-ws.js"></script>\n</head>');
    } else if (content.includes('</body>')) {
        return content.replace('</body>', '  <script src="scripts/resilient-ws.js"></script>\n</body>');
    }
    return null;
};

const replaceWebSocket = (content) => {
    return content.replace(/new WebSocket\(/g, 'new ResilientWebSocket(');
};

const processHtmlFile = async (filePath) => {
    log.info(`Processing HTML: ${path.basename(filePath)}`);
    
    const exists = await fileExists(filePath);
    if (!exists) {
        log.warn(`File not found: ${filePath}`);
        return { status: 'skipped', reason: 'File not found' };
    }

    let content = await readFile(filePath);
    
    if (hasResilientWsInjected(content)) {
        log.info(`Resilient WS already injected in ${path.basename(filePath)}`);
        return { status: 'skipped', reason: 'Already injected' };
    }

    const updatedContent = injectResilientWsScript(content);
    if (!updatedContent) {
        log.warn(`Could not inject into ${path.basename(filePath)} (no </head> or </body> found)`);
        return { status: 'failed', reason: 'No injection point found' };
    }

    await writeFile(filePath, updatedContent);
    log.success(`Injected into ${path.basename(filePath)}`);
    return { status: 'success' };
};

const processJsFile = async (filePath) => {
    log.info(`Processing JS: ${path.basename(filePath)}`);
    
    const exists = await fileExists(filePath);
    if (!exists) {
        log.warn(`File not found: ${filePath}`);
        return { status: 'skipped', reason: 'File not found' };
    }

    let content = await readFile(filePath);
    
    if (hasResilientWebSocketUsed(content)) {
        log.info(`Resilient WebSocket already used in ${path.basename(filePath)}`);
        return { status: 'skipped', reason: 'Already replaced' };
    }

    const updatedContent = replaceWebSocket(content);
    await writeFile(filePath, updatedContent);
    log.success(`Replaced WebSocket in ${path.basename(filePath)}`);
    return { status: 'success' };
};

const processFiles = async (files, processor) => {
    const results = {
        success: [],
        skipped: [],
        failed: []
    };

    for (const file of files) {
        const filePath = path.join(config.publicDir, file);
        try {
            const result = await processor(filePath);
            if (result.status === 'success') {
                results.success.push(file);
            } else if (result.status === 'skipped') {
                results.skipped.push({ file, reason: result.reason });
            } else {
                results.failed.push({ file, reason: result.reason });
            }
        } catch (error) {
            log.error(`Error processing ${file}: ${error.message}`);
            results.failed.push({ file, reason: error.message });
        }
    }

    return results;
};

const printSummary = (htmlResults, jsResults) => {
    log.info('\n========== SUMMARY ==========');
    
    log.info(`\nHTML Files:`);
    log.info(`  Success: ${htmlResults.success.length}`);
    log.info(`  Skipped: ${htmlResults.skipped.length}`);
    log.info(`  Failed: ${htmlResults.failed.length}`);
    
    if (htmlResults.success.length > 0) {
        log.success(`  Updated: ${htmlResults.success.join(', ')}`);
    }
    if (htmlResults.skipped.length > 0) {
        log.warn(`  Skipped: ${htmlResults.skipped.map(s => s.file).join(', ')}`);
    }
    if (htmlResults.failed.length > 0) {
        log.error(`  Failed: ${htmlResults.failed.map(f => f.file).join(', ')}`);
    }

    log.info(`\nJS Files:`);
    log.info(`  Success: ${jsResults.success.length}`);
    log.info(`  Skipped: ${jsResults.skipped.length}`);
    log.info(`  Failed: ${jsResults.failed.length}`);
    
    if (jsResults.success.length > 0) {
        log.success(`  Updated: ${jsResults.success.join(', ')}`);
    }
    if (jsResults.skipped.length > 0) {
        log.warn(`  Skipped: ${jsResults.skipped.map(s => s.file).join(', ')}`);
    }
    if (jsResults.failed.length > 0) {
        log.error(`  Failed: ${jsResults.failed.map(f => f.file).join(', ')}`);
    }

    const total = htmlResults.success.length + jsResults.success.length;
    const skipped = htmlResults.skipped.length + jsResults.skipped.length;
    const failed = htmlResults.failed.length + jsResults.failed.length;
    
    log.info(`\nTOTAL:`);
    log.success(`  Updated: ${total}`);
    if (skipped > 0) log.warn(`  Skipped: ${skipped}`);
    if (failed > 0) log.error(`  Failed: ${failed}`);
    log.info('===============================\n');
};

const main = async () => {
    log.info('Starting Resilient WebSocket injection script...');
    log.info(`Public directory: ${config.publicDir}`);
    log.info(`HTML files to process: ${config.htmlFiles.length}`);
    log.info(`JS files to process: ${config.jsFiles.length}`);

    const htmlResults = await processFiles(config.htmlFiles, processHtmlFile);
    const jsResults = await processFiles(config.jsFiles, processJsFile);
    
    printSummary(htmlResults, jsResults);
    
    if (htmlResults.failed.length > 0 || jsResults.failed.length > 0) {
        process.exitCode = 1;
    }
};

if (require.main === module) {
    main().catch((error) => {
        log.error(`Script failed: ${error.message}`);
        process.exit(1);
    });
}

module.exports = {
    config,
    processHtmlFile,
    processJsFile,
    processFiles,
    main
};