const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

// Files to update HTML
const htmlFiles = [
    'collaborative-map.html',
    'moderation.html',
    'p2p-share.html',
    'trivia.html',
    'sync.html'
];

for (const file of htmlFiles) {
    const filePath = path.join(publicDir, file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('resilient-ws.js')) continue;

    // We can inject it right before the main script or at the end of body or just after theme.js or in head
    // Let's inject it right before the closing </head> or </body> tag.
    // It's safer to inject in <head> so it's globally available before any script runs.
    if (content.includes('</head>')) {
        content = content.replace('</head>', '  <script src="scripts/resilient-ws.js"></script>\n</head>');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Injected into ${file}`);
    } else {
        console.warn(`Could not inject into ${file} (no </head> found)`);
    }
}

// Files to replace `new WebSocket`
const jsFiles = [
    'scripts/collaborative/map.js',
    'scripts/moderation.js',
    'scripts/p2p-file-share.js',
    'scripts/trivia.js',
    'scripts/sync-engine.js'
];

for (const file of jsFiles) {
    const filePath = path.join(publicDir, file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('new ResilientWebSocket')) continue;

    // Replace `new WebSocket` with `new ResilientWebSocket`
    content = content.replace(/new WebSocket\(/g, 'new ResilientWebSocket(');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Replaced WebSocket in ${file}`);
}

console.log('Done!');
