/**
 * 通用拆分脚本 - 不使用 JSON.stringify，直接切割原始文本
 * 保证转义字符不被二次处理
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;

// ========== 第一步：识别每个 loader 的格式并拆分 ==========

const loaderFiles = fs.readdirSync(DIR)
  .filter(f => /^magic-\w+-loader\.js$/.test(f))
  .map(f => f.replace('-loader.js', ''));

console.log('Found', loaderFiles.length, 'loaders\n');

for (const MODULE of loaderFiles) {
  const FILE = path.join(DIR, `${MODULE}-loader.js`);
  const HTML_FILE = path.join(DIR, `${MODULE}.html`);
  const file = fs.readFileSync(FILE, 'utf8');
  const origSize = Buffer.byteLength(file, 'utf8');

  // 检测格式：是否包含 d.innerHTML="
  if (file.includes('d.innerHTML="')) {
    // ===== 格式1：单字符串赋值 =====
    // 结构: (function(){var d=document.getElementById("content-area");if(!d)return;d.innerHTML="...";window.dispatchEvent(new Event("content-ready"));})();
    splitFormat1(MODULE, file, FILE, HTML_FILE, origSize);
  } else if (file.includes("container = document.getElementById('content-area'") || file.includes('container = document.getElementById("content-area"') || file.includes('container=document.getElementById')) {
    // ===== 格式2：嵌套 IIFE =====
    splitFormat2(MODULE, file, FILE, HTML_FILE, origSize);
  } else {
    console.log(`SKIP ${MODULE}: unknown format`);
  }
}

// ========== 格式1 拆分 ==========
function splitFormat1(MODULE, file, FILE, HTML_FILE, origSize) {
  const VAR_PREFIX = MODULE.replace(/-/g, '_');

  // 找到内容区域：d.innerHTML=" 到 ";window.dispatchEvent 之间
  const prefixMarker = 'd.innerHTML="';
  const prefixEnd = file.indexOf(prefixMarker) + prefixMarker.length;

  const suffixMarker = '";window.dispatchEvent(new Event("content-ready"));})();';
  const suffixStart = file.indexOf(suffixMarker);

  if (prefixEnd === -1 || suffixStart === -1) {
    console.log(`SKIP ${MODULE}: cannot find markers`);
    return;
  }

  const content = file.substring(prefixEnd, suffixStart);

  // 按 <!-- N. 拆分
  const sectionRegex = /<!-- \d+\./g;
  const positions = [];
  let m;
  while ((m = sectionRegex.exec(content)) !== null) {
    positions.push(m.index);
  }

  if (positions.length === 0) {
    console.log(`SKIP ${MODULE}: no sections`);
    return;
  }

  console.log(`${MODULE} (format1, ${(origSize / 1024).toFixed(1)} KB, ${positions.length} sections)`);

  // 拆分：每个 section 文件直接保存原始字符串内容（不含引号）
  // 用 window.__xxx_sN = "原始内容"; 的方式
  // 关键：直接截取原始文本中的转义字符串，不做任何处理
  const sectionFiles = [];
  for (let i = 0; i < positions.length; i++) {
    const start = positions[i];
    const end = (i < positions.length - 1) ? positions[i + 1] : content.length;
    const sectionContent = content.substring(start, end);
    const fileName = `${MODULE}-s${i + 1}.js`;
    sectionFiles.push(fileName);

    // 直接用原始转义内容赋值，不做 JSON.stringify
    const js = `window.__${VAR_PREFIX}_s${i + 1} = "${sectionContent}";\n`;
    fs.writeFileSync(path.join(DIR, fileName), js, 'utf8');
    console.log(`  ${fileName}: ${(Buffer.byteLength(js, 'utf8') / 1024).toFixed(1)} KB`);
  }

  // 新 loader：拼接所有变量
  const varNames = sectionFiles.map((_, i) => `window.__${VAR_PREFIX}_s${i + 1}`).join('+');
  const loaderJs = `(function(){var d=document.getElementById("content-area");if(!d)return;d.innerHTML=${varNames};window.dispatchEvent(new Event("content-ready"));})();\n`;
  fs.writeFileSync(FILE, loaderJs, 'utf8');
  console.log(`  ${MODULE}-loader.js (new): ${(Buffer.byteLength(loaderJs, 'utf8') / 1024).toFixed(1)} KB`);

  updateHTML(HTML_FILE, MODULE, sectionFiles);
}

// ========== 格式2 拆分 ==========
function splitFormat2(MODULE, file, FILE, HTML_FILE, origSize) {
  const VAR_PREFIX = MODULE.replace(/-/g, '_');

  // 找到所有 IIFE 起始位置
  const iifeRegex = /\(function\s*\(\s*\)\s*\{/g;
  const iifePositions = [];
  let m;
  while ((m = iifeRegex.exec(file)) !== null) {
    iifePositions.push(m.index);
  }

  if (iifePositions.length < 2) {
    console.log(`SKIP ${MODULE}: less than 2 IIFEs`);
    return;
  }

  // 外层 IIFE 是第一个，内层从第二个开始
  const outerIIFEStart = iifePositions[0];
  const outerPrefix = file.substring(0, iifePositions[1]);

  // 找到每个内层 IIFE 的结束 })()
  const innerBlocks = [];
  for (let i = 1; i < iifePositions.length; i++) {
    const start = iifePositions[i];
    const block = findIIFEEnd(file, start);
    if (block) {
      innerBlocks.push(block);
    } else {
      console.log(`  WARNING: could not find end of IIFE ${i} at pos ${start}`);
    }
  }

  if (innerBlocks.length === 0) {
    console.log(`SKIP ${MODULE}: no parseable inner blocks`);
    return;
  }

  console.log(`${MODULE} (format2, ${(origSize / 1024).toFixed(1)} KB, ${innerBlocks.length} inner blocks)`);

  // 找外层后缀
  const lastBlockEnd = innerBlocks[innerBlocks.length - 1].end;
  // 外层后缀是 })(); 之类
  const afterLastBlock = file.substring(lastBlockEnd);

  // 写入每个内层 block
  const sectionFiles = [];
  for (let i = 0; i < innerBlocks.length; i++) {
    const fileName = `${MODULE}-s${i + 1}.js`;
    sectionFiles.push(fileName);
    // 原样写入，不做任何修改
    fs.writeFileSync(path.join(DIR, fileName), innerBlocks[i].content, 'utf8');
    console.log(`  ${fileName}: ${(Buffer.byteLength(innerBlocks[i].content, 'utf8') / 1024).toFixed(1)} KB`);
  }

  // 新 loader：外层 wrapper + 逐个加载子脚本
  // 子脚本使用了外层的 container 变量，所以需要在同一作用域内执行
  // 方案：把每个子文件的内容读取并内联执行
  // 但这样 loader 会包含所有内容... 
  // 更好的方案：用 document.write 同步加载（在 HTML 中 script 按顺序执行）
  // 子文件本身就是自执行的 IIFE，它们能访问到外层的 container
  // 只要 HTML 中的 script 标签按顺序排列就行！
  // 所以新 loader 只需要外层 wrapper
  const newLoader = file.substring(0, outerIIFEStart) + outerPrefix +
    innerBlocks.map((_, i) => {
      // 不内联内容，而是在外层 IIFE 内同步加载子脚本
      // 但 document.write 在 </body> 前的 script 中可以用
      // 用 document.write('<script src="xxx"><\/script>') 会同步加载
      return '';
    }).join('') + afterLastBlock;

  // 实际上最简单的方式：新 loader 保持外层 IIFE 结构但不含内层 block
  // 内层 block 由 HTML 中的 script 标签按顺序加载
  // 但问题是内层 IIFE 依赖外层的 container 变量...
  // 
  // 解决方案：把外层变量挂到 window 上，让子文件能访问
  const loaderJs = file.substring(0, outerIIFEStart) +
    `(function() {\n` +
    `  window.__${VAR_PREFIX}_container = document.getElementById('content-area');\n` +
    `  if (!window.__${VAR_PREFIX}_container) return;\n` +
    `})();\n`;
  fs.writeFileSync(FILE, loaderJs, 'utf8');
  console.log(`  ${MODULE}-loader.js (new): ${(Buffer.byteLength(loaderJs, 'utf8') / 1024).toFixed(1)} KB`);

  // 更新子文件，把 container 引用改为 window.__xxx_container
  for (let i = 0; i < innerBlocks.length; i++) {
    const fn = path.join(DIR, sectionFiles[i]);
    let content = fs.readFileSync(fn, 'utf8');
    // 替换 container 引用
    // 内层 block 中的 container 引用来自外层作用域
    // 现在改为从 window 获取
    content = `(function(){var container=window.__${VAR_PREFIX}_container;if(!container)return;${content.trim().replace(/^\(function\s*\(\s*\)\s*\{/, '').replace(/\}\)\(\)\s*;?\s*$/, '})();')};\n`;
    // 这太复杂了... 换个更简洁的思路
  }

  // ===== 换思路 =====
  // 最简单的方式：loader 不变（保持外层IIFE），子文件只是把内层 IIFE 包装一下
  // 子文件用 (function(){ ... })(); 包装，直接操作外层作用域的 container
  // 但 JS 文件加载后作用域不同...
  // 
  // 最终方案：新 loader 把 container 挂到 window 上
  // 子文件在加载时从 window 取 container，然后执行原有逻辑

  // 重写子文件
  for (let i = 0; i < innerBlocks.length; i++) {
    const fn = path.join(DIR, sectionFiles[i]);
    let block = innerBlocks[i].content.trim();

    // 原始 block 是 (function() { var html = '...'; ... })();
    // 其中引用了外层的 container
    // 现在改为：var container = window.__xxx_container; 如果不存在就 return
    // 在第一个 { 后面插入

    const newBlock = `(function() {\n  var container = window.__${VAR_PREFIX}_container;\n  if (!container) return;\n${block.replace(/^\(function\s*\(\s*\)\s*\{\s*/, '').replace(/\}\s*\)\s*\(\s*\)\s*;?\s*$/, '})();\n')}`;
    fs.writeFileSync(fn, newBlock, 'utf8');
    console.log(`  ${sectionFiles[i]} (rewritten): ${(Buffer.byteLength(newBlock, 'utf8') / 1024).toFixed(1)} KB`);
  }

  updateHTML(HTML_FILE, MODULE, sectionFiles);
}

function findIIFEEnd(file, start) {
  // 从 start 位置找匹配的 })(); 
  let j = start;
  // 找到第一个 {
  while (j < file.length && file[j] !== '{') j++;
  if (j >= file.length) return null;

  let depth = 1;
  j++;

  while (j < file.length && depth > 0) {
    // 处理字符串字面量（跳过）
    if (file[j] === "'" || file[j] === '"') {
      const quote = file[j];
      j++;
      while (j < file.length) {
        if (file[j] === '\\') { j += 2; continue; }
        if (file[j] === quote) { j++; break; }
        j++;
      }
      continue;
    }
    if (file[j] === '{') depth++;
    if (file[j] === '}') depth--;
    j++;
  }

  // j 现在指向 } 后面，应该是 )();
  const rest = file.substring(j);
  const endMatch = rest.match(/^\)\s*\(\s*\)\s*;?/);
  if (endMatch) {
    const end = j + endMatch[0].length;
    return {
      content: file.substring(start, end),
      end: end
    };
  }
  return null;
}

function updateHTML(HTML_FILE, MODULE, sectionFiles) {
  if (fs.existsSync(HTML_FILE)) {
    let html = fs.readFileSync(HTML_FILE, 'utf8');
    const oldTag = `<script src="${MODULE}-loader.js"></script>`;
    if (html.includes(oldTag)) {
      const newTags = sectionFiles.map(f => `<script src="${f}"></script>`).join('\n') + `\n${oldTag}`;
      html = html.replace(oldTag, newTags);
      fs.writeFileSync(HTML_FILE, html, 'utf8');
      console.log(`  ${MODULE}.html: updated`);
    }
  }
}

console.log('\nDone!');
