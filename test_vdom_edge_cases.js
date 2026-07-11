const fs = require('fs');
const { JSDOM } = require('jsdom');

// Read the necessary files
const vdomJs = fs.readFileSync('./public/scripts/vdom.js', 'utf8');
const galleryJs = fs.readFileSync('./public/scripts/gallery.js', 'utf8');

const html = `
<!DOCTYPE html>
<html>
<body>
  <div id="gallery-grid" class="gallery-grid"></div>
  <input id="search-input" value="" />
  <select id="type-filter"><option value="all">All</option></select>
  <div id="loading-indicator"></div>
</body>
</html>
`;

const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;
const document = window.document;

// Mock globals needed by gallery.js
window.tGallery = (key) => key;
window.FavoritesManager = {
  favs: new Set(),
  isFavorite: (id) => window.FavoritesManager.favs.has(id),
  toggleFavorite: (id) => {
    if (window.FavoritesManager.favs.has(id)) window.FavoritesManager.favs.delete(id);
    else window.FavoritesManager.favs.add(id);
  }
};
window.renderMarkdown = (text) => text;
window.escapeHtml = (text) => text; // Normally in utils.js
window.getTypeIcon = (type) => '🖼️';
window.translateType = (type) => type;

// Load vdom.js
const vdomScript = document.createElement('script');
vdomScript.textContent = vdomJs;
document.body.appendChild(vdomScript);

// Load gallery.js
const galleryScript = document.createElement('script');
galleryScript.textContent = galleryJs;
document.body.appendChild(galleryScript);

// In JSDOM, requestAnimationFrame might not execute automatically like in browsers,
// so we will override scheduleUpdate to run synchronously for testing.
window.vdom.scheduleUpdate = (fn) => fn();

const displayItems = window.displayItems;
let grid = document.getElementById('gallery-grid');

let passed = 0;
let total = 0;
function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`✅ PASS: ${message}`);
  } else {
    console.log(`❌ FAIL: ${message}`);
  }
}

console.log("\n--- Running VDOM Edge Cases ---\n");

// Mock setupFavDelegation to test if listeners survive root replacement
let favClicks = 0;
grid.addEventListener('click', (e) => {
  if (e.target.closest('.favorite-btn')) favClicks++;
});

// Case 1: Initial render with 0 items (Empty state)
displayItems([]);
grid = document.getElementById('gallery-grid');
assert(grid.innerHTML.includes('gallery_empty_title'), 'Empty state renders correctly');

// Check if delegated listeners survived the first render
const tempBtn = document.createElement('button');
tempBtn.className = 'favorite-btn';
grid.appendChild(tempBtn);
tempBtn.click();
assert(favClicks === 0, 'FAIL EXPECTED: Delegated listener was DESTROYED due to root replaceWith() bug!');

// Let's test the fix for the replaceWith bug.
console.log('Test completed.');
