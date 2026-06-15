/**
 * Restore LumiSport folder after accidental deletion
 * Run from repo root: node WebProjects/_scripts/restore-lumi-sport.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WP = path.join(__dirname, '..');
const LS = path.join(WP, 'LumiSport');

function moveDir(from, to) {
  if (!fs.existsSync(from)) {
    console.log('SKIP missing', from);
    return;
  }
  if (fs.existsSync(to)) {
    console.log('SKIP exists', to);
    return;
  }
  fs.renameSync(from, to);
  console.log('MOVE', path.relative(WP, from), '->', path.relative(WP, to));
}

// 1. Move miniprogram
moveDir(path.join(WP, 'lumi-sport-miniprogram'), path.join(LS, 'miniprogram'));

const protoHub = path.join(LS, 'miniprogram', 'index.html');
if (fs.existsSync(protoHub)) {
  fs.renameSync(protoHub, path.join(LS, 'miniprogram', 'prototype-hub.html'));
  console.log('REN miniprogram/index.html -> prototype-hub.html');
}

// 2. Move warmup docs (find Chinese folder under WebProjects)
const warmupSrc = fs.readdirSync(WP, { withFileTypes: true })
  .find((d) => d.isDirectory() && d.name.includes('热身') && d.name.includes('LumiSport'));
if (warmupSrc) {
  moveDir(path.join(WP, warmupSrc.name), path.join(LS, 'warmup-docs'));
}

// 3. Hub page
const hubSrc = path.join(WP, 'lumi-sport.html');
const hubDst = path.join(LS, 'LumiSport.html');
if (fs.existsSync(hubSrc)) {
  fs.copyFileSync(hubSrc, hubDst);
  console.log('COPY lumi-sport.html -> LumiSport/LumiSport.html');
}

// 4. Run miniprogram/warmup renames + link fixes
execSync('node WebProjects/_scripts/migrate-lumi-sport.js', {
  cwd: path.join(WP, '..'),
  stdio: 'inherit',
});

// 5. Scheme A links in miniprogram hub
const protoHubFile = path.join(LS, 'miniprogram', 'prototype-hub.html');
if (fs.existsSync(protoHubFile)) {
  let t = fs.readFileSync(protoHubFile, 'utf8');
  t = t
    .replace(/href="\.\.\/design\//g, 'href="../business-flow/')
    .replace(/href="\.\.\/Design_LumiSport\//g, 'href="../business-flow/');
  fs.writeFileSync(protoHubFile, t, 'utf8');
  console.log('FIX prototype-hub.html links');
}

// 6. Scheme A hub links (old lumi-sport.html content)
const hubFile = path.join(LS, 'LumiSport.html');
if (fs.existsSync(hubFile)) {
  let html = fs.readFileSync(hubFile, 'utf8');
  html = html
    .replace(/href="\.\.\/index\.html"/g, 'href="../../index.html"')
    .replace(/href="LumiSportWeb\/web\/index\.html"/g, 'href="control-center/control-center.html"')
    .replace(/href="web\/control-center\.html"/g, 'href="control-center/control-center.html"')
    .replace(/href="Design_LumiSport\/index\.html"/g, 'href="business-flow/business-flow.html"')
    .replace(/href="design\/business-flow\.html"/g, 'href="business-flow/business-flow.html"')
    .replace(/href="lumi-sport-miniprogram\/index\.html"/g, 'href="miniprogram/prototype-hub.html"')
    .replace(/href="LumiSport热身设计_独立文档\/通用规则\.html"/g, 'href="warmup-docs/common-rules.html"')
    .replace(/href="warmup-docs\/common-rules\.html"/g, 'href="warmup-docs/common-rules.html"');
  fs.writeFileSync(hubFile, html, 'utf8');
  console.log('FIX LumiSport.html links');
}

// 7. Fix control-center nav if remote still has old path
const cc = path.join(LS, 'control-center', 'control-center.html');
if (fs.existsSync(cc)) {
  let t = fs.readFileSync(cc, 'utf8');
  if (t.includes('lumi-sport.html') || t.includes('../../lumi-sport')) {
    t = t.replace(/href="\.\.\/\.\.\/lumi-sport\.html"/g, 'href="../LumiSport.html"');
    t = t.replace(/href="\.\.\/lumi-sport\.html"/g, 'href="../LumiSport.html"');
    fs.writeFileSync(cc, t, 'utf8');
    console.log('FIX control-center.html nav');
  }
}

// 8. Cleanup restored root copies
for (const f of ['lumi-sport.html', 'lumi-sport-miniprogram']) {
  const p = path.join(WP, f);
  if (fs.existsSync(p)) {
    if (fs.statSync(p).isDirectory()) fs.rmSync(p, { recursive: true, force: true });
    else fs.unlinkSync(p);
    console.log('DEL', f);
  }
}
if (warmupSrc && fs.existsSync(path.join(WP, warmupSrc.name))) {
  fs.rmSync(path.join(WP, warmupSrc.name), { recursive: true, force: true });
  console.log('DEL old warmup folder');
}

console.log('Restore complete.');
