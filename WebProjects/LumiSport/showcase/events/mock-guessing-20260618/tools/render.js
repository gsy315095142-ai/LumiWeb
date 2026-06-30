// Render poster.html to a high-res long image by capturing the .poster card.
// Usage: node render.js <pageURL> <outPNG> [width=480] [deviceScaleFactor=3]
const puppeteer = require('puppeteer-core');

const CHROME = process.env.CHROME_PATH;
const URL = process.argv[2];
const OUT = process.argv[3];
const WIDTH = parseInt(process.argv[4] || '480', 10);
const DSF = parseInt(process.argv[5] || '3', 10);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  if (!CHROME) throw new Error('CHROME_PATH env var is not set');
  if (!URL || !OUT) throw new Error('usage: node render.js <pageURL> <outPNG> [width] [dsf]');

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars'],
  });
  const page = await browser.newPage();

  // Step 1: set scale FIRST (per skill: scale -> load -> wait -> capture)
  await page.setViewport({ width: WIDTH, height: 932, deviceScaleFactor: DSF, isMobile: false });

  // Step 2: load
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });

  // Step 3: wait for fonts + images + layout to fully settle
  await page.evaluate(async () => {
    await document.fonts.ready;
    const imgs = Array.from(document.images);
    await Promise.all(
      imgs.map((img) =>
        img.complete ? Promise.resolve() : new Promise((res) => { img.onload = img.onerror = res; })
      )
    );
  });
  await sleep(1500);

  // Resize viewport to full content height, then let layout recalc
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.setViewport({ width: WIDTH, height: h, deviceScaleFactor: DSF, isMobile: false });
  await sleep(1200);

  // Step 4: capture the poster card at its true width (matches the webpage exactly)
  const el = await page.$('.poster');
  if (el) {
    await el.screenshot({ path: OUT });
  } else {
    await page.screenshot({ path: OUT, fullPage: true });
  }

  await browser.close();
  console.log('DONE height=' + h);
})().catch((e) => {
  console.error('ERR', e && e.message ? e.message : e);
  process.exit(1);
});
