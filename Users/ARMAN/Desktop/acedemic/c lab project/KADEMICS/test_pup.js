const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE_ERROR:', err.toString()));
  page.on('requestfailed', request => console.log('REQ_FAIL:', request.url(), request.failure().errorText));
  
  await page.goto('http://localhost:8080/archive.html', {waitUntil: 'networkidle0'});
  
  await new Promise(r => setTimeout(r, 2000));
  console.log('DONE.');
  await browser.close();
})();
