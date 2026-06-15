/**
 * LumiMagic Season 01 migration
 * Run: node WebProjects/_scripts/migrate-lumi-magic.js
 */
const fs = require('fs');
const path = require('path');

const WP = path.join(__dirname, '..');
const MAGIC = path.join(WP, 'LumiMagic_Season_01');
const MODULES = ['login', 'home', 'booking', 'order', 'ticket', 'role', 'mine', 'central', 'promotion', 'group', 'stats'];

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

function moveIf(from, to) {
  if (!fs.existsSync(from)) return;
  ensureDir(path.dirname(to));
  fs.renameSync(from, to);
  console.log('REN', path.relative(WP, from), '->', path.relative(WP, to));
}

function walk(dir, cb) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, cb);
    else cb(p);
  }
}

function replaceInTree(dir, pairs) {
  walk(dir, (file) => {
    if (!/\.(html|js|css)$/i.test(file)) return;
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
      console.log('FIX', path.relative(WP, file));
    }
  });
}

ensureDir(path.join(MAGIC, 'shared'));
ensureDir(path.join(MAGIC, 'modules'));

['common.css', 'common.js', 'wireframe.css'].forEach((f) => {
  moveIf(path.join(WP, f), path.join(MAGIC, 'shared', f));
});

if (fs.existsSync(path.join(WP, 'lumi-magic.html'))) {
  fs.copyFileSync(path.join(WP, 'lumi-magic.html'), path.join(MAGIC, 'LumiMagic_Season_01.html'));
  console.log('CP lumi-magic.html -> LumiMagic_Season_01/LumiMagic_Season_01.html');
}

for (const mod of MODULES) {
  const modDir = path.join(MAGIC, 'modules', mod);
  ensureDir(modDir);
  moveIf(path.join(WP, `magic-${mod}.html`), path.join(modDir, `${mod}.html`));
  const prefix = `magic-${mod}-`;
  for (const f of fs.readdirSync(WP)) {
    if (f.startsWith(prefix)) {
      moveIf(path.join(WP, f), path.join(modDir, f));
    }
  }
}

const moduleReplacements = [
  ['href="lumi-magic.html"', 'href="../../LumiMagic_Season_01.html"'],
  ['href="common.css"', 'href="../../shared/common.css"'],
  ['href="wireframe.css"', 'href="../../shared/wireframe.css"'],
  ['src="common.js"', 'src="../../shared/common.js"'],
];

for (const b of MODULES) {
  moduleReplacements.push([`href="magic-${b}.html"`, `href="../${b}/${b}.html"`]);
}

replaceInTree(path.join(MAGIC, 'modules'), moduleReplacements);

const hubFile = path.join(MAGIC, 'LumiMagic_Season_01.html');
if (fs.existsSync(hubFile)) {
  let hub = fs.readFileSync(hubFile, 'utf8');
  hub = hub.replace(/href="magic-home\.html"/g, 'href="modules/home/home.html"');
  hub = hub.replace(/href="\.\.\/index\.html"/g, 'href="../../index.html"');
  fs.writeFileSync(hubFile, hub, 'utf8');
  console.log('FIX LumiMagic_Season_01/LumiMagic_Season_01.html');
}

console.log('LumiMagic migration done.');
