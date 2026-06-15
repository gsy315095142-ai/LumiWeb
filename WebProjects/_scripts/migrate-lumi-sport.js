/**
 * LumiSport migration helper: renames + bulk text replacements
 * Run: node WebProjects/_scripts/migrate-lumi-sport.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'LumiSport');

function renameIfExists(fromRel, toRel) {
  const from = path.join(ROOT, fromRel);
  const to = path.join(ROOT, toRel);
  if (!fs.existsSync(from)) return false;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.renameSync(from, to);
  console.log('REN', fromRel, '->', toRel);
  return true;
}

function walk(dir, cb) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, cb);
    else cb(p);
  }
}

function replaceInTree(dir, pairs) {
  walk(dir, (file) => {
    if (!/\.(html|js|css|md|json|bat)$/i.test(file)) return;
    let text = fs.readFileSync(file, 'utf8');
    let changed = false;
    for (const [from, to] of pairs) {
      if (text.includes(from)) {
        text = text.split(from).join(to);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(file, text, 'utf8');
      console.log('FIX', path.relative(ROOT, file));
    }
  });
}

// --- warmup-docs renames ---
const warmupRenames = {
  '通用规则.html': 'common-rules.html',
  '烈焰拳王.html': 'blazing-boxer.html',
  '疾速冰球.html': 'speed-hockey.html',
  '雷霆击剑.html': 'thunder-fencing.html',
  '魔法派对.html': 'magic-party.html',
};
for (const [a, b] of Object.entries(warmupRenames)) {
  renameIfExists(path.join('warmup-docs', a), path.join('warmup-docs', b));
}

// --- miniprogram renames (longer names first) ---
const mpRenames = [
  ['miniprogram/客户端-竞猜-data.js', 'miniprogram/client-betting-data.js'],
  ['miniprogram/客户端-竞猜-选手.js', 'miniprogram/client-betting-players.js'],
  ['miniprogram/客户端-竞猜-记录.js', 'miniprogram/client-betting-records.js'],
  ['miniprogram/客户端-竞猜-报名.js', 'miniprogram/client-betting-signup.js'],
  ['miniprogram/客户端-竞猜-门店.js', 'miniprogram/client-betting-store.js'],
  ['miniprogram/客户端-竞猜-下注.js', 'miniprogram/client-betting-place.js'],
  ['miniprogram/客户端-竞猜.js', 'miniprogram/client-betting.js'],
  ['miniprogram/客户端.html', 'miniprogram/client.html'],
  ['miniprogram/客户端.js', 'miniprogram/client.js'],
  ['miniprogram/客户端.css', 'miniprogram/client.css'],
  ['miniprogram/管理员端-扫码-data.js', 'miniprogram/admin-scan-data.js'],
  ['miniprogram/管理员端-扫码-发放页.js', 'miniprogram/admin-scan-grant-page.js'],
  ['miniprogram/管理员端-扫码-弹窗.js', 'miniprogram/admin-scan-modal.js'],
  ['miniprogram/管理员端-扫码-发放.js', 'miniprogram/admin-scan-grant.js'],
  ['miniprogram/管理员端-扫码-报名.js', 'miniprogram/admin-scan-signup.js'],
  ['miniprogram/管理员端-扫码-兑换.js', 'miniprogram/admin-scan-redeem.js'],
  ['miniprogram/管理员端-扫码.js', 'miniprogram/admin-scan.js'],
  ['miniprogram/管理员端-区域.js', 'miniprogram/admin-zones.js'],
  ['miniprogram/管理员端-商品.js', 'miniprogram/admin-products.js'],
  ['miniprogram/管理员端.html', 'miniprogram/admin.html'],
  ['miniprogram/管理员端.js', 'miniprogram/admin.js'],
  ['miniprogram/管理员端.css', 'miniprogram/admin.css'],
  ['miniprogram/优化记录.md', 'miniprogram/changelog.md'],
  ['miniprogram/管理员端-styles', 'miniprogram/admin-styles'],
];
for (const [a, b] of mpRenames) renameIfExists(a, b);

const styleRenames = {
  '场次.css': 'sessions.css',
  '商品库.css': 'products.css',
  '弹窗.css': 'modals.css',
  '我的.css': 'profile.css',
  '扫码兑换.css': 'scan-redeem.css',
};
for (const [a, b] of Object.entries(styleRenames)) {
  renameIfExists(path.join('miniprogram/admin-styles', a), path.join('miniprogram/admin-styles', b));
}

// --- text replacements across LumiSport ---
const replacements = [
  // warmup nav links
  ['href="通用规则.html"', 'href="common-rules.html"'],
  ['href="烈焰拳王.html"', 'href="blazing-boxer.html"'],
  ['href="疾速冰球.html"', 'href="speed-hockey.html"'],
  ['href="雷霆击剑.html"', 'href="thunder-fencing.html"'],
  ['href="魔法派对.html"', 'href="magic-party.html"'],
  // warmup figure dirs
  ['冰球示意图/', 'speed-hockey-figures/'],
  ['击剑示意图/', 'thunder-fencing-figures/'],
  ['魔法派对示意图/', 'magic-party-figures/'],
  ['拳王示意图/', 'blazing-boxer-figures/'],
  // hub links in LumiSport.html
  ['href="LumiSportWeb/web/index.html"', 'href="web/control-center.html"'],
  ['href="Design_LumiSport/index.html"', 'href="design/business-flow.html"'],
  ['href="lumi-sport-miniprogram/index.html"', 'href="miniprogram/prototype-hub.html"'],
  ['href="LumiSport热身设计_独立文档/通用规则.html"', 'href="warmup-docs/common-rules.html"'],
  ['href="../index.html"', 'href="../../index.html"'],
  // control center
  ['href="../../lumi-sport.html"', 'href="../LumiSport.html"'],
  // miniprogram prototype hub
  ['href="index.html"', 'href="prototype-hub.html"'],
  ['href="../lumi-sport.html"', 'href="../LumiSport.html"'],
  ['href="../Design_LumiSport/index.html"', 'href="../design/business-flow.html"'],
  ['href="客户端.html"', 'href="client.html"'],
  ['href="管理员端.html"', 'href="admin.html"'],
  ['href="客户端.css"', 'href="client.css"'],
  ['href="管理员端.css"', 'href="admin.css"'],
  ['href="../Design_LumiSport/nav.css"', 'href="../design/nav.css"'],
  // miniprogram scripts
  ['src="客户端.js"', 'src="client.js"'],
  ['src="客户端-竞猜-data.js"', 'src="client-betting-data.js"'],
  ['src="客户端-竞猜-选手.js"', 'src="client-betting-players.js"'],
  ['src="客户端-竞猜-记录.js"', 'src="client-betting-records.js"'],
  ['src="客户端-竞猜-报名.js"', 'src="client-betting-signup.js"'],
  ['src="客户端-竞猜-门店.js"', 'src="client-betting-store.js"'],
  ['src="客户端-竞猜-下注.js"', 'src="client-betting-place.js"'],
  ['src="客户端-竞猜.js"', 'src="client-betting.js"'],
  ['src="管理员端.js"', 'src="admin.js"'],
  ['src="管理员端-区域.js"', 'src="admin-zones.js"'],
  ['src="管理员端-商品.js"', 'src="admin-products.js"'],
  ['src="管理员端-扫码-data.js"', 'src="admin-scan-data.js"'],
  ['src="管理员端-扫码-发放页.js"', 'src="admin-scan-grant-page.js"'],
  ['src="管理员端-扫码-弹窗.js"', 'src="admin-scan-modal.js"'],
  ['src="管理员端-扫码-发放.js"', 'src="admin-scan-grant.js"'],
  ['src="管理员端-扫码-报名.js"', 'src="admin-scan-signup.js"'],
  ['src="管理员端-扫码-兑换.js"', 'src="admin-scan-redeem.js"'],
  ['src="管理员端-扫码.js"', 'src="admin-scan.js"'],
  ['@import url("管理员端-styles/', '@import url("admin-styles/'],
  ['管理员端-styles/场次.css', 'admin-styles/sessions.css'],
  ['管理员端-styles/商品库.css', 'admin-styles/products.css'],
  ['管理员端-styles/弹窗.css', 'admin-styles/modals.css'],
  ['管理员端-styles/我的.css', 'admin-styles/profile.css'],
  ['管理员端-styles/扫码兑换.css', 'admin-styles/scan-redeem.css'],
  ['管理员端-styles/base.css', 'admin-styles/base.css'],
];

replaceInTree(ROOT, replacements);
console.log('Done.');
