const puppeteer = require('puppeteer');

async function testMap() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Navigate to map
  await page.goto('http://localhost:3000/map.html', { waitUntil: 'networkidle0' });

  // Wait for map to be initialized
  await page.waitForFunction(() => window.map && window.map.isStyleLoaded());
  
  // Wait a moment for loadCulturalItems to finish
  await new Promise(r => setTimeout(r, 3000));

  const result = await page.evaluate(() => {
    const hasSource = !!window.map.getSource('cultural-items');
    const hasClusters = !!window.map.getLayer('cultural-clusters');
    const hasHeatmap = !!window.map.getLayer('cultural-heatmap');
    
    // Check if toggleHeatmap works
    const isVisibleBefore = window.map.getLayoutProperty('cultural-heatmap', 'visibility');
    window.toggleHeatmap();
    const isVisibleAfter = window.map.getLayoutProperty('cultural-heatmap', 'visibility');

    return { hasSource, hasClusters, hasHeatmap, isVisibleBefore, isVisibleAfter };
  });

  console.log('Map Test Results:', result);
  
  if (result.hasSource && result.hasClusters && result.hasHeatmap && result.isVisibleBefore !== result.isVisibleAfter) {
    console.log('✅ TEST PASSED: Layers successfully added and heatmap toggles correctly.');
    process.exit(0);
  } else {
    console.error('❌ TEST FAILED');
    process.exit(1);
  }
}

testMap().catch(console.error);
