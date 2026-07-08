const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');
const htmlFiles = fs.readdirSync(publicDir).filter(file => file.endsWith('.html'));

const linkToInject = `          <a href="theme-builder.html"><i class="ti ti-palette"></i> Village Themes</a>`;

let injectedCount = 0;

for (const file of htmlFiles) {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if it's the preview sandbox or builder
    if (file === 'theme-preview.html' || file === 'theme-builder.html') {
        continue;
    }

    // Check if it already has it
    if (content.includes('href="theme-builder.html"')) {
        continue;
    }

    // Find a good target to inject after
    const target2 = `<a href="reputation.html"`;
    if (content.includes(target2)) {
        // Find the closing </a>
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

console.log(`Injected Theme Builder link into ${injectedCount} files.`);
