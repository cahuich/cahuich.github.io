// Smoke test: serve the site, open the calculator in Chrome, exercise the UI.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.xml': 'application/xml', '.png': 'image/png', '.jpg': 'image/jpeg' };

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(__dirname, '..', urlPath === '/' ? 'index.html' : urlPath);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
});

(async () => {
  await new Promise(r => server.listen(8123, r));
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !m.text().includes('net::') && !m.text().includes('Failed to load resource')) errors.push('console: ' + m.text()); });

  let failed = false;
  const check = (name, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name); if (!cond) failed = true; };

  // 1. Page loads
  await page.goto('http://localhost:8123/calculadora-presupuesto.html', { waitUntil: 'domcontentloaded' });
  check('page loads', (await page.title()).includes('Calculadora de Presupuesto'));

  // 2. Default state: NL 3d + FR 3d, medio, 2 adults => (165+145)*3*2 = 1860 EUR
  await page.waitForSelector('#resultContent:not([hidden])');
  const total1 = await page.textContent('#totalAmount');
  check('default total is ~$36,828 MXN (1860 EUR x 19.8), got: ' + total1, total1.replace(/[^0-9]/g, '') === '36828');
  check('rows: 2 country rows', (await page.$$('#resultRows tr')).length === 2);

  // 3. Add España chip -> +3 days * 115 EUR * 2 = +690 EUR => 2550 EUR => $50,490
  await page.click('button.country-chip:has-text("España")');
  const total2 = await page.textContent('#totalAmount');
  check('after adding España: $50,490, got: ' + total2, total2.replace(/[^0-9]/g, '') === '50490');

  // 4. Style -> Alto: NL 280 + FR 220 + ES 180 = 680 * 3 * 2 = 4080 EUR => $80,784
  await page.click('label[for="styleAlto"]');
  const total3 = await page.textContent('#totalAmount');
  check('alto style: $80,784, got: ' + total3, total3.replace(/[^0-9]/g, '') === '80784');

  // 5. Children 1 -> personsEff 2.5 => 680*3*2.5 = 5100 EUR => $100,980
  await page.fill('#children', '1');
  const total4 = await page.textContent('#totalAmount');
  check('with 1 child: $100,980, got: ' + total4, total4.replace(/[^0-9]/g, '') === '100980');

  // 6. Currency EUR
  await page.selectOption('#currency', 'EUR');
  const total5 = await page.textContent('#totalAmount');
  check('currency switch to EUR: €5,100, got: ' + total5, total5.replace(/[^0-9]/g, '') === '5100');

  // 7. Day stepper +
  await page.click('button[aria-label="Agregar un día en Países Bajos"]');
  const daysText = await page.textContent('#footDays');
  check('stepper updated total days to 10, got: ' + daysText, daysText === '10');

  // 8. Persistence: reload keeps state (EUR, 10 days)
  await page.reload({ waitUntil: 'domcontentloaded' });
  const total6 = await page.textContent('#totalAmount');
  const daysText2 = await page.textContent('#footDays');
  check('state persists after reload (days=10)', daysText2 === '10');
  check('currency persists after reload (EUR)', !total6.includes('$'));

  // 9. Remove all countries -> empty state
  for (const name of ['Países Bajos', 'Francia', 'España']) {
    await page.click('button.country-chip:has-text("' + name + '")');
  }
  check('empty state shown when no countries', await page.isVisible('#resultEmpty'));

  // 10. index.html links to the calculator
  await page.goto('http://localhost:8123/index.html', { waitUntil: 'domcontentloaded' });
  check('index links to calculator', (await page.$$('a[href="calculadora-presupuesto.html"]')).length >= 2);

  // 11. Cookie banner appears and accept persists
  await page.goto('http://localhost:8123/calculadora-presupuesto.html', { waitUntil: 'load' });
  await page.waitForSelector('#cookieBanner', { state: 'attached' });
  await page.evaluate(() => localStorage.removeItem('cookieConsent'));
  await page.waitForTimeout(1600);
  check('cookie banner visible after 1.2s', await page.isVisible('#cookieBanner'));
  await page.click('#cookieAccept');
  const consent = await page.evaluate(() => localStorage.getItem('cookieConsent'));
  check('cookie consent persisted', consent === 'accepted');

  check('no JS runtime errors', errors.length === 0);
  if (errors.length) console.log(errors.join('\n'));

  await browser.close();
  server.close();
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
