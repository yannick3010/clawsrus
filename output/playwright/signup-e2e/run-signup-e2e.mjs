import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = '/Users/yaya/Gizmo/clawsrus/output/playwright/signup-e2e';
fs.mkdirSync(OUT_DIR, { recursive: true });

const ts = new Date().toISOString().replace(/[:.]/g, '-');
const screenshotPath = path.join(OUT_DIR, `dashboard-${ts}.png`);
const failScreenshotPath = path.join(OUT_DIR, `failure-${ts}.png`);
const logPath = path.join(OUT_DIR, `run-${ts}.log`);

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(logPath, `${line}\n`);
}

async function waitForToggleEnabledState(toggle, expected, timeoutMs = 90000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const value = await toggle.getAttribute('data-enabled').catch(() => null);
    if (value === expected) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  const actual = await toggle.getAttribute('data-enabled').catch(() => null);
  throw new Error(`Timed out waiting for skills toggle state=${expected}, actual=${actual}`);
}

async function fillVisibleWizardFields(page, email) {
  const fields = page.locator('input, textarea, select');
  const count = await fields.count();

  for (let i = 0; i < count; i += 1) {
    const field = fields.nth(i);
    if (!(await field.isVisible().catch(() => false))) continue;
    if (await field.isDisabled().catch(() => false)) continue;

    const meta = await field.evaluate((el) => ({
      tag: el.tagName.toLowerCase(),
      type: (el instanceof HTMLInputElement ? el.type : '').toLowerCase(),
      name: (el.getAttribute('name') || '').toLowerCase(),
      id: (el.getAttribute('id') || '').toLowerCase(),
      placeholder: (el.getAttribute('placeholder') || '').toLowerCase(),
      value: (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)
        ? el.value
        : '',
      required: (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)
        ? el.required
        : false,
      checked: el instanceof HTMLInputElement ? el.checked : false,
    }));

    const key = `${meta.name} ${meta.id} ${meta.placeholder}`;

    if (meta.tag === 'select') {
      if (!meta.value) {
        await field.selectOption({ index: 1 }).catch(() => {});
      }
      continue;
    }

    if (meta.type === 'hidden' || meta.type === 'submit' || meta.type === 'button') {
      continue;
    }

    if (meta.type === 'checkbox') {
      if (meta.required && !meta.checked) {
        await field.check({ force: true }).catch(async () => {
          await field.click({ force: true }).catch(() => {});
        });
      }
      continue;
    }

    if (meta.type === 'radio') {
      if (!meta.checked) {
        await field.check({ force: true }).catch(async () => {
          await field.click({ force: true }).catch(() => {});
        });
      }
      continue;
    }

    if (meta.value) continue;

    let value = 'Automated Playwright test';
    if (meta.type === 'email' || key.includes('email')) value = email;
    else if (key.includes('name')) value = 'Playwright Tester';
    else if (key.includes('timezone')) value = 'America/New_York';
    else if (key.includes('phone')) value = '5551234567';
    else if (key.includes('telegram')) value = '@playwrighttest';

    await field.fill(value).catch(() => {});
  }

  // Some wizard steps require at least one non-required option checkbox selected.
  const visibleCheckboxes = page.locator('input[type="checkbox"]');
  const boxCount = await visibleCheckboxes.count();
  if (boxCount > 0) {
    let anyChecked = false;
    for (let i = 0; i < boxCount; i += 1) {
      const box = visibleCheckboxes.nth(i);
      if (!(await box.isVisible().catch(() => false))) continue;
      if (await box.isChecked().catch(() => false)) {
        anyChecked = true;
        break;
      }
    }
    if (!anyChecked) {
      for (let i = 0; i < boxCount; i += 1) {
        const box = visibleCheckboxes.nth(i);
        if (!(await box.isVisible().catch(() => false))) continue;
        await box.check({ force: true }).catch(async () => {
          await box.click({ force: true }).catch(() => {});
        });
        break;
      }
    }
  }
}

async function clickPrimaryNext(page) {
  const selectors = [
    'button:has-text("Continue to Payment")',
    'a:has-text("Continue to Payment")',
    '[role="button"]:has-text("Continue to Payment")',
    'text=Continue to Payment',
    'button:has-text("Next")',
    'button:has-text("Continue")',
    'button:has-text("Review")',
    'button:has-text("Checkout")',
    'button:has-text("Pay")',
    'button:has-text("Complete")',
    'button[type="submit"]',
  ];

  for (const selector of selectors) {
    const btn = page.locator(selector).filter({ hasNotText: /back/i }).first();
    if (await btn.count()) {
      if (!(await btn.isVisible().catch(() => false))) continue;
      const enabled = await btn.isEnabled().catch(() => false);
      if (!enabled) continue;
      try {
        await btn.click({ timeout: 8000 });
        return selector;
      } catch {
        // continue to the next selector
      }
    }
  }
  return null;
}

async function selectFallbackOption(page) {
  const stepFourHeading = page.locator('text=How should your assistant communicate?').first();
  if (await stepFourHeading.isVisible().catch(() => false)) {
    const commSelectors = [
      'button:has-text("Brief & direct")',
      '[role="button"]:has-text("Brief & direct")',
      'label:has-text("Brief & direct")',
      'button:has-text("Detailed")',
      '[role="button"]:has-text("Detailed")',
      'label:has-text("Detailed")',
      'button:has-text("Casual")',
      '[role="button"]:has-text("Casual")',
      'label:has-text("Casual")',
    ];
    for (const selector of commSelectors) {
      const option = page.locator(selector).first();
      if (await option.count()) {
        if (!(await option.isVisible().catch(() => false))) continue;
        await option.click({ timeout: 5000 }).catch(() => {});
        const prioritySelectors = [
          'button:has-text("Productivity")',
          '[role="button"]:has-text("Productivity")',
          'button:has-text("Email management")',
          '[role="button"]:has-text("Email management")',
        ];
        for (const prioritySelector of prioritySelectors) {
          const priority = page.locator(prioritySelector).first();
          if (await priority.count()) {
            if (!(await priority.isVisible().catch(() => false))) continue;
            await priority.click({ timeout: 5000 }).catch(() => {});
            break;
          }
        }
        return selector;
      }
    }
  }

  const stepThreeHeading = page.locator('text=What do you need help with?').first();
  if (await stepThreeHeading.isVisible().catch(() => false)) {
    const helpSelectors = [
      'button:has-text("Email")',
      '[role="button"]:has-text("Email")',
      'label:has-text("Email")',
      'button:has-text("Calendar")',
      '[role="button"]:has-text("Calendar")',
      'label:has-text("Calendar")',
      'button:has-text("Tasks")',
      '[role="button"]:has-text("Tasks")',
      'label:has-text("Tasks")',
    ];
    for (const selector of helpSelectors) {
      const option = page.locator(selector).first();
      if (await option.count()) {
        if (!(await option.isVisible().catch(() => false))) continue;
        await option.click({ timeout: 5000 }).catch(() => {});
        return selector;
      }
    }
  }

  const selectors = [
    'button:has-text("Research")',
    '[role="button"]:has-text("Research")',
    'label:has-text("Research")',
    'button:has-text("Email")',
    '[role="button"]:has-text("Email")',
    'label:has-text("Email")',
  ];

  for (const selector of selectors) {
    const option = page.locator(selector).first();
    if (await option.count()) {
      if (!(await option.isVisible().catch(() => false))) continue;
      await option.click({ timeout: 5000 }).catch(() => {});
      return selector;
    }
  }

  return null;
}

async function fillInAnyFrame(page, selector, value) {
  for (let i = 0; i < 80; i += 1) {
    for (const frame of page.frames()) {
      try {
        const loc = frame.locator(selector).first();
        const count = await loc.count();
        if (count > 0) {
          await loc.fill(value);
          return true;
        }
      } catch {
        // frame may detach
      }
    }
    await page.waitForTimeout(250);
  }
  return false;
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 2200 } });
const page = await context.newPage();
const e2eSkillsId = (process.env.E2E_SKILLS_ID || '').trim();

let wsSeen = false;
let wsUrl = '';
page.on('websocket', (ws) => {
  if (ws.url().includes('/agent-ws')) {
    wsSeen = true;
    wsUrl = ws.url();
    log(`Observed websocket: ${ws.url()}`);
  }
});

try {
  const email = `pw-e2e+${Date.now()}@example.com`;
  log(`Using checkout email: ${email}`);

  log('Open homepage');
  await page.goto('https://www.clawsrus.com', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1000);

  log('Click Get Started CTA');
  await page.getByRole('link', { name: /get started/i }).first().click({ timeout: 20000 });
  await page.waitForTimeout(1000);

  for (let step = 1; step <= 12; step += 1) {
    const url = page.url();
    log(`Wizard loop step ${step}, url=${url}`);

    if (/checkout\.stripe\.com|billing\.stripe\.com/.test(url)) {
      break;
    }

    if (/app\.clawsrus\.com\/setup\?session_id=/.test(url)) {
      break;
    }

    await fillVisibleWizardFields(page, email);
    const clicked = await clickPrimaryNext(page);
    log(`Clicked wizard control: ${clicked || 'none'}`);
    if (!clicked) {
      const selected = await selectFallbackOption(page);
      if (selected) {
        log(`Selected fallback option: ${selected}`);
        const clickedAfterSelect = await clickPrimaryNext(page);
        log(`Clicked wizard control after select: ${clickedAfterSelect || 'none'}`);
      }
    }
    await page.waitForTimeout(2000);

    if (/checkout\.stripe\.com|billing\.stripe\.com/.test(page.url())) {
      break;
    }
  }

  if (!/checkout\.stripe\.com|billing\.stripe\.com/.test(page.url())) {
    await page.waitForURL(/checkout\.stripe\.com|billing\.stripe\.com|app\.clawsrus\.com\/setup\?session_id=/, { timeout: 120000 });
  }

  if (/checkout\.stripe\.com|billing\.stripe\.com/.test(page.url())) {
    log('On Stripe checkout: fill payment form');

    const emailField = page.locator('input[type="email"]').first();
    if (await emailField.count()) {
      await emailField.fill(email);
    }

    let cardFilled = false;
    let expFilled = false;
    let cvcFilled = false;

    const cardTop = page.locator('input[autocomplete="cc-number"], input[placeholder*="1234"]').first();
    if (await cardTop.count()) {
      await cardTop.fill('4242 4242 4242 4242').catch(() => {});
      cardFilled = (await cardTop.inputValue().catch(() => '')).replace(/\s+/g, '').startsWith('42424242');
    }

    const expTop = page.locator('input[autocomplete="cc-exp"], input[placeholder*="MM / YY"]').first();
    if (await expTop.count()) {
      await expTop.fill('12 / 34').catch(() => {});
      expFilled = (await expTop.inputValue().catch(() => '')).includes('12');
    }

    const cvcTop = page.locator('input[autocomplete="cc-csc"], input[placeholder*="CVC"]').first();
    if (await cvcTop.count()) {
      await cvcTop.fill('123').catch(() => {});
      cvcFilled = (await cvcTop.inputValue().catch(() => '')).length >= 3;
    }

    if (!cardFilled) {
      cardFilled = await fillInAnyFrame(page, 'input[name="cardnumber"]', '4242 4242 4242 4242');
    }
    if (!expFilled) {
      expFilled = await fillInAnyFrame(page, 'input[name="exp-date"]', '12 / 34');
    }
    if (!cvcFilled) {
      cvcFilled = await fillInAnyFrame(page, 'input[name="cvc"]', '123');
    }
    if (!cardFilled || !expFilled || !cvcFilled) {
      throw new Error(`Unable to fill card fields (card=${cardFilled}, exp=${expFilled}, cvc=${cvcFilled})`);
    }

    const billingName = page
      .locator('input[name="billingName"], input[autocomplete="cc-name"], input[placeholder*="Full name"]')
      .first();
    if (await billingName.count()) await billingName.fill('Playwright Tester');

    const postal = page
      .locator('input[name="postalCode"], input[autocomplete="postal-code"], input[placeholder="ZIP"], input[placeholder*="ZIP"]')
      .first();
    if (await postal.count()) await postal.fill('10001');

    const phone = page.locator('input[type="tel"], input[autocomplete="tel"]').first();
    if (await phone.count()) {
      await phone.fill('+14155552671');
      await phone.press('Tab').catch(() => {});
    }

    const payButton = page.locator('button:has-text("Pay"), button[type="submit"]').first();
    await payButton.click({ timeout: 20000 });
    await page.waitForTimeout(2000);

    const paymentError = page
      .locator('text=/Please ensure the correct country is selected|Your phone number is invalid|Your card was declined|payment failed/i')
      .first();
    if (await paymentError.isVisible().catch(() => false)) {
      throw new Error(`Stripe validation error: ${(await paymentError.textContent()) || 'unknown error'}`);
    }

    log('Submitted Stripe checkout');
  }

  log('Wait for setup page redirect');
  await page.waitForURL(/app\.clawsrus\.com\/setup\?session_id=/, { timeout: 180000 });

  log('Wait for dashboard redirect');
  await page.waitForURL(/app\.clawsrus\.com\/dashboard/, { timeout: 10 * 60 * 1000 });

  log('Validate dashboard chat');
  await page.getByRole('heading', { name: /Agent Chat/i }).waitFor({ timeout: 90000 });

  const runtimeError = page.locator('text=/Assistant runtime unavailable|Gateway unavailable|Unable to connect chat|Failed to initialize chat/i').first();
  const hasRuntimeError = await runtimeError.isVisible().catch(() => false);
  if (hasRuntimeError) {
    throw new Error(`Chat panel error visible: ${await runtimeError.textContent()}`);
  }

  await page.locator('[data-testid="native-chat-panel"]').waitFor({ state: 'visible', timeout: 90000 });

  const proxyStatus = await page.evaluate(async () => {
    const res = await fetch('/api/agent/proxy-token', { cache: 'no-store' });
    const text = await res.text();
    return { status: res.status, text };
  });
  log(`Proxy-token API status: ${proxyStatus.status}`);
  if (proxyStatus.status !== 200) {
    throw new Error(`Proxy-token failed: ${proxyStatus.status} ${proxyStatus.text}`);
  }

  const chatInput = page.locator('[data-testid="chat-input"]').first();
  const chatSend = page.locator('[data-testid="chat-send"]').first();
  await chatInput.waitFor({ state: 'visible', timeout: 90000 });
  await chatSend.waitFor({ state: 'visible', timeout: 90000 });

  const initialAssistantCount = await page.locator('[data-testid="chat-message"][data-role="assistant"]').count();
  await chatInput.fill(`Playwright ping ${Date.now()}`);
  await chatSend.click({ timeout: 20000 });

  await page.waitForFunction(
    (count) =>
      document.querySelectorAll('[data-testid="chat-message"][data-role="assistant"]').length > count,
    initialAssistantCount,
    { timeout: 180000 }
  );

  if (e2eSkillsId) {
    log(`Validate native skills panel for skill=${e2eSkillsId}`);
    await page.locator('[data-testid="native-skills-panel"]').waitFor({ state: 'visible', timeout: 90000 });

    const row = page.getByTestId(`skills-row-${e2eSkillsId}`).first();
    const toggle = page.getByTestId(`skills-toggle-${e2eSkillsId}`).first();
    await row.waitFor({ state: 'visible', timeout: 90000 });
    await toggle.waitFor({ state: 'visible', timeout: 90000 });

    const before = await toggle.getAttribute('data-enabled');
    if (before !== 'true' && before !== 'false') {
      throw new Error(`Unexpected skills toggle state before click: ${before}`);
    }
    const expected = before === 'true' ? 'false' : 'true';

    await toggle.click({ timeout: 20000 });
    await waitForToggleEnabledState(toggle, expected, 120000);

    log('Refresh dashboard and re-check skills toggle persistence');
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.locator('[data-testid="native-skills-panel"]').waitFor({ state: 'visible', timeout: 90000 });

    const toggleAfterReload = page.getByTestId(`skills-toggle-${e2eSkillsId}`).first();
    await toggleAfterReload.waitFor({ state: 'visible', timeout: 90000 });
    await waitForToggleEnabledState(toggleAfterReload, expected, 120000);
  }

  for (let i = 0; i < 50 && !wsSeen; i += 1) {
    await page.waitForTimeout(500);
  }
  log(`Websocket observed: ${wsSeen}${wsUrl ? ` (${wsUrl})` : ''}`);

  await page.screenshot({ path: screenshotPath, fullPage: true });
  log(`Saved screenshot: ${screenshotPath}`);

  console.log(JSON.stringify({
    ok: true,
    email,
    finalUrl: page.url(),
    wsSeen,
    wsUrl,
    screenshotPath,
    logPath,
  }, null, 2));
} catch (error) {
  await page.screenshot({ path: failScreenshotPath, fullPage: true }).catch(() => {});
  log(`FAILED: ${error instanceof Error ? error.stack || error.message : String(error)}`);
  console.log(JSON.stringify({
    ok: false,
    finalUrl: page.url(),
    error: error instanceof Error ? error.message : String(error),
    failScreenshotPath,
    logPath,
  }, null, 2));
  process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
}
