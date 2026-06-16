/* ============ 数值推算页 · 计算逻辑 ============ */

const CFG = {
  odds: 1.8,        // 猜中收回 = 下注 × 1.8
  exRate: 0.8,      // 兑换币 = 下注 × 0.8
  pkgPrice: 10,     // ¥ / 套餐
  pkgCoins: 1000,   // 游戏币 / 套餐
  maxMatches: 21,   // 全场可竞猜场次
  maxBet: 200,
};

// 单人理论最高兑换币：21 场全中、每场押满 200
const MAX_EX = CFG.maxMatches * CFG.maxBet * CFG.exRate; // 3360

const TIERS = [
  { rank: 'A', gift: '🎫', name: '入门礼', value: 10, coins: 320 },
  { rank: 'B', gift: '🎁', name: '精选礼', value: 20, coins: 800 },
  { rank: 'C', gift: '🎧', name: '品质礼', value: 40, coins: 1280 },
  { rank: 'D', gift: '🧸', name: '豪华礼', value: 80, coins: 1920 },
  { rank: 'E', gift: '🏆', name: '臻选礼', value: 160, coins: 2400 },
];

// 名次奖固定成本：冠军 3×160 + 亚军 3×80 + 四强 6×40 + 八强 12×20
const RANK_PRIZE_COST = 3 * 160 + 3 * 80 + 6 * 40 + 12 * 20; // 1200

const round = (n) => Math.round(n);
const fmt = (n) => round(n).toLocaleString('zh-CN');
const fmt1 = (n) => (Math.round(n * 10) / 10).toLocaleString('zh-CN');
const money = (n) => (n < 0 ? '−¥' : '¥') + fmt(Math.abs(n));

const $ = (id) => document.getElementById(id);

/* ---------- 玩家收益模拟 ---------- */
function calcPlayer() {
  const pkgs = +$('pkg').value;
  const bet = +$('bet').value;
  const matches = +$('match').value;
  const p = +$('win').value / 100;

  const initCoins = pkgs * CFG.pkgCoins;
  const expWins = matches * p;
  const exCoins = expWins * bet * CFG.exRate;
  // 游戏币期望盈亏 = 场次 × 下注 × (1.8p − 1)
  const gameChange = matches * bet * (CFG.odds * p - 1);
  const stakeVolume = matches * bet;

  // 输入回显
  $('pkgVal').textContent = pkgs;
  $('initCoins').textContent = fmt(initCoins);
  $('betVal').textContent = bet;
  $('matchVal').textContent = matches;
  $('winVal').textContent = round(p * 100);

  // 结果数字
  $('rWins').textContent = fmt1(expWins);
  $('rEx').textContent = fmt(exCoins);
  $('rGame').textContent = (gameChange >= 0 ? '+' : '−') + fmt(Math.abs(gameChange));

  const gameCard = $('gameCard');
  gameCard.classList.toggle('is-pos', gameChange > 0.5);
  gameCard.classList.toggle('is-neg', gameChange < -0.5);

  // 可解锁档位
  let reached = null;
  const chips = TIERS.map((t) => {
    const on = exCoins >= t.coins;
    if (on) reached = t;
    return `<div class="reach-chip ${on ? 'on' : ''}">
      <div class="rc-gift">${t.gift}</div>
      <div class="rc-rank">档位 ${t.rank}</div>
      <div class="rc-val">¥${t.value}</div>
    </div>`;
  }).join('');
  $('reachChips').innerHTML = chips;
  $('reachLabel').textContent = reached
    ? `最高 ${reached.rank} 档 · ¥${reached.value} ${reached.name}`
    : '尚未达到 A 档（320 兑换币）';

  // iPhone 进度
  const pct = Math.min(100, (exCoins / MAX_EX) * 100);
  $('iphoneFill').style.width = pct.toFixed(1) + '%';
  $('iphonePct').textContent = fmt1(pct);
  $('iphoneEx').textContent = fmt(exCoins);

  // 提示
  let tip = '';
  if (p < 1 / CFG.odds) {
    tip = `当前猜中率 ${round(p * 100)}% 低于盈亏平衡线 55.6%，游戏币期望为负 —— 长期会消耗本金，但兑换币仍在累积。`;
  } else if (p > 1 / CFG.odds) {
    tip = `当前猜中率 ${round(p * 100)}% 高于平衡线 55.6%，游戏币期望为正，可越玩越多、持续加注冲高兑换币。`;
  } else {
    tip = `恰好处在盈亏平衡线 55.6%，游戏币长期持平，兑换币随场次稳定累积。`;
  }
  if (initCoins < stakeVolume) {
    tip += ` 注意：计划下注总额 ${fmt(stakeVolume)} 游戏币已超过初始 ${fmt(initCoins)}，途中可能需要加购套餐补币。`;
  }
  $('simTip').textContent = tip;
}

/* ---------- 档位换算表 ---------- */
function renderTierTable() {
  const body = $('tierBody');
  body.innerHTML = TIERS.map((t) => {
    const hits = t.coins / (CFG.maxBet * CFG.exRate); // 押 200 所需猜中场次
    const perCoin = t.value / t.coins;
    return `<tr>
      <td class="td-rank">${t.rank}</td>
      <td class="td-gift">${t.gift} <span style="font-size:13px;color:var(--text-mute)">${t.name}</span></td>
      <td class="td-val">¥${t.value}</td>
      <td class="td-coins"><b>${fmt(t.coins)}</b></td>
      <td class="td-hits"><b>${fmt1(hits)}</b> 场</td>
      <td>¥${perCoin.toFixed(3)}</td>
    </tr>`;
  }).join('');
}

/* ---------- 主办方经济测算 ---------- */
function calcOrganizer() {
  const att = +$('att').value;
  const k = +$('oPkg').value;
  const m = +$('oMatch').value;
  const b = +$('oBet').value;
  const p = +$('oWin').value / 100;
  const redeem = +$('redeem').value / 100;
  const coinYuan = +$('coinVal').value / 1000; // 0.025–0.067
  const iphone = +$('iphoneCost').value;

  // 输入回显
  $('attVal').textContent = att;
  $('oPkgVal').textContent = k;
  $('oMatchVal').textContent = m;
  $('oBetVal').textContent = b;
  $('oWinVal').textContent = round(p * 100);
  $('redeemVal').textContent = round(redeem * 100);
  $('coinValShow').textContent = coinYuan.toFixed(3);
  $('iphoneCostVal').textContent = fmt(iphone);

  const revenue = att * k * CFG.pkgPrice;
  const exCoins = att * m * p * b * CFG.exRate;
  const giftCost = exCoins * redeem * coinYuan;
  const net = revenue - giftCost - RANK_PRIZE_COST - iphone;

  $('pRevenue').textContent = money(revenue);
  $('pExCoins').textContent = fmt(exCoins);
  $('pGiftCost').textContent = money(giftCost);
  $('pRankCost').textContent = money(RANK_PRIZE_COST);
  $('pIphone').textContent = money(iphone);
  $('pNet').textContent = money(net);

  const netRow = $('pnlNetRow');
  netRow.classList.toggle('is-pos', net >= 0);
  netRow.classList.toggle('is-neg', net < 0);
}

/* ---------- 导航 ---------- */
function initNav() {
  const nav = $('nav');
  const toggle = $('navToggle');
  const links = $('navLinks');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 20));
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => links.classList.remove('open')));
}

function bind(ids, handler) {
  ids.forEach((id) => $(id).addEventListener('input', handler));
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  renderTierTable();
  bind(['pkg', 'bet', 'match', 'win'], calcPlayer);
  bind(['att', 'oPkg', 'oMatch', 'oBet', 'oWin', 'redeem', 'coinVal', 'iphoneCost'], calcOrganizer);
  calcPlayer();
  calcOrganizer();
});
