const puppeteer = require('puppeteer');
(async () => {
    try {
        const browser = await puppeteer.launch({headless: 'new'});
        const page = await browser.newPage();
        
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.log('PAGE ERROR:', err));
        
        await page.goto('http://localhost:3000/scrollytelling.html');
        await page.select('#story-selector', 'Madhubani Art');
        await new Promise(r => setTimeout(r, 2000));
        
        const html = await page.content();
        console.log('HTML SNIPPET:', html.substring(1000, 1500));
        await browser.close();
    } catch(e) {
        console.error(e);
    }
})();
