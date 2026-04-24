// Standalone Playwright test for the "Order Sample" flow.
//
// IMPORTANT: API calls are mocked via page.route(). This exercises the UI code
// path end-to-end (login → product → Samples tab → drawer → submit) but does
// NOT validate the real backend. Run against staging/dev for real coverage.

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const step = (msg) => console.log(`\n▶ ${msg}`);
const ok = (msg) => console.log(`  ✔ ${msg}`);

const PRODUCT = {
  id: 'PRD-TEST-001',
  projectNumber: 'P-0001',
  name: 'Test Product',
  client: 'Acme Corp',
  vendor: 'Best Vendor Co',
  status: 'In Progress',
  type: 'Apparel',
  yearlyQty: 1000,
  pricePerUnit: 10,
  totalValue: 10000,
  priority: 'High',
  deployment: 'Direct',
  image: '',
};
const VENDOR = { id: 'VEN-1', vendorName: 'Best Vendor Co', vendorType: 'Factory', priority: 'Primary' };

let purchasingCreateBody = null;

async function installRoutes(context) {
  await context.route('**/api/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    const u = new URL(url);
    const p = u.pathname;

    // POST /api/purchasing/create — the key endpoint we want to verify
    if (p === '/api/purchasing/create' && method === 'POST') {
      try { purchasingCreateBody = JSON.parse(route.request().postData() || '{}'); } catch {}
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, purchaseOrder: { ...purchasingCreateBody, id: 'PO-TEST-1' } }),
      });
    }

    if (p === '/api/purchasing/next-sample-po') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ poNumber: 'SPL-TEST-001' }) });
    }

    if (p === '/api/projects/list') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ projects: [PRODUCT] }),
      });
    }

    if (p === '/api/pipeline/vendors/list') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ vendors: [VENDOR] }) });
    }

    if (p === '/api/pipeline/sample-orders/list') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ orders: [] }) });
    }
    if (p === '/api/pipeline/samples/list') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ samples: [] }) });
    }
    if (p === '/api/files/list') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ uploads: [] }) });
    }
    if (p === '/api/contacts/list') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ contacts: [] }) });
    }
    if (p === '/api/pipeline/checklist/list') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [] }) });
    }
    if (p === '/api/settings/warehouses/list' || p.includes('warehouse')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ warehouses: [] }) });
    }

    // Catchall for any other API endpoint — empty object so UI doesn't explode
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  await installRoutes(context);

  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => pageErrors.push(e.message));

  // Don't let alert() block the test
  page.on('dialog', async (d) => { console.log('  [dialog]', d.type(), d.message()); await d.dismiss(); });

  try {
    step('Load app');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[type="email"]', { timeout: 10_000 });
    ok('Login page rendered');

    step('Log in with local test account');
    await page.fill('input[type="email"]', 'admin@activateswag.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for the sidebar to show up (proof we're past auth)
    await page.waitForSelector('text=Pipeline', { timeout: 10_000 });
    ok('Logged in, dashboard shell rendered');

    step('Navigate to Pipeline');
    // "Pipeline" is a sub-item under "Products" in the sidebar — expand first.
    await page.getByRole('button', { name: /^Products$/ }).first().click();
    await page.getByRole('button', { name: /^Pipeline$/ }).click();
    await page.waitForSelector(`text=${PRODUCT.name}`, { timeout: 10_000 });
    ok('Product list shows seeded product');

    step('Open product detail');
    await page.click('button[title="View Details"]');
    await page.waitForSelector('text=Samples', { timeout: 10_000 });
    ok('Product details opened');

    step('Switch to Samples tab');
    // The Samples tab button contains the literal word "Samples"
    await page.getByRole('button', { name: /^Samples$/ }).first().click();
    await page.waitForSelector('text=Order Sample', { timeout: 10_000 });
    ok('Samples tab active, Order Sample button visible');

    step('Open Order Sample drawer');
    await page.getByRole('button', { name: /Order Sample/ }).first().click();
    await page.waitForSelector('text=Submit Sample Order', { timeout: 10_000 });
    ok('Order Sample drawer opened');

    step('Fill variant fields (SKU/Color/Size/Qty/Cost)');
    await page.getByPlaceholder('e.g., 3132').fill('SKU-TEST-1');
    await page.getByPlaceholder('e.g., Black').fill('Blue');
    await page.getByPlaceholder('e.g., Medium').fill('Large');
    const qty = await page.locator('input[placeholder="1"]').first();
    await qty.fill('2');
    const cost = await page.locator('input[placeholder="0.00"]').first();
    await cost.fill('12.50');
    ok('Variant filled');

    step('Select vendor');
    await page.getByRole('button', { name: /Select a vendor/ }).click();
    // Vendor option is a button inside the dropdown — scope to role=button to avoid
    // also matching the static "Vendor: ..." label rendered elsewhere on the page.
    await page.getByRole('button', { name: new RegExp(VENDOR.vendorName) }).click();
    ok(`Vendor "${VENDOR.vendorName}" selected`);

    step('Pick "Other Location" ship-to');
    await page.getByRole('button', { name: /Select a location|Ship.*Location|Select.*location/i }).first().click().catch(async () => {
      // fallback: click the ship-to label's dropdown
      await page.locator('text=Ship To Location').locator('..').locator('button').first().click();
    });
    await page.waitForSelector('text=Other Location', { timeout: 5_000 });
    await page.click('text=Other Location');
    ok('Ship-to set to Other Location');

    step('Fill custom address');
    // Drawer fixed on right side — scope locators to avoid matches elsewhere.
    const drawer = page.locator('.fixed.right-0.top-0');
    await drawer.getByPlaceholder('e.g., Client Office').fill('Test Destination');
    await drawer.getByPlaceholder('e.g., John Doe').fill('John Doe');
    await drawer.getByPlaceholder('e.g., 123 Main Street').fill('100 Test St');
    await drawer.getByPlaceholder('City').fill('Austin');
    await drawer.getByPlaceholder('ST').first().fill('TX');
    await drawer.getByPlaceholder('12345').first().fill('78701');
    ok('Custom address filled');

    step('Submit the sample order');
    const submit = page.getByRole('button', { name: /Submit Sample Order|Create .* Split POs/ });
    await submit.waitFor({ state: 'visible' });

    const postResponse = page.waitForResponse(
      (r) => r.url().includes('/api/purchasing/create') && r.request().method() === 'POST',
      { timeout: 15_000 }
    );
    await submit.click();
    await postResponse;
    ok('POST /api/purchasing/create received');

    // Drawer should close after successful submit (onClose fires after onSuccess).
    await page.locator('.fixed.right-0.top-0').first().waitFor({ state: 'detached', timeout: 10_000 });
    ok('Drawer closed — onSuccess path reached');

    step('Verify POST /api/purchasing/create payload');
    if (!purchasingCreateBody) throw new Error('POST /api/purchasing/create was never called');
    const must = ['poNumber','vendor','variants','shipToAddresses','sampleType','isSample'];
    for (const key of must) {
      if (!(key in purchasingCreateBody)) throw new Error(`Missing field in PO payload: ${key}`);
    }
    if (purchasingCreateBody.isSample !== true) throw new Error('isSample should be true');
    if (!Array.isArray(purchasingCreateBody.variants) || purchasingCreateBody.variants.length !== 1) {
      throw new Error('Expected 1 variant in payload');
    }
    if (purchasingCreateBody.variants[0].sku !== 'SKU-TEST-1') throw new Error('SKU did not round-trip');
    if (purchasingCreateBody.vendor !== VENDOR.vendorName) throw new Error('Vendor did not round-trip');
    ok(`PO payload OK — poNumber=${purchasingCreateBody.poNumber}, vendor=${purchasingCreateBody.vendor}, total=${purchasingCreateBody.total}`);

    console.log('\n✅ Sample-order flow completed without UI errors.');
  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    try { await page.screenshot({ path: '/tmp/order-sample-failure.png', fullPage: true }); console.log('  screenshot: /tmp/order-sample-failure.png'); } catch {}
    try {
      const body = await page.locator('body').innerText();
      console.log('\n--- Page body text (first 1500 chars) ---\n' + body.slice(0, 1500));
    } catch {}
    process.exitCode = 1;
  } finally {
    if (consoleErrors.length) console.log('\nBrowser console errors:\n  ' + consoleErrors.slice(0, 10).join('\n  '));
    if (pageErrors.length)    console.log('\nUncaught page errors:\n  ' + pageErrors.slice(0, 10).join('\n  '));
    await browser.close();
  }
}

main();
