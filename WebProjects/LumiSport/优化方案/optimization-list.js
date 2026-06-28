/* ============================================================
 * 竞技大空间 · 优化迭代清单 — 数据 + 渲染 + 交互
 * ============================================================ */

/* ===== 人员配色（每人固定色相，视觉一致） ===== */
const PERSON_COLORS = {
  '燕鸿': { bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.25)', text: '#93C5FD' },
  '智涵': { bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.25)', text: '#6EE7B7' },
  '侯涛': { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.25)', text: '#FCD34D' },
  '辉杰': { bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)', text: '#C4B5FD' },
  '启文': { bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.25)', text: '#F9A8D4' },
  '暑生': { bg: 'rgba(34,211,238,0.12)', border: 'rgba(34,211,238,0.25)', text: '#67E8F9' },
  '文杰': { bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.25)', text: '#FDBA74' },
  '林鹏': { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.25)', text: '#FCA5A5' },
  '尹涵': { bg: 'rgba(134,239,172,0.12)', border: 'rgba(134,239,172,0.25)', text: '#86EFAC' },
  '嫣红': { bg: 'rgba(249,168,212,0.12)', border: 'rgba(249,168,212,0.25)', text: '#FBCFE8' },
};
const DEFAULT_COLOR = { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)', text: 'rgba(248,250,252,0.6)' };

/* 人员排序表（与 PERSON_COLORS 顺序一致） */
const PERSON_ORDER = Object.keys(PERSON_COLORS);

function personStyle(name) {
  const c = PERSON_COLORS[name] || DEFAULT_COLOR;
  return `background:${c.bg};border-color:${c.border};color:${c.text}`;
}

/* 按固定顺序排列负责人 */
function sortPeople(people) {
  return [...people].sort((a, b) => {
    const ia = PERSON_ORDER.indexOf(a);
    const ib = PERSON_ORDER.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });
}

/* ===== 子模块数据（subject: 主体，detail: 详情） ===== */
const SUBCATS = {
  global: [
    { subject: '空间定位', detail: '重新识别，原点调整，往屏幕方向靠一些，控制距离在 1 米左右', people: ['辉杰'] },
    { subject: '开场视频', detail: '音乐与视频独立开来（音乐单独管理）', people: ['燕鸿', '侯涛'] },
    { subject: '规则视频', detail: '修改（冰球 + 拳王）', people: ['侯涛'] },
    { subject: '投屏', detail: '增加实时展示报名情况', people: ['辉杰', '尹涵', '智涵', '嫣红'] },
    { subject: '投屏', detail: '实时反馈预测的积分数值对比', people: ['辉杰', '尹涵', '智涵', '嫣红'] },
    { subject: '预测', detail: '超过80%胜率仍然可以预测', people: ['尹涵', '辉杰'] },
    { subject: '热身功能', detail: '支持小程序操控', people: ['辉杰', '尹涵', '智涵'] },
    { subject: '精彩回放', detail: '迭代实现（白屏 + 右下角文字）', people: ['智涵', '侯涛'] },
    { subject: '匹配流程', detail: '新一局进入匹配后，上一局的玩家名称要去掉', people: ['智涵'] },
  ],
  boxer: [
    { subject: '音效', detail: '挥拳没有声音，需要补上', people: ['辉杰'] },
    { subject: '角色模型', detail: '女生戴面罩', people: ['文杰'] },
    { subject: '选手间距', detail: '调节对方选手模型与玩家自己的间距', people: ['辉杰'] },
    { subject: '倒地读秒', detail: '考虑增加表现（设计）', people: ['林鹏'] },
  ],
  fencing: [
    { subject: '脚底格子', detail: '特效表现优化', people: ['启文', '暑生'] },
    { subject: '拼剑', detail: '投屏增加动作 & 特效表现', people: ['启文', '文杰', '暑生'] },
    { subject: '标记点', detail: '增加 4 个（头部、两侧肩膀、腹部），只有标记点才可攻击', people: ['辉杰', '暑生'] },
    { subject: '剑身', detail: '长短调小', people: ['启文', '文杰', '暑生'] },
    { subject: '攻击节奏', detail: '击中对手或被格挡后，需将剑收回安全区域内标记点才会重新出现，之后才能继续攻击', people: ['辉杰', '暑生'] },
    { subject: '格挡', detail: '投屏增加相应的动作表现', people: ['文杰', '暑生'] },
    { subject: '角色模型', detail: '女生前进动作穿模问题修复', people: ['文杰'] },
  ],
  hockey: [
    { subject: '屏幕', detail: '分辨率适配', people: ['林鹏', '文杰'] },
    { subject: '冰盾', detail: '两边位置微调', people: ['辉杰'] },
  ],
  magic: [
    { subject: '公司研学版', detail: '迭代，运营提出优化需求，过滤并确认哪些需要修改', people: ['侯涛'] },
    { subject: '门店运营', detail: '建议收集 + 迭代方案设计', people: ['侯涛'] },
    { subject: '流程体验', detail: '优化需求汇总', people: ['林鹏', '燕鸿'] },
  ],
};

/* ===== 两大模块定义 ===== */
const MASTER_MODULES = [
  {
    id: 'magic',
    name: '魔法学院 · 第一季',
    icon: '✨',
    cls: 'master-magic',
    isStandalone: true,
    subcats: [{ id: 'magic', name: '魔法学院 · 第一季', icon: '✨', cls: 'cat-magic' }],
  },
  {
    id: 'sport',
    name: '竞技大空间',
    icon: '🏟️',
    cls: 'master-sport',
    isStandalone: false,
    subcats: [
      { id: 'global',  name: '通用 / 全局',  icon: '🌐', cls: 'cat-global' },
      { id: 'hockey',  name: '疾速冰球',     icon: '🏒', cls: 'cat-hockey' },
      { id: 'boxer',   name: '烈焰拳王',     icon: '🥊', cls: 'cat-boxer' },
      { id: 'fencing', name: '雷霆击剑',     icon: '⚡', cls: 'cat-fencing' },
    ],
  },
];

/* ===== 统计 ===== */
function getStats() {
  let total = 0;
  const personMap = {};
  Object.values(SUBCATS).forEach(items => {
    total += items.length;
    items.forEach(item => {
      item.people.forEach(p => { personMap[p] = (personMap[p] || 0) + 1; });
    });
  });
  return { total, people: Object.keys(personMap).length, categories: 2 };
}

/* ===== 渲染：统计栏 ===== */
function renderStats() {
  const s = getStats();
  const html = `
    <div class="stat-chip">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
      <span class="num">${s.total}</span> 项任务
    </div>
    <div class="stat-chip">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      <span class="num">${s.people}</span> 位负责人
    </div>
    <div class="stat-chip">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      <span class="num">${s.categories}</span> 大模块
    </div>
  `;
  document.getElementById('stats-bar').innerHTML = html;
}

/* ===== 渲染：筛选栏 ===== */
function renderFilters() {
  const chips = [`<span class="filter-chip active" data-filter="all">全部</span>`];
  MASTER_MODULES.forEach(m => {
    chips.push(`<span class="filter-chip" data-filter="${m.id}">${m.icon} ${m.name}</span>`);
  });
  document.getElementById('filter-bar').innerHTML = chips.join('');

  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.dataset.filter;
      document.querySelectorAll('.master-section').forEach(sec => {
        sec.style.display = (filter === 'all' || sec.dataset.master === filter) ? '' : 'none';
      });
    });
  });
}

/* ===== 渲染：任务卡片组 ===== */
function renderTaskList(items) {
  return items.map((item, i) => {
    const sorted = sortPeople(item.people);
    return `
      <div class="task-card">
        <div class="task-num">${String(i + 1).padStart(2, '0')}</div>
        <div class="task-body">
          <div class="task-desc">
            <span class="task-subject">${item.subject}</span>
            <span class="task-detail">${item.detail}</span>
          </div>
        </div>
        <div class="task-people">
          ${sorted.map(p => `<span class="person-tag" style="${personStyle(p)}">${p}</span>`).join('')}
        </div>
      </div>
    `;
  }).join('');
}

/* ===== 渲染：子模块 ===== */
function renderSubcat(subcat) {
  const items = SUBCATS[subcat.id] || [];
  return `
    <div class="category-section ${subcat.cls}" data-cat="${subcat.id}">
      <div class="category-header">
        <div class="category-icon">${subcat.icon}</div>
        <span class="category-title">${subcat.name}</span>
        <span class="category-count">${items.length} 项</span>
      </div>
      <div class="task-list">
        ${renderTaskList(items)}
      </div>
    </div>
  `;
}

/* ===== 渲染：主模块 ===== */
function renderMasterModules() {
  const container = document.getElementById('main-content');

  container.innerHTML = MASTER_MODULES.map(m => {
    let totalCount = 0;
    m.subcats.forEach(sc => { totalCount += (SUBCATS[sc.id] || []).length; });

    return `
      <div class="master-section ${m.cls}" data-master="${m.id}">
        <div class="master-header">
          <div class="master-icon">${m.icon}</div>
          <span class="master-title">${m.name}</span>
          <span class="master-count">${totalCount} 项</span>
        </div>
        ${m.subcats.map(sc => renderSubcat(sc)).join('')}
      </div>
    `;
  }).join('');
}

/* ===== 初始化 ===== */
document.addEventListener('DOMContentLoaded', () => {
  renderStats();
  renderFilters();
  renderMasterModules();
});
