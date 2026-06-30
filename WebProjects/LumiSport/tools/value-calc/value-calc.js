// ============ 预测数值计算 · 胜负链式模拟 ============
// 公式与 LumiSport 后端 player-rating.util.ts / betting.constants.ts 保持一致。

const ROWS = 30;

const PARAM_IDS = ['redInit','blueInit','fee','scoreRate','maxOdds','minOdds','minRating','voidRate'];
const DEFAULTS = { redInit:100, blueInit:100, fee:0.1, scoreRate:20, maxOdds:2.0, minOdds:1.1, minRating:1, voidRate:0.8 };

// 每行的胜负结果：'red' | 'blue' | 'draw'
let results = Array.from({ length: ROWS }, () => 'red');

function readParams(){
  const p = {};
  for(const k of PARAM_IDS){
    const el = document.getElementById('p_' + k);
    let v = parseFloat(el.value);
    if(!Number.isFinite(v)) v = DEFAULTS[k];
    p[k] = v;
  }
  return p;
}

const round2 = x => Math.round(Number(x) * 100) / 100;

function sanitize(value, fallback, minRating){
  const n = Number(value);
  if(!Number.isFinite(n)) return round2(fallback);
  return Math.max(minRating, round2(n));
}

function expectedWinRate(my, enemy, minRating){
  const a = sanitize(my, my, minRating);
  const b = sanitize(enemy, enemy, minRating);
  const total = a + b;
  if(total <= 0) return 0.5;
  return a / total;
}

function oddsFromRate(rate, p){
  const o = (1 / rate) * (1 - p.fee);
  return round2(Math.min(p.maxOdds, Math.max(p.minOdds, o)));
}

// 数字展示：去掉多余小数
function fmt(n){
  const r = round2(n);
  return Number.isInteger(r) ? String(r) : r.toFixed(2).replace(/0$/, '');
}
function pct(x){ return (x * 100).toFixed(1) + '%'; }

function deltaSpan(after, before){
  const d = round2(after - before);
  if(d > 0) return `<span class="delta-up">+${fmt(d)}</span>`;
  if(d < 0) return `<span class="delta-down">${fmt(d)}</span>`;
  return `<span class="delta-flat">±0</span>`;
}

function compute(){
  const p = readParams();
  const tbody = document.getElementById('tbody');
  let rows = '';

  let red = p.redInit;
  let blue = p.blueInit;

  for(let i = 0; i < ROWS; i++){
    const redBefore = sanitize(red, red, p.minRating);
    const blueBefore = sanitize(blue, blue, p.minRating);

    const redRate = expectedWinRate(redBefore, blueBefore, p.minRating);
    const blueRate = expectedWinRate(blueBefore, redBefore, p.minRating);
    const redOdds = oddsFromRate(redRate, p);
    const blueOdds = oddsFromRate(blueRate, p);

    const lopsided = Math.max(redRate, blueRate) > p.voidRate;

    const result = results[i];
    const S = redBefore + blueBefore;
    const redDelta = S > 0 ? p.scoreRate * (blueBefore / S) : 0;
    const blueDelta = S > 0 ? p.scoreRate * (redBefore / S) : 0;

    let redAfter, blueAfter;
    if(result === 'red'){
      redAfter = sanitize(redBefore + redDelta, redBefore, p.minRating);
      blueAfter = sanitize(blueBefore - blueDelta, blueBefore, p.minRating);
    } else if(result === 'blue'){
      redAfter = sanitize(redBefore - redDelta, redBefore, p.minRating);
      blueAfter = sanitize(blueBefore + blueDelta, blueBefore, p.minRating);
    } else { // draw
      redAfter = sanitize(redBefore, redBefore, p.minRating);
      blueAfter = sanitize(blueBefore, blueBefore, p.minRating);
    }

    const on = r => result === r ? ' on ' + r : '';
    rows += `<tr class="${lopsided ? 'row-lopsided' : ''}">
      <td class="col-no">${i + 1}</td>
      <td class="val-red">${fmt(redBefore)}</td>
      <td class="val-blue">${fmt(blueBefore)}</td>
      <td class="val-dim">${pct(redRate)}${lopsided && redRate >= blueRate ? '<span class="lopsided">悬殊</span>' : ''}</td>
      <td class="val-dim">${pct(blueRate)}${lopsided && blueRate > redRate ? '<span class="lopsided">悬殊</span>' : ''}</td>
      <td class="val-red">${redOdds.toFixed(2)}</td>
      <td class="val-blue">${blueOdds.toFixed(2)}</td>
      <td>
        <div class="result-toggle" data-row="${i}">
          <button class="${on('red')}" data-r="red">红胜</button>
          <button class="${on('blue')}" data-r="blue">蓝胜</button>
          <button class="${on('draw')}" data-r="draw">平局</button>
        </div>
      </td>
      <td class="val-red">${fmt(redAfter)} ${deltaSpan(redAfter, redBefore)}</td>
      <td class="val-blue">${fmt(blueAfter)} ${deltaSpan(blueAfter, blueBefore)}</td>
    </tr>`;

    red = redAfter;
    blue = blueAfter;
  }

  tbody.innerHTML = rows;
  bindToggles();
}

function bindToggles(){
  document.querySelectorAll('.result-toggle').forEach(group => {
    const row = parseInt(group.dataset.row, 10);
    group.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        results[row] = btn.dataset.r;
        compute();
      });
    });
  });
}

// 工具栏
document.getElementById('btnAllRed').addEventListener('click', () => { results = Array.from({ length: ROWS }, () => 'red'); compute(); });
document.getElementById('btnAllBlue').addEventListener('click', () => { results = Array.from({ length: ROWS }, () => 'blue'); compute(); });
document.getElementById('btnAlt').addEventListener('click', () => { results = Array.from({ length: ROWS }, (_, i) => i % 2 === 0 ? 'red' : 'blue'); compute(); });
document.getElementById('btnReset').addEventListener('click', () => {
  for(const k of PARAM_IDS){ document.getElementById('p_' + k).value = DEFAULTS[k]; }
  results = Array.from({ length: ROWS }, () => 'red');
  compute();
});

PARAM_IDS.forEach(k => document.getElementById('p_' + k).addEventListener('input', compute));

compute();
