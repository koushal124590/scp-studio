const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    await page.goto('http://localhost:8080/banana_pro.html');
    console.log('Page loaded');
    
    // Check if toggle-layers exists
    const toggleLayers = await page.$('#toggle-layers');
    console.log('Toggle layers button exists:', !!toggleLayers);
    
    // Check display style before click
    let layerColDisplay = await page.$eval('.layer-col', el => window.getComputedStyle(el).display);
    console.log('Layer col display before:', layerColDisplay);
    
    // Click toggle
    if (toggleLayers) {
        await toggleLayers.click();
        console.log('Clicked toggle-layers');
        
        // Wait a tiny bit
        await new Promise(r => setTimeout(r, 100));
        
        // Check display style after click
        layerColDisplay = await page.$eval('.layer-col', el => window.getComputedStyle(el).display);
        console.log('Layer col display after:', layerColDisplay);
    }
    
    await browser.close();
})();
