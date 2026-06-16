/* ============ Lumi 竞技大空间模拟竞猜活动 · 介绍页数据与渲染 ============ */

const GAMES = [
  {
    icon: '🏒', name: '疾速冰球', en: 'SPEED HOCKEY',
    accent: 'linear-gradient(90deg,#00e0ff,#7ee8ff)',
    desc: '在大空间内攻防转换，把球射入对方球门，速度与反应的较量。',
    tags: ['1v1 对抗', '进球得分', '8 强争霸'],
    ruleLink: '../../warmup-docs/speed-hockey.html',
  },
  {
    icon: '🥊', name: '烈焰拳王', en: 'BLAZING BOXER',
    accent: 'linear-gradient(90deg,#ff7a3d,#ff2db7)',
    desc: '挥拳、格挡、爆发怒气，击倒对手或在限时内压制取胜。',
    tags: ['1v1 对抗', '击倒制胜', '8 强争霸'],
    ruleLink: '../../warmup-docs/blazing-boxer.html',
  },
  {
    icon: '🤺', name: '雷霆击剑', en: 'THUNDER FENCING',
    accent: 'linear-gradient(90deg,#9a7dff,#00e0ff)',
    desc: '挥剑突刺、闪避走位，以精准与节奏拿下回合得分。',
    tags: ['1v1 对抗', '比分制胜', '8 强争霸'],
    ruleLink: '../../warmup-docs/thunder-fencing.html',
  },
];

const BRACKET = [
  { title: '1/4 决赛', matches: ['对决 1', '对决 2', '对决 3', '对决 4'] },
  { title: '半决赛', matches: ['半决赛 1', '半决赛 2'] },
  { title: '决赛', matches: ['冠军战'], final: true },
];

const TIMELINE = [
  { time: '18:30 – 18:35', name: '开场', sub: '规则、安全须知、竞猜说明', dur: '5 分钟', type: 'open' },
  { time: '18:35 – 19:10', name: '疾速冰球 8 强', sub: '7 场对决', dur: '35 分钟', type: 'match' },
  { time: '19:10 – 19:15', name: '换项目 → 烈焰拳王', sub: '场地与玩法切换', dur: '5 分钟', type: 'break' },
  { time: '19:15 – 19:50', name: '烈焰拳王 8 强', sub: '7 场对决', dur: '35 分钟', type: 'match' },
  { time: '19:50 – 19:55', name: '换项目 → 雷霆击剑', sub: '场地与玩法切换', dur: '5 分钟', type: 'break' },
  { time: '19:55 – 20:30', name: '雷霆击剑 8 强', sub: '7 场对决', dur: '35 分钟', type: 'match' },
  { time: '20:30', name: '活动收官', sub: '准时结束', dur: '', type: 'end' },
];

const STEPS = [
  { icon: '🎟️', title: '入场领币', desc: '¥10 入场得 1000 游戏币，不够可加购套餐补币。' },
  { icon: '👀', title: '选红或蓝', desc: '每场开盘后，选你看好的红方或蓝方获胜。' },
  { icon: '🎯', title: '下注游戏币', desc: '单场 10–200 币，关盘前确认下注。' },
  { icon: '🎉', title: '结算赢币', desc: '猜中按赔率返游戏币，额外得兑换币换好礼。' },
];

const TIERS = [
  { rank: 'A', gift: '🎫', name: '入门礼', value: '¥10', hits: 2, coins: 320, exchangeStock: 30 },
  { rank: 'B', gift: '🎁', name: '精选礼', value: '¥20', hits: 5, coins: 800, exchangeStock: 20 },
  { rank: 'C', gift: '🎧', name: '品质礼', value: '¥40', hits: 8, coins: 1280, exchangeStock: 12 },
  { rank: 'D', gift: '🧸', name: '豪华礼', value: '¥80', hits: 12, coins: 1920, exchangeStock: 6 },
  { rank: 'E', gift: '🏆', name: '臻选礼', value: '¥160', hits: 15, coins: 2400, exchangeStock: 3 },
];

const RANK_PRIZES = [
  { rank: '冠军', tier: 'E', gift: '🏆', value: '¥160', perProject: 1, total: 3, note: '各项目决赛胜方' },
  { rank: '亚军', tier: 'D', gift: '🧸', value: '¥80', perProject: 1, total: 3, note: '各项目决赛负方' },
  { rank: '四强', tier: 'C', gift: '🎧', value: '¥40', perProject: 2, total: 6, note: '各项目半决赛负方（2 人）' },
  { rank: '八强', tier: 'B', gift: '🎁', value: '¥20', perProject: 4, total: 12, note: '各项目 1/4 决赛负方（4 人）' },
];

const FAQS = [
  { q: '我不上场，也能玩吗？', a: '可以。观众无需上场，只要入场领币即可对每一场红蓝胜负下注竞猜。' },
  { q: '游戏币和兑换币有什么区别？', a: '游戏币用于竞猜下注；兑换币是猜中赚到的利润，用来在奖品区兑换礼品。' },
  { q: '为什么赔率都是 1.8？', a: '所有选手初始积分相同，8 强对阵双方实力对等，当晚每场胜负赔率均为 1.8。' },
  { q: '猜错会怎样？', a: '猜错则扣除本次下注的游戏币，且不获得兑换币；游戏币不够时可加购套餐补充。' },
  { q: '选手能不能押自己？', a: '选手上场需消耗 200 游戏币，本身就视为押注自己获胜；但不能再以观众身份押同一场。' },
  { q: '奖品什么时候发？', a: '比赛名次奖按淘汰赛名次现场发放，走名次专属奖池；竞猜兑换奖凭兑换币在奖品区兑换，走竞猜专属库存，两者互不影响。' },
  { q: 'iPhone 怎么获得？', a: 'iPhone 不属于档位兑换，而是当晚全场累计兑换币数量最高的用户专属获得；活动结束时统计公布。' },
  { q: '名次奖和竞猜兑换会抢同一份库存吗？', a: '不会。两者礼品档位相同，但分两个奖池：名次奖按比赛结果现场发放，竞猜兑换按「竞猜可兑」份数先到先得，互不影响。' },
];

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstChild;
}

function renderGames() {
  const grid = document.getElementById('gamesGrid');
  GAMES.forEach((g) => {
    grid.appendChild(el(`
      <div class="game-card reveal">
        <div class="game-card-accent" style="background:${g.accent}"></div>
        <div class="game-icon">${g.icon}</div>
        <div class="game-name">${g.name}</div>
        <div class="game-en">${g.en}</div>
        <div class="game-desc">${g.desc}</div>
        <div class="game-tags">${g.tags.map((t) => `<span class="game-tag">${t}</span>`).join('')}</div>
        <a class="game-rule-link" href="${g.ruleLink}">了解玩法规则 →</a>
      </div>`));
  });
}

function renderBracket() {
  const wrap = document.getElementById('bracket');
  BRACKET.forEach((round) => {
    const col = el(`<div class="bracket-round reveal"></div>`);
    col.appendChild(el(`<div class="bracket-round-title">${round.title}</div>`));
    round.matches.forEach((m) => {
      col.appendChild(el(`<div class="bracket-match ${round.final ? 'final' : ''}">${m}</div>`));
    });
    wrap.appendChild(col);
  });
}

function renderTimeline() {
  const tl = document.getElementById('timeline');
  TIMELINE.forEach((item) => {
    tl.appendChild(el(`
      <div class="tl-item is-${item.type} reveal">
        <div class="tl-dot"></div>
        <div class="tl-card">
          <div class="tl-time">${item.time}</div>
          <div class="tl-body">
            <div class="tl-name">${item.name}</div>
            ${item.sub ? `<div class="tl-sub">${item.sub}</div>` : ''}
          </div>
          ${item.dur ? `<div class="tl-dur">${item.dur}</div>` : ''}
        </div>
      </div>`));
  });
}

function renderSteps() {
  const wrap = document.getElementById('steps');
  STEPS.forEach((s, i) => {
    wrap.appendChild(el(`
      <div class="step reveal">
        <div class="step-num">${i + 1}</div>
        <div class="step-icon">${s.icon}</div>
        <div class="step-title">${s.title}</div>
        <div class="step-desc">${s.desc}</div>
      </div>`));
  });
}

function renderTiers() {
  const grid = document.getElementById('tierGrid');
  TIERS.forEach((t) => {
    const stockClass = t.exchangeStock <= 3 ? 'tier-stock-low' : t.exchangeStock <= 8 ? 'tier-stock-mid' : '';
    grid.appendChild(el(`
      <div class="tier reveal">
        <div class="tier-rank">档位 ${t.rank}</div>
        <div class="tier-gift">${t.gift}</div>
        <div class="tier-name">${t.name}</div>
        <div class="tier-value">${t.value}</div>
        <div class="tier-hits">猜对 <b>${t.hits}</b> 场可兑</div>
        <div class="tier-coins">${t.coins} 兑换币</div>
        <div class="tier-stock ${stockClass}">竞猜可兑 <b>${t.exchangeStock}</b> 份</div>
      </div>`));
  });
}

function renderRankPrizes() {
  const grid = document.getElementById('rankPrizeGrid');
  RANK_PRIZES.forEach((r) => {
    grid.appendChild(el(`
      <div class="rank-prize reveal">
        <div class="rank-prize-head">
          <span class="rank-prize-rank">${r.rank}</span>
          <span class="rank-prize-count">每项目 ${r.perProject} 人 · 全场 ${r.total} 人</span>
        </div>
        <div class="rank-prize-body">
          <div class="rank-prize-gift">${r.gift}</div>
          <div class="rank-prize-info">
            <div class="rank-prize-tier">对应 <strong>档位 ${r.tier}</strong> · ${r.value}</div>
            <div class="rank-prize-note">${r.note}</div>
          </div>
        </div>
      </div>`));
  });
}

function renderFaqs() {
  const grid = document.getElementById('faqGrid');
  FAQS.forEach((f) => {
    grid.appendChild(el(`
      <div class="faq reveal">
        <div class="faq-q"><span class="q-mark">Q</span>${f.q}</div>
        <div class="faq-a">${f.a}</div>
      </div>`));
  });
}

function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => links.classList.remove('open'))
  );
}

function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((n) => io.observe(n));
}

document.addEventListener('DOMContentLoaded', () => {
  renderGames();
  renderBracket();
  renderTimeline();
  renderSteps();
  renderRankPrizes();
  renderTiers();
  renderFaqs();
  initNav();
  initReveal();
});
