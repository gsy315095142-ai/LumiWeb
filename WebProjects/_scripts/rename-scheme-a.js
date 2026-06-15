/**
 * Rename web → control-center, design → business-flow (Scheme A)
 * Run: node WebProjects/_scripts/rename-scheme-a.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..', 'LumiSport');
const REPO = path.join(ROOT, 'LumiSportWeb');

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
    if (!/\.(html|js|css|md|json|bat|ps1|py)$/i.test(file)) return;
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
      console.log('FIX', path.relative(path.join(__dirname, '..'), file));
    }
  });
}

// 1. Remove junction web/
const junction = path.join(ROOT, 'web');
if (fs.existsSync(junction)) {
  try {
    fs.rmdirSync(junction);
    console.log('Removed junction web/');
  } catch (e) {
    execSync(`cmd /c rmdir "${junction}"`, { stdio: 'inherit' });
    console.log('Removed junction web/ (cmd)');
  }
}

// 2. Flatten web/ into LumiSportWeb repo root (git mv)
const webDir = path.join(REPO, 'web');
if (fs.existsSync(webDir)) {
  const entries = fs.readdirSync(webDir);
  for (const name of entries) {
    const from = path.join('web', name).replace(/\\/g, '/');
    const to = name;
    if (fs.existsSync(path.join(REPO, to))) {
      console.log('SKIP exists', to);
      continue;
    }
    execSync(`git mv "${from}" "${to}"`, { cwd: REPO, stdio: 'inherit' });
  }
  try {
    fs.rmdirSync(webDir);
    console.log('Removed empty web/');
  } catch (e) {
    console.warn('web/ not empty yet', e.message);
  }
}

// 3. Rename LumiSportWeb → control-center
const targetCc = path.join(ROOT, 'control-center');
if (fs.existsSync(REPO) && !fs.existsSync(targetCc)) {
  fs.renameSync(REPO, targetCc);
  console.log('Renamed LumiSportWeb → control-center');
}

// 4. Rename design → business-flow
const designDir = path.join(ROOT, 'design');
const targetBf = path.join(ROOT, 'business-flow');
if (fs.existsSync(designDir) && !fs.existsSync(targetBf)) {
  fs.renameSync(designDir, targetBf);
  console.log('Renamed design → business-flow');
}

// 5. Update references under WebProjects + root
const wp = path.join(__dirname, '..');
const pairs = [
  ['web/control-center.html', 'control-center/control-center.html'],
  ['design/business-flow.html', 'business-flow/business-flow.html'],
  ['../design/nav.css', '../business-flow/nav.css'],
  ['../design/business-flow.html', '../business-flow/business-flow.html'],
  ['href="design/', 'href="business-flow/'],
  ['WebProjects/LumiSport/web/', 'WebProjects/LumiSport/control-center/'],
  ['WebProjects/LumiSport/design/', 'WebProjects/LumiSport/business-flow/'],
  ['LumiSport/LumiSportWeb', 'LumiSport/control-center'],
  ['LumiSportWeb/web/', 'control-center/'],
  ['（`web/` 目录下', '（`control-center/` 目录下'],
  ['`web/` 目录下', '`control-center/` 目录下'],
];

replaceInTree(ROOT, pairs);
replaceInTree(path.join(wp, '_portal'), pairs);
replaceInTree(path.join(__dirname, '..', '..', 'docs'), pairs);

// root files
for (const f of ['index.html', 'start-local-server.bat', '.gitignore'].map((x) => path.join(__dirname, '..', '..', x))) {
  if (!fs.existsSync(f)) continue;
  let t = fs.readFileSync(f, 'utf8');
  let c = false;
  for (const [from, to] of pairs) {
    if (t.includes(from)) { t = t.split(from).join(to); c = true; }
  }
  if (c) { fs.writeFileSync(f, t, 'utf8'); console.log('FIX', path.basename(f)); }
}

console.log('Scheme A rename done.');
