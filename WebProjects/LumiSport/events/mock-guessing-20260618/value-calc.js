/* ============ 数值推算页 · 自上而下推导链 ============ */

const ODDS = 1.8;            // 固定赔率
const MAXBET = 200;          // 单场下注上限（定价锚点）
const COIN_PER_WIN = MAXBET * (ODDS - 1); // 猜对 1 场（押满）= 160 兑换币
const PKG_PRICE = 10;        // ¥ / 套餐
const PKG_COINS = 1000;      // 游戏币 / 套餐
const TIER_KEYS = ['A', 'B', 'C', 'D', 'E'];

// 档位默认配置：value 价值(¥)、hits 实际定档猜对场次、pool 总奖品池
const TIER_DEF = {
  A: { gift: '🎫', value: 10, hits: 2, pool: 30 },
  B: { gift: '🎁', value: 20, hits: 5, pool: 20 },
  C: { gift: '🎧', value: 40, hits: 8, pool: 10 },
  D: { gift: '🧸', value: 80, hits: 12, pool: 5 },
  E: { gift: '🏆', value: 160, hits: 15, pool: 5 },
};

const $ = (id) => document.getElementById(id);
const round = (n) => Math.round(n);
const fmt = (n) => round(n).toLocaleString('zh-CN');
const fmt1 = (n) => (Math.round(n * 10) / 10).toLocaleString('zh-CN');
const money = (n) => (n < 0 ? '−¥' : '¥') + fmt(Math.abs(n));
const pct = (x) => round(x * 100) + '%';

// 确定性随机（固定种子，避免拖动时数字抖动）
function makeRng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- 名次结构：按"几强单败"推导 ---------- */
function rankGroups(bracket) {
  const labels = { 4: '四强', 8: '八强', 16: '十六强', 32: '三十二强' };
  const groups = [{ name: '冠军', per: 1 }, { name: '亚军', per: 1 }];
  let remain = 4;
  while (remain <= bracket) {
    groups.push({ name: labels[remain] || remain + '强', per: remain / 2 });
    remain *= 2;
  }
  return groups; // [{name, per}], 合计 per = bracket
}

// 名次默认档位：冠军→E、亚军→D、四强→C、八强→B、十六强→A（从高到低）
function defaultTierForRank(idx) {
  const order = ['E', 'D', 'C', 'B', 'A'];
  return order[Math.min(idx, order.length - 1)];
}

/* ---------- 状态：当前各档位 value/hits/pool ---------- */
function readTierState() {
  const t = {};
  TIER_KEYS.forEach((k) => {
    const v = $('val_' + k), h = $('hit_' + k), p = $('pool_' + k);
    t[k] = {
      gift: TIER_DEF[k].gift,
      value: v ? +v.value : TIER_DEF[k].value,
      hits: h ? +h.value : TIER_DEF[k].hits,
      pool: p ? +p.value : TIER_DEF[k].pool,
      coins: (h ? +h.value : TIER_DEF[k].hits) * COIN_PER_WIN,
    };
  });
  return t;
}

let MAP_STATE = {}; // rankName -> tierKey

/* ========================================================= */
/* 推导主管线                                                 */
/* ========================================================= */
function recompute() {
  const rng = makeRng(20260618); // 每次重算重置，结果稳定

  /* ① 时长 → 场次 */
  const total = +$('s1_total').value;
  const open = +$('s1_open').value;
  const sw = +$('s1_switch').value;
  const award = +$('s1_award').value;
  const per = +$('s1_per').value;
  const projects = +$('s1_projects').value;
  const bracket = +$('s1_bracket').value;
  const switches = Math.max(0, projects - 1);
  const overhead = open + sw * switches + award;
  const playMin = total - overhead;
  const capacity = Math.max(0, Math.floor(playMin / per));
  const perProjectMatches = bracket - 1;
  const demand = projects * perProjectMatches;
  const N = demand;
  const fit = demand <= capacity;

  $('s1_total_v').textContent = total;
  $('s1_open_v').textContent = open;
  $('s1_switch_v').textContent = sw;
  $('s1_switchCnt').textContent = switches;
  $('s1_award_v').textContent = award;
  $('s1_per_v').textContent = per;
  $('s1_projects_v').textContent = projects;
  $('s1_bracket_v').textContent = bracket;
  $('s1_overhead').textContent = overhead + ' 分钟';
  $('s1_play').textContent = playMin + ' 分钟';
  $('s1_capacity').textContent = capacity + ' 场';
  $('s1_demand').textContent = demand + ' 场';
  $('s1_N').textContent = N;
  const fitTag = $('s1_fitTag');
  if (demand === capacity) { fitTag.textContent = '满负荷'; fitTag.className = 'out-hero-tag'; }
  else if (fit) { fitTag.textContent = '有余 ' + (capacity - demand) + ' 场'; fitTag.className = 'out-hero-tag ok'; }
  else { fitTag.textContent = '超载 ' + (demand - capacity) + ' 场'; fitTag.className = 'out-hero-tag warn'; }
  $('s1_note').textContent = fit
    ? `${playMin} ÷ ${per} = 容量 ${capacity} 场，赛事需求 ${demand} 场${demand === capacity ? '，正好满负荷、无缓冲。' : '，尚余 ' + (capacity - demand) + ' 场可做缓冲或加赛。'}`
    : `容量仅 ${capacity} 场，却需要 ${demand} 场 —— 放不下！需缩短单场、减少项目或降低强数。`;

  /* ② 赛制 → 名次结构 */
  const groups = rankGroups(bracket);
  const tiers = readTierState();
  // 同步映射状态（保留已选，新出现的名次用默认）
  const newMap = {};
  groups.forEach((g, i) => { newMap[g.name] = MAP_STATE[g.name] || defaultTierForRank(i); });
  MAP_STATE = newMap;

  const s2body = $('s2_body');
  s2body.innerHTML = groups.map((g) => {
    const tk = MAP_STATE[g.name];
    return `<tr>
      <td class="td-rank">${g.name}</td>
      <td>${g.per} 人</td>
      <td><b>${g.per * projects}</b> 人</td>
      <td>${tiers[tk].gift} ${tk} · ¥${tiers[tk].value}</td>
    </tr>`;
  }).join('');
  const rankTotal = groups.reduce((s, g) => s + g.per * projects, 0);
  $('s2_total').textContent = rankTotal;

  // 名次占用 per tier
  const rankUse = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  groups.forEach((g) => { rankUse[MAP_STATE[g.name]] += g.per * projects; });

  /* ③ 总池 − 名次 = 兑换库存 */
  const exStock = {};
  let stockWarn = false;
  TIER_KEYS.forEach((k) => {
    exStock[k] = tiers[k].pool - rankUse[k];
    if (exStock[k] < 0) stockWarn = true;
  });
  $('s3_body').innerHTML = TIER_KEYS.map((k) => {
    const left = exStock[k];
    const cls = left < 0 ? 'badge bad' : 'badge ok';
    return `<tr>
      <td class="td-rank">${tiers[k].gift} ${k}</td>
      <td class="td-val">¥${tiers[k].value}</td>
      <td><input type="number" class="cell-input" id="pool_${k}" value="${tiers[k].pool}" min="0" step="1"></td>
      <td class="td-muted">− ${rankUse[k]}</td>
      <td><span class="${cls}">${left} 份</span></td>
    </tr>`;
  }).join('');
  $('s3_note').innerHTML = stockWarn
    ? '⚠️ 有档位名次占用超过总池，兑换库存为负 —— 请增加总池或调整名次映射。'
    : '兑换库存 = 总池 − 名次占用，自动推导。iPhone 不计入档位，作为全场最高累计兑换币的专属大奖（见第 ⑧ 步）。';
  // 重新绑定 pool 输入（innerHTML 重建后）
  TIER_KEYS.forEach((k) => $('pool_' + k).addEventListener('input', recompute));

  /* ④ 档位定价透明化 */
  $('s4_reachTh').textContent = N + ' 场内可达？';
  $('s4_anchor').innerHTML =
    `猜对 1 场的兑换币 = 单场下注上限 <b>${MAXBET}</b> × (赔率 <b>${ODDS}</b> − 1) = <b class="hl">${COIN_PER_WIN} 兑换币</b>。所有门槛都由"猜对几场 × ${COIN_PER_WIN}"反推而来。`;
  $('s4_body').innerHTML = TIER_KEYS.map((k) => {
    const t = tiers[k];
    const linCoins = t.value * 100;
    const linHits = Math.ceil(linCoins / COIN_PER_WIN);
    const actCoins = t.coins;
    const disc = actCoins / linCoins; // 折扣比
    const linOk = linHits <= N;
    const actOk = t.hits <= N;
    return `<tr>
      <td class="td-rank">${t.gift} ${k}</td>
      <td class="td-val">¥<input type="number" class="cell-input" id="val_${k}" value="${t.value}" min="1" step="1" style="width:56px"></td>
      <td class="td-muted">${fmt(linCoins)}</td>
      <td class="${linOk ? 'td-muted' : ''}"><span class="${linOk ? '' : 'bad-t'}" style="${linOk ? '' : 'color:var(--red);font-weight:700'}">${linHits} 场</span></td>
      <td><input type="number" class="cell-input" id="hit_${k}" value="${t.hits}" min="1" max="${N}" step="1"></td>
      <td class="td-coins"><b>${fmt(actCoins)}</b></td>
      <td><span class="badge ${disc <= 0.5 ? 'warn' : ''}">${fmt1(disc * 10)} 折</span></td>
      <td class="dual">
        <div>线性 <span class="${linOk ? 'ok-t' : 'bad-t'}">${linOk ? '可达 ✓' : '不可达 ✗'}</span></div>
        <div>实际 <span class="${actOk ? 'ok-t' : 'bad-t'}">${actOk ? '可达 ✓' : '超 ' + (t.hits - N) + ' 场'}</span></div>
      </td>
    </tr>`;
  }).join('');
  TIER_KEYS.forEach((k) => {
    $('val_' + k).addEventListener('input', recompute);
    $('hit_' + k).addEventListener('input', recompute);
  });
  // QA 动态数字
  $('qa_c').textContent = Math.ceil(tiers.C.value * 100 / COIN_PER_WIN);
  $('qa_d').textContent = Math.ceil(tiers.D.value * 100 / COIN_PER_WIN);
  $('qa_e').textContent = Math.ceil(tiers.E.value * 100 / COIN_PER_WIN);
  $('qa_n').textContent = N;
  const discE = tiers.E.coins / (tiers.E.value * 100);
  const discMax = tiers.B.coins / (tiers.B.value * 100);
  $('qa_disc').textContent = `${fmt1(discE * 10)}~${fmt1(discMax * 10)}`;

  /* 观众行为假设 */
  const aud = +$('a_aud').value;
  const pkg = +$('a_pkg').value;
  const bet = +$('a_bet').value;
  const p = +$('a_win').value / 100;
  const initCoins = pkg * PKG_COINS;
  $('a_aud_v').textContent = aud;
  $('a_pkg_v').textContent = pkg;
  $('a_initCoins').textContent = fmt(initCoins);
  $('a_bet_v').textContent = bet;
  $('a_win_v').textContent = round(p * 100);

  /* ⑤ 游戏币需求 → 加购引导（蒙特卡洛） */
  const TRIALS = 4000;
  function completionProb(init, trials) {
    let done = 0;
    for (let t = 0; t < trials; t++) {
      let bal = init, ok = true;
      for (let i = 0; i < N; i++) {
        if (bal < bet) { ok = false; break; }
        bal -= bet;
        if (rng() < p) bal += bet * ODDS;
      }
      if (ok) done++;
    }
    return done / trials;
  }
  const floor = N * bet;
  $('s5_init').textContent = fmt(initCoins);
  $('s5_floor').textContent = fmt(floor) + ' 游戏币';
  const probNow = completionProb(initCoins, 2500);
  $('s5_prob').textContent = pct(probNow);
  $('s5_probSub').textContent = probNow >= 0.9
    ? '基本都能押满全场，无需加购'
    : `约 ${pct(1 - probNow)} 观众中途游戏币不足，需加购或降注`;

  // 加购阶梯：1~6 份套餐
  let recPkg = null;
  const ladderRows = [];
  for (let kpk = 1; kpk <= 6; kpk++) {
    const pr = completionProb(kpk * PKG_COINS, 1500);
    if (recPkg === null && pr >= 0.9) recPkg = kpk;
    ladderRows.push({ kpk, coins: kpk * PKG_COINS, pr });
  }
  $('s5_ladder').innerHTML = ladderRows.map((r) => {
    const isRec = r.kpk === recPkg;
    const addBuy = r.kpk - 1;
    return `<div class="ladder-row ${isRec ? 'rec' : ''}">
      <span class="ladder-coins">${fmt(r.coins)} 币</span>
      <span style="min-width:78px;color:var(--text-mute);font-size:12px">¥${r.kpk * PKG_PRICE}${addBuy ? ' · 加购' + addBuy : ' · 仅入场'}</span>
      <span class="ladder-bar-track"><span class="ladder-bar-fill" style="width:${(r.pr * 100).toFixed(0)}%"></span></span>
      <span class="ladder-prob">${pct(r.pr)}</span>
    </div>`;
  }).join('');
  $('s5_rec').innerHTML = recPkg
    ? `建议引导加购到 <strong>${recPkg} 份套餐（¥${recPkg * PKG_PRICE}）</strong>，押满全场概率即达 ≥90%。理论保底 ${fmt(floor)} 币（${Math.ceil(floor / PKG_COINS)} 份）可 100% 押满。`
    : `即便 6 份套餐仍难稳定押满，可适当降低单场注额或提示按余额下注。`;

  /* 共用：观众样本（per-capita 兑换币分布），供 ⑥⑦⑧ */
  const sample = new Float64Array(TRIALS);
  for (let t = 0; t < TRIALS; t++) {
    let bal = initCoins, wins = 0;
    for (let i = 0; i < N; i++) {
      if (bal < bet) break;
      bal -= bet;
      if (rng() < p) { bal += bet * ODDS; wins++; }
    }
    sample[t] = wins * bet * (ODDS - 1); // 该观众兑换币
  }
  // 每位观众可达的最高档位（按兑换币）
  const reachCount = { A: 0, B: 0, C: 0, D: 0, E: 0, none: 0 };
  for (let t = 0; t < TRIALS; t++) {
    const c = sample[t];
    let top = null;
    TIER_KEYS.forEach((k) => { if (c >= tiers[k].coins) top = k; });
    if (top) reachCount[top]++; else reachCount.none++;
  }

  /* ⑥ 库存承载力校验 */
  const demandByTier = {};
  TIER_KEYS.forEach((k) => { demandByTier[k] = aud * (reachCount[k] / TRIALS); });
  $('s6_body').innerHTML = TIER_KEYS.map((k) => {
    const need = demandByTier[k];
    const stock = exStock[k];
    const reachP = reachCount[k] / TRIALS;
    let concl;
    if (stock <= 0) concl = `<span class="badge warn">无兑换库存</span>`;
    else if (need <= stock) concl = `<span class="badge ok">充足（余 ${fmt1(stock - need)}）</span>`;
    else concl = `<span class="badge bad">缺 ${fmt1(need - stock)} 份</span>`;
    return `<tr>
      <td class="td-rank">${tiers[k].gift} ${k}</td>
      <td class="td-coins"><b>${fmt(tiers[k].coins)}</b></td>
      <td>${pct(reachP)}</td>
      <td><b style="color:var(--cyan-soft)">${fmt1(need)}</b> 份</td>
      <td>${stock} 份</td>
      <td>${concl}</td>
    </tr>`;
  }).join('');

  /* ⑦ 经济收支 */
  const redeem = +$('s7_redeem').value / 100;
  const iphoneCost = +$('s7_iphone').value;
  $('s7_redeem_v').textContent = round(redeem * 100);
  $('s7_iphone_v').textContent = fmt(iphoneCost);
  const revenue = aud * pkg * PKG_PRICE;
  let giftCost = 0;
  TIER_KEYS.forEach((k) => {
    const served = Math.min(demandByTier[k], Math.max(0, exStock[k])) * redeem;
    giftCost += served * tiers[k].value;
  });
  let rankCost = 0;
  TIER_KEYS.forEach((k) => { rankCost += rankUse[k] * tiers[k].value; });
  const net = revenue - giftCost - rankCost - iphoneCost;
  $('p_rev').textContent = money(revenue);
  $('p_revCalc').textContent = `${aud} × ${pkg} × ¥${PKG_PRICE}`;
  $('p_gift').textContent = money(giftCost);
  $('p_rank').textContent = money(rankCost);
  $('p_ip').textContent = money(iphoneCost);
  $('p_net').textContent = money(net);
  const netRow = $('p_netRow');
  netRow.classList.toggle('is-pos', net >= 0);
  netRow.classList.toggle('is-neg', net < 0);

  /* ⑧ iPhone 夺冠门槛 */
  const theoMax = N * MAXBET * (ODDS - 1);
  $('s8_max').textContent = fmt(theoMax);
  // 估计 aud 人中的最大兑换币：取样本的 (1 − 1/aud) 分位
  const sorted = Array.from(sample).sort((a, b) => a - b);
  const q = Math.min(0.9999, 1 - 1 / Math.max(2, aud));
  const champ = sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
  $('s8_champ').textContent = fmt(champ);
  $('s8_audTag').textContent = aud + ' 人';
  $('s8_champSub').textContent = `约相当于猜中 ${fmt1(champ / (bet * (ODDS - 1)))} 场（押 ${bet}）· 上限的 ${pct(champ / theoMax)}`;
}

/* ---------- ② 名次映射 UI（随赛制变化重建） ---------- */
function renderMapUI() {
  const bracket = +$('s1_bracket').value;
  const groups = rankGroups(bracket);
  const projects = +$('s1_projects').value;
  const wrap = $('s2_map');
  wrap.innerHTML = groups.map((g, i) => {
    const cur = MAP_STATE[g.name] || defaultTierForRank(i);
    const opts = TIER_KEYS.map((k) => `<option value="${k}" ${k === cur ? 'selected' : ''}>${k} · ¥${TIER_DEF[k].value}</option>`).join('');
    return `<div class="map-row">
      <span class="map-row-name">${g.name}<small>每项目 ${g.per} 人 · 全场 ${g.per * projects} 人</small></span>
      <select class="cell-sel" data-rank="${g.name}">${opts}</select>
    </div>`;
  }).join('');
  wrap.querySelectorAll('select[data-rank]').forEach((sel) => {
    sel.addEventListener('change', (e) => {
      MAP_STATE[e.target.dataset.rank] = e.target.value;
      recompute();
    });
  });
}

/* ---------- 导航 ---------- */
function initNav() {
  const nav = $('nav'), toggle = $('navToggle'), links = $('navLinks');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 20));
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => links.classList.remove('open')));
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  // 赛制/项目数变化时，重建映射 UI 再推导
  ['s1_bracket', 's1_projects'].forEach((id) => $(id).addEventListener('input', () => { renderMapUI(); recompute(); }));
  ['s1_total', 's1_open', 's1_switch', 's1_award', 's1_per',
   'a_aud', 'a_pkg', 'a_bet', 'a_win', 's7_redeem', 's7_iphone'].forEach((id) => $(id).addEventListener('input', recompute));
  renderMapUI();
  recompute();
});
