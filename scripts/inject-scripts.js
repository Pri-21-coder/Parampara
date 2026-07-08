const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

const scriptsToInject = `
<script src="scripts/crypto-utils.js"></script>
<script src="scripts/integrityBadge.js"></script>
`;

for (const file of files) {
  const filePath = path.join(publicDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('scripts/crypto-utils.js') || content.includes('scripts/integrityBadge.js')) {
    continue;
  }
  
  if (content.includes('<script src="scripts/main.js"></script>')) {
    content = content.replace(
      '<script src="scripts/main.js"></script>', 
      `<script src="scripts/crypto-utils.js"></script>\n    <script src="scripts/integrityBadge.js"></script>\n    <script src="scripts/main.js"></script>`
    );
  } else if (content.includes('<script src="/scripts/main.js"></script>')) {
     content = content.replace(
      '<script src="/scripts/main.js"></script>', 
      `<script src="/scripts/crypto-utils.js"></script>\n  <script src="/scripts/integrityBadge.js"></script>\n  <script src="/scripts/main.js"></script>`
    );
  } else if (content.includes('</body>')) {
    content = content.replace(
      '</body>', 
      `  <script src="scripts/crypto-utils.js"></script>\n  <script src="scripts/integrityBadge.js"></script>\n</body>`
    );
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Injected scripts into ${file}`);
}
