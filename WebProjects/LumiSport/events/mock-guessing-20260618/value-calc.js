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
  B: { gift: '🎁', value: 20, hits: 4, pool: 20 },
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

/* ---------- 比赛奖励：上场选手按各项目名次发放（独立实物，不占竞猜库存） ---------- */
// 默认单价（元），⑦ 收支可调；「其他参赛」绑定竞猜兑换 A 档价值（10 元档）
const MATCH_DEF = {
  first: { gift: '🥽', name: '3D高清观影智能眼镜', value: 1000 },
  second: { gift: '⌚', name: '华为 NFC 手环', value: 199 },
};
// 累计竞猜奖励：第 1 名 iPad，第 2/3 名 高清观影眼镜（同款）
const CUM_IPAD = 3000; // iPad 默认成本（元），⑦ 可调

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

  /* ② 赛制 → 比赛奖励结构 */
  const tiers = readTierState();
  const eyewearVal = +($('s7_eyewear') ? $('s7_eyewear').value : MATCH_DEF.first.value);
  const nfcVal = +($('s7_nfc') ? $('s7_nfc').value : MATCH_DEF.second.value);
  const otherPer = Math.max(0, bracket - 2);
  const matchRows = [
    { name: '第一名', gift: MATCH_DEF.first.gift, prize: MATCH_DEF.first.name, per: 1, cnt: projects, unit: eyewearVal },
    { name: '第二名', gift: MATCH_DEF.second.gift, prize: MATCH_DEF.second.name, per: 1, cnt: projects, unit: nfcVal },
    { name: '其他参赛', gift: '🎫', prize: '10 元档奖励', per: otherPer, cnt: projects * otherPer, unit: tiers.A.value },
  ];
  $('s2_body').innerHTML = matchRows.map((r) => `<tr>
      <td class="td-rank" data-label="名次">${r.name}</td>
      <td data-label="每项目">${r.per} 人</td>
      <td data-label="× 项目数"><b>${r.cnt}</b> 人</td>
      <td data-label="比赛奖励">${r.gift} ${r.prize}</td>
    </tr>`).join('');
  const matchTotal = matchRows.reduce((s, r) => s + r.cnt, 0);
  $('s2_total').textContent = matchTotal;
  // 比赛奖励总成本：观影眼镜×冠军 + NFC×亚军 + 10元档×其他参赛
  const matchCost = matchRows.reduce((s, r) => s + r.cnt * r.unit, 0);

  /* ③ 竞猜兑换库存（独立于比赛奖励，不再被名次占用） */
  const exStock = {};
  TIER_KEYS.forEach((k) => { exStock[k] = tiers[k].pool; });
  $('s3_body').innerHTML = TIER_KEYS.map((k) => {
    return `<tr>
      <td class="td-rank" data-label="档位">${tiers[k].gift} ${k}</td>
      <td class="td-val" data-label="礼品价值">¥${tiers[k].value}</td>
      <td data-label="竞猜兑换库存"><input type="number" class="cell-input" id="pool_${k}" value="${tiers[k].pool}" min="0" step="1"></td>
      <td data-label="可兑份数"><span class="badge ok">${exStock[k]} 份</span></td>
    </tr>`;
  }).join('');
  $('s3_note').innerHTML = '竞猜兑换库存为观众专属，先到先得；比赛奖励（观影眼镜 / NFC 手环 / 10 元档）与累计竞猜奖励均为独立实物，不占用此库存。iPad 作为累计兑换币第 1 名的专属大奖（见第 ⑧ 步）。';
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
      <td class="td-rank" data-label="档位">${t.gift} ${k}</td>
      <td class="td-val" data-label="价值">¥<input type="number" class="cell-input" id="val_${k}" value="${t.value}" min="1" step="1" style="width:56px"></td>
      <td class="td-muted" data-label="①线性所需兑换币">${fmt(linCoins)}</td>
      <td data-label="②线性所需场次" class="${linOk ? 'td-muted' : ''}"><span class="${linOk ? '' : 'bad-t'}" style="${linOk ? '' : 'color:var(--red);font-weight:700'}">${linHits} 场</span></td>
      <td data-label="③实际定档场次"><input type="number" class="cell-input" id="hit_${k}" value="${t.hits}" min="1" max="${N}" step="1"></td>
      <td class="td-coins" data-label="④实际所需兑换币"><b>${fmt(actCoins)}</b></td>
      <td data-label="折扣"><span class="badge ${disc <= 0.5 ? 'warn' : ''}">${fmt1(disc * 10)} 折</span></td>
      <td class="dual" data-label="可达性">
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
      <td class="td-rank" data-label="档位">${tiers[k].gift} ${k}</td>
      <td class="td-coins" data-label="门槛(兑换币)"><b>${fmt(tiers[k].coins)}</b></td>
      <td data-label="可达人数比例">${pct(reachP)}</td>
      <td data-label="预计兑换需求"><b style="color:var(--cyan-soft)">${fmt1(need)}</b> 份</td>
      <td data-label="兑换库存">${stock} 份</td>
      <td data-label="结论">${concl}</td>
    </tr>`;
  }).join('');

  /* ⑦ 经济收支 */
  const redeem = +$('s7_redeem').value / 100;
  const ipadCost = +$('s7_ipad').value;
  $('s7_redeem_v').textContent = round(redeem * 100);
  $('s7_ipad_v').textContent = fmt(ipadCost);
  if ($('s7_eyewear_v')) $('s7_eyewear_v').textContent = fmt(eyewearVal);
  if ($('s7_nfc_v')) $('s7_nfc_v').textContent = fmt(nfcVal);
  const revenue = aud * pkg * PKG_PRICE;
  let giftCost = 0;
  TIER_KEYS.forEach((k) => {
    const served = Math.min(demandByTier[k], Math.max(0, exStock[k])) * redeem;
    giftCost += served * tiers[k].value;
  });
  // 累计竞猜奖励：第 1 名 iPad + 第 2/3 名 观影眼镜 ×2
  const cumCost = ipadCost + 2 * eyewearVal;
  const net = revenue - giftCost - matchCost - cumCost;
  $('p_rev').textContent = money(revenue);
  $('p_revCalc').textContent = `${aud} × ${pkg} × ¥${PKG_PRICE}`;
  $('p_gift').textContent = money(giftCost);
  $('p_rank').textContent = money(matchCost);
  $('p_ip').textContent = money(cumCost);
  $('p_net').textContent = money(net);
  const netRow = $('p_netRow');
  netRow.classList.toggle('is-pos', net >= 0);
  netRow.classList.toggle('is-neg', net < 0);

  /* ⑧ 累计竞猜门槛（前三名） */
  const theoMax = N * MAXBET * (ODDS - 1);
  $('s8_max').textContent = fmt(theoMax);
  // 估计 aud 人中第 1/2/3 名的累计兑换币：取样本的 (1 − r/aud) 分位
  const sorted = Array.from(sample).sort((a, b) => a - b);
  const quantile = (rankFromTop) => {
    const q = Math.min(0.9999, 1 - rankFromTop / Math.max(2, aud));
    return sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor(q * sorted.length)))];
  };
  const champ1 = quantile(1), champ2 = quantile(2), champ3 = quantile(3);
  $('s8_champ').textContent = fmt(champ1);
  $('s8_audTag').textContent = aud + ' 人';
  $('s8_champSub').textContent = `第 1 名(iPad) ≈ ${fmt(champ1)} · 第 2 名 ≈ ${fmt(champ2)} · 第 3 名 ≈ ${fmt(champ3)} 兑换币（第 2、3 名得观影眼镜）· 第 1 名约相当于押 ${bet} 猜中 ${fmt1(champ1 / (bet * (ODDS - 1)))} 场`;
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
  ['s1_bracket', 's1_projects', 's1_total', 's1_open', 's1_switch', 's1_award', 's1_per',
   'a_aud', 'a_pkg', 'a_bet', 'a_win',
   's7_redeem', 's7_ipad', 's7_eyewear', 's7_nfc'].forEach((id) => {
    const e = $(id);
    if (e) e.addEventListener('input', recompute);
  });
  recompute();
});
