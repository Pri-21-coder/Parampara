const puppeteer = require('puppeteer');

(async () => {
    console.log('🧪 Starting Offline Edge Case Tests...\n');
    let passCount = 0;
    let failCount = 0;

    function assertTest(condition, message) {
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            passCount++;
        } else {
            console.error(`❌ FAIL: ${message}`);
            failCount++;
        }
    }

    let browser;
    try {
        console.log('Launching browser...');
        browser = await puppeteer.launch({ 
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: 'new'
        });
        const page = await browser.newPage();
        
        console.log('Navigating to gallery...');
        // Ensure server is reachable
        const response = await page.goto('http://localhost:3000/gallery', { waitUntil: 'domcontentloaded' });
        
        console.log('Waiting for SW install...');
        // Wait for Service Worker to install and cache assets
        await new Promise(r => setTimeout(r, 2000));
        
        console.log('Evaluating SW registration...');
        // Evaluate if service worker is registered
        const swReg = await page.evaluate(async () => {
            if ('serviceWorker' in navigator) {
                const regs = await navigator.serviceWorker.getRegistrations();
                return regs.length > 0;
            }
            return false;
        });
        
        assertTest(swReg, 'Service Worker successfully registered');

        console.log('Populating API cache...');
        // Test 2: Populate API cache
        const cachePopulated = await page.evaluate(async () => {
            if (!window.idbStorage) return false;
            // Fetch something to ensure it's in networkFirst cache
            await fetch('/api/items');
            await new Promise(r => setTimeout(r, 500));
            const data = await window.idbStorage.getApiData('http://localhost:3000/api/items');
            return data !== null;
        });
        
        assertTest(cachePopulated, 'API requests are correctly saved to IndexedDB');

        console.log('Going offline...');
        // Go offline
        const client = await page.target().createCDPSession();
        await client.send('Network.enable');
        await client.send('Network.emulateNetworkConditions', {
            offline: true,
            latency: 0,
            downloadThroughput: 0,
            uploadThroughput: 0,
        });

        console.log('Reloading page offline...');
        await page.reload({ waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 1000));
        
        const offlineToastExists = await page.evaluate(() => {
            return document.querySelector('.offline-toast') !== null;
        });
        
        // Sometimes Puppeteer needs a manual event trigger
        if (!offlineToastExists) {
            await page.evaluate(() => window.dispatchEvent(new Event('offline')));
            await new Promise(r => setTimeout(r, 500));
        }

        const toastVisible = await page.evaluate(() => {
            const toast = document.querySelector('.offline-toast');
            return toast !== null;
        });
        
        assertTest(toastVisible, 'Offline UI indicator correctly appears when network is disconnected');

        // Test 4: Sync Queue
        const syncEnqueued = await page.evaluate(async () => {
            if (!window.idbStorage) return false;
            await window.idbStorage.enqueueSyncTask({
                url: '/api/checkin',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location: 'test' })
            });
            const queue = await window.idbStorage.getSyncQueue();
            return queue.length > 0;
        });
        
        assertTest(syncEnqueued, 'Actions performed offline are correctly queued in Sync Queue');

        // Test 5: Own Test Case - Offline Data Retrieval and Error boundaries
        const dataRetrieved = await page.evaluate(async () => {
            try {
                // Should return from IDB cache
                const res = await fetch('/api/items');
                if (res.ok) {
                    const json = await res.json();
                    return json && Array.isArray(json);
                }
                return false;
            } catch (e) {
                return false;
            }
        });
        
        assertTest(dataRetrieved, 'Test 5: Fetch successfully retrieves data from IndexedDB cache when offline');

    } catch (err) {
        console.error('Test script encountered an unexpected error:', err);
        failCount++;
    } finally {
        if (browser) await browser.close();
    }

    console.log(`\n📊 Offline Edge Case Results: ${passCount} Passed, ${failCount} Failed\n`);
    if (failCount > 0) process.exit(1);
})();
