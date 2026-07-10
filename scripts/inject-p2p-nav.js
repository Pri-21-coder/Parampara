const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');
const htmlFiles = fs.readdirSync(publicDir).filter(file => file.endsWith('.html'));

const linkToInject = `          <a href="p2p-share.html"><i class="ti ti-share"></i> P2P Share</a>`;

let injectedCount = 0;

for (const file of htmlFiles) {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if it already has it
    if (content.includes('href="p2p-share.html"')) {
        continue;
    }

    // Find the end of nav-fullmenu-grid
    const targetString = `</div>\n      </div>\n    </div>\n\n    <main`;
    
    // An easier target is right after story-generator.html
    const target2 = `<a href="story-generator.html"`;
    if (content.includes(target2)) {
        // Find the closing </a> of story-generator
        const parts = content.split(target2);
        const secondPart = parts[1];
        const endOfA = secondPart.indexOf('</a>') + 4;
        
        const newContent = content.substring(0, parts[0].length + target2.length + endOfA) 
            + '\n' + linkToInject 
            + content.substring(parts[0].length + target2.length + endOfA);
            
        fs.writeFileSync(filePath, newContent, 'utf8');
        injectedCount++;
    }
}

console.log(`Injected P2P Share link into ${injectedCount} files.`);
