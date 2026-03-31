import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Capture console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER CONSOLE ERROR:', msg.text());
    }
  });
  
  // Capture unhandled page errors (the white screen crashers)
  page.on('pageerror', err => {
    console.log('BROWSER PAGE ERROR (CRASH):', err.message);
  });
  
  try {
    console.log('Navigating to http://localhost:5174/alumni/portal...');
    await page.goto('http://localhost:5174/alumni/portal', { waitUntil: 'networkidle0', timeout: 10000 });
    console.log('Checking /alumni/jobs as well...');
    await page.goto('http://localhost:5174/alumni/jobs', { waitUntil: 'networkidle0', timeout: 10000 });
    console.log('Checking /alumni/profile as well...');
    await page.goto('http://localhost:5174/alumni/profile', { waitUntil: 'networkidle0', timeout: 10000 });
    console.log('Done scanning pages.');
  } catch (e) {
    console.log('Puppeteer navigation error:', e.message);
  } finally {
    await browser.close();
  }
})();
