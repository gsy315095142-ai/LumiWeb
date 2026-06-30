import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

// 从 LumiClaw 工作区的 node_modules 引入 puppeteer-core
const require = createRequire('D:\\AI_Program\\LumiClaw_Win\\package.json');
const puppeteer = require('puppeteer-core');

const HTML_PATH = 'D:\\gitProject\\LumiWeb\\WebProjects\\LumiSport\\events\\mock-guessing-20260618\\poster.html';
const OUTPUT_PATH = 'D:\\gitProject\\LumiWeb\\WebProjects\\LumiSport\\events\\mock-guessing-20260618\\poster.png';

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--force-device-scale-factor=3'],
});

const page = await browser.newPage();

// Step 1: 先设缩放和视口（技能要求：必须在加载页面前设置！）
await page.setViewport({
  width: 464,       // 440px poster + 12px body padding each side
  height: 1080,
  deviceScaleFactor: 3,  // Retina 3x 高清渲染
});

// Step 2: 加载页面
await page.goto(pathToFileURL(HTML_PATH).href, { waitUntil: 'networkidle0' });

// Step 3: 等待字体和图片完全加载
await page.evaluate(async () => {
  await document.fonts.ready;
  const imgs = Array.from(document.querySelectorAll('img'));
  await Promise.all(imgs.map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(resolve => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  }));
});

// Step 4: 动态获取实际内容高度并调整视口
const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
await page.setViewport({
  width: 464,
  height: bodyHeight,
  deviceScaleFactor: 3,
});

// Step 5: 等待布局稳定
await new Promise(r => setTimeout(r, 2000));

// Step 6: 截图！
await page.screenshot({
  path: OUTPUT_PATH,
  fullPage: true,
  type: 'png',
});

console.log(`✅ 截图完成：${OUTPUT_PATH}`);
console.log(`📐 视口：464×${bodyHeight}，deviceScaleFactor: 3`);

await browser.close();
