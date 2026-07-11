const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']});
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    
    await page.goto('http://localhost:3000/virtual-tour.html', {waitUntil: 'networkidle2'});
    console.log('Page loaded. Clicking start tour...');
    
    try {
        await page.click('button[onclick^="window.tourUI.startTour"]');
        console.log('Clicked successfully. Waiting...');
        await new Promise(r => setTimeout(r, 2000));
        console.log('Done.');
    } catch(e) {
        console.log('Click failed:', e.message);
    }
    
    await browser.close();
})();
