const fs = require('fs');

function replaceIcons(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/fa-solid fa-/g, 'ti ti-');
  content = content.replace(/fa-spin/g, 'fa-spin'); // ti ti doesn't have spin by default easily, but we'll leave it or replace with another spinner class if we need to.
  // Actually, Tabler has 'ti-spin' for spinning! Let's just do it cleanly:
  content = content.replace(/fa-spin/g, 'ti-spin');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Replaced in ' + filePath);
}

replaceIcons('./public/archives.html');
replaceIcons('./public/scripts/archives.js');
