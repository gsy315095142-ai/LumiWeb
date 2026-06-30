/* ============================================================
 * 报名与预测流程 · 迭代说明 — 数据 + 渲染
 * ============================================================ */

const DOC_TITLE = '报名与预测流程 · 迭代说明';

const FLOW_DIAGRAM = `玩家出示信息码
    ↓
管理员扫码 → 发币（预测币到账提示）→ 录入选手信息 → 归入选手池
    ↓
<span class="highlight">【主动报名】和/或【随机匹配】（二次确认）</span>
    ↓
主动报名进行中 → 显示【已报名：xx 人】
    · 期间可用【随机匹配】【蓝方随机匹配】【红方随机匹配】（仍从选手池抽取）
    · 或管理员手动确认红/蓝方
    ↓
也可跳过主动报名，直接从选手池【随机匹配】（名称跳动 ~5 秒 → 算法抽对手）
    ↓
双方选手确定 → 可单方【重新匹配】
    ↓
<span class="highlight">【开始预测】+ 时长下拉（不限时 / 倒计时 30 秒）</span>
    ↓
预测期间：双方进度百分比比拼（投屏 + 小程序）
    ↓
（若限时）倒计时结束 → 观众不可再预测 → 可选【延长预测时间】
    ↓
管理员手动启动游戏
    ↓
比赛结束 → 展示双方预测进度比拼`;

const SECTIONS = [
  {
    id: 'sec-overview', num: '一', title: '概述',
    blocks: [
      {
        type: 'intro',
        html: '本次迭代围绕 <strong class="text-primary">管理员扫码发币 → 选手池管理 → 报名匹配 → 观众预测 → 比赛结算</strong> 全链路进行优化：',
      },
      {
        type: 'overview-list',
        items: [
          '发币与选手信息录入形成闭环，建立可管理的 <strong class="text-primary">选手池</strong>',
          '报名阶段 <strong class="text-primary">主动报名</strong> 与 <strong class="text-primary">随机匹配</strong> <strong class="text-accent">可兼容</strong>；主动报名期间也可使用随机匹配按钮，仍从选手池抽人',
          '预测阶段支持 <strong class="text-primary">不限时</strong> 与 <strong class="text-primary">倒计时 30 秒</strong> 两种策略，并强化投屏与小程序的 <strong class="text-primary">进度比拼</strong> 展示',
        ],
      },
    ],
  },
  {
    id: 'sec-qrcode', num: '二', title: '信息码扫码与发币',
    blocks: [
      { type: 'subsection', title: '2.1 预测币到账提示' },
      {
        type: 'req-list',
        items: [{
          id: '#1',
          text: '玩家出示信息码后，管理员扫码；在 <strong>发币</strong> 环节，若玩家收到 <strong>预测币</strong>，客户端需给出 <strong>到账提示</strong>。',
          platform: '涉及端：小程序（玩家端）· 管理端',
        }],
      },
    ],
    mockup: 'qrcode',
  },
  {
    id: 'sec-pool', num: '三', title: '选手池',
    blocks: [
      { type: 'subsection', title: '3.1 扫码录入选手信息' },
      {
        type: 'req-list',
        items: [{
          id: '#2',
          text: '管理员扫码后，可在 <strong>管理页面</strong> 记录该玩家的信息；录入的信息归入 <strong>选手池</strong>。',
        }],
      },
      { type: 'subsection', title: '3.2 选手池清除' },
      {
        type: 'req-list',
        items: [{
          id: '#3',
          text: '选手池支持管理员 <strong>手动清除</strong>，便于在新的一天开启新玩法时 <strong>重新录入</strong>。',
          note: '选手池为随机匹配的数据来源。',
        }],
      },
    ],
    mockup: 'pool',
  },
  {
    id: 'sec-entry', num: '四', title: '报名入口改造',
    blocks: [
      {
        type: 'intro',
        className: 'mb-sm',
        html: '原 <span class="btn-pill">开启报名</span> 入口拆分为两个独立按钮，均需 <strong class="text-primary">二次确认弹窗</strong>：',
      },
      {
        type: 'table',
        headers: ['按钮', '行为概要'],
        rows: [
          ['<span class="btn-pill">主动报名</span>', '开放报名，展示已报名人数与名单；期间可随机匹配或手动确认红/蓝方'],
          ['<span class="btn-pill">随机匹配</span>', '从选手池自动抽取双方选手；主动报名期间同样可用，算法不变'],
        ],
      },
      {
        type: 'rules',
        items: [
          '<strong class="text-primary">主动报名</strong> 与 <strong class="text-primary">随机匹配</strong> <strong class="text-accent">可兼容</strong>，并非二选一',
          '开启主动报名后，报名期间仍可使用随机匹配相关按钮；也可不开启主动报名、直接从选手池随机匹配',
        ],
      },
    ],
    mockup: 'entry',
  },
  {
    id: 'sec-manual', num: '五', title: '主动报名模式',
    blocks: [
      { type: 'subsection', title: '5.1 报名进行中' },
      {
        type: 'req-list',
        items: [
          {
            id: '#4',
            text: '点击 <span class="btn-pill">主动报名</span> 后，投屏匹配页与小程序对应 <strong>选手名称位置</strong>，显示 <span class="btn-pill">已报名：xx 人</span>',
          },
          {
            id: '4.1',
            text: '点击 <span class="btn-pill">已报名：xx 人</span> 可 <strong>展开下拉列表</strong>，查看具体报名人员。',
            platform: '涉及端：投屏 · 小程序',
          },
          {
            id: '4.2',
            text: '主动报名期间，管理端同时展示 <span class="btn-pill">随机匹配</span>、<span class="btn-pill">蓝方随机匹配</span>、<span class="btn-pill">红方随机匹配</span>；点击后仍从 <strong>选手池</strong> 按随机匹配算法抽取对应阵营（单方或双方）。',
            platform: '涉及端：管理端',
          },
        ],
      },
      { type: 'mockup', id: 'manual' },
      { type: 'subsection', title: '5.2 确认红/蓝方后' },
      {
        type: 'req-list',
        items: [{
          id: '#5',
          text: '管理员确认 <strong>蓝方 / 红方</strong> 选手后，不再显示 <span class="btn-pill">已报名：xx 人</span>，改为显示 <strong>对应玩家名称</strong>。',
        }],
      },
    ],
  },
  {
    id: 'sec-random', num: '六', title: '随机匹配模式',
    blocks: [
      { type: 'subsection', title: '6.1 匹配过程展示' },
      {
        type: 'req-list',
        items: [
          {
            id: '#6',
            text: '点击 <span class="btn-pill">随机匹配</span>（或主动报名期间的随机匹配按钮）后，投屏匹配页与小程序对应 <strong>选手名称位置</strong>，出现 <strong>选手名称跳动</strong> 效果。',
          },
          {
            id: '6.1',
            text: '随机过程约 <strong>5 秒</strong>，营造期待感；系统内部虽 <strong>先定一位、再定对手</strong>，但对观众 <strong>双方名称一同出现</strong>。',
            platform: '涉及端：投屏 · 小程序',
          },
        ],
      },
      { type: 'mockup', id: 'random-jump' },
      { type: 'subsection', title: '6.2 匹配算法' },
      {
        type: 'req-list',
        items: [
          { id: '6.2', text: '匹配期间，从选手池中：<strong>去掉一个最高分</strong> → <strong>去掉一个最低分</strong>' },
          { id: '6.3', text: '先 <strong>随机确定 1 位选手</strong>；再基于该选手积分，从 <strong>积分最接近的 5～6 位</strong> 选手中 <strong>随机抽取 1 位</strong> 作为对手' },
          { id: '6.5', text: '选手池 <strong>人数不足</strong> 时，点击随机匹配相关按钮后弹出提示：<strong>「人数不足，无法随机匹配」</strong>' },
        ],
      },
      { type: 'subsection', title: '6.3 单方重新匹配' },
      {
        type: 'req-list',
        items: [{
          id: '6.4',
          text: '双方选手确认后，管理员可单独点击 <span class="btn-pill">红方重新匹配</span> 或 <span class="btn-pill">蓝方重新匹配</span>，重新抽取对应方选手。',
        }],
      },
      { type: 'mockup', id: 'random-rematch' },
    ],
  },
  {
    id: 'sec-mode-cards',
    hideHeader: true,
    blocks: [{ type: 'mode-split' }],
  },
  {
    id: 'sec-predict', num: '七', title: '预测阶段',
    blocks: [
      { type: 'subsection', title: '7.1 开始预测与时长选项' },
      {
        type: 'intro',
        className: 'mb-sm',
        html: '管理员确认双方选手后，点击 <span class="btn-pill">开始预测</span>。按钮旁新增 <strong class="text-primary">时长下拉</strong>，默认 <strong class="text-accent">不限时</strong>：',
      },
      {
        type: 'table',
        headers: ['选项', '说明'],
        rows: [
          ['<span class="btn-pill">倒计时 30 秒</span>', '投屏与小程序显示 <strong>30 秒倒计时</strong>；倒计时结束后，观众 <strong>无法再预测</strong>'],
          ['<span class="btn-pill">不限时</span>', '与现有逻辑一致，预测不限时间'],
        ],
      },
      { type: 'mockup', id: 'predict-client' },
      { type: 'subsection', title: '7.2 倒计时结束后的管理员操作' },
      {
        type: 'req-list',
        items: [
          { id: '7.3', text: '倒计时 30 秒结束后，管理员可见 <span class="btn-pill">延长预测时间</span> 按钮；点击后可再次开放预测，并同样可选择 <span class="btn-pill">倒计时 30 秒</span> 或 <span class="btn-pill">不限时</span>' },
          { id: '7.4', text: '倒计时 30 秒结束后，观众虽不能再预测，管理员仍需 <strong>手动点击按钮</strong> 才会 <strong>正式启动游戏</strong>' },
        ],
      },
      {
        type: 'note',
        variant: 'info',
        html: '<strong>要点</strong><br>· 限时预测结束 ≠ 自动开赛；开赛仍由管理员显式触发<br>· <span class="btn-pill">延长预测时间</span> 可 <strong>不限次数</strong> 使用',
      },
      { type: 'mockup', id: 'predict-admin' },
    ],
  },
  {
    id: 'sec-progress', num: '八', title: '预测进度比拼展示',
    blocks: [
      { type: 'subsection', title: '8.1 预测期间' },
      {
        type: 'req-list',
        items: [{
          id: '#8',
          text: '观众预测期间，投屏与小程序展示 <strong>双方预测进度值比拼</strong>，以 <strong>百分比</strong> 形式呈现。',
          formula: '红方下注总额 ÷ 双方下注总额',
          formulaNote: '蓝方同理为蓝方下注总额占比',
        }],
      },
      { type: 'mockup', id: 'progress-during' },
      { type: 'subsection', title: '8.2 比赛结束后' },
      {
        type: 'req-list',
        items: [{
          id: '#9',
          text: '比赛结束后，增加展示 <strong>双方预测进度值比拼</strong>（结算页/结果页）。',
          platform: '涉及端：投屏 · 小程序',
        }],
      },
      { type: 'mockup', id: 'progress-after' },
    ],
  },
  {
    id: 'sec-flow', num: '九', title: '流程总览',
    blocks: [
      { type: 'flow' },
    ],
  },
];

/* ===== 渲染辅助 ===== */

function renderReqItem(item) {
  let extra = '';
  if (item.note) extra += `<div class="note-block">${item.note}</div>`;
  if (item.formula) {
    extra += `<div class="formula-box"><strong>百分比计算</strong>：<code>${item.formula}</code>（${item.formulaNote}）</div>`;
  }
  if (item.platform) extra += `<span class="platform-tag">${item.platform}</span>`;
  return `
    <div class="req-item">
      <div class="req-body">
        <div class="req-text">${item.text}</div>
        ${extra}
      </div>
    </div>`;
}

function renderBlock(block) {
  switch (block.type) {
    case 'intro':
      return `<p class="section-intro${block.className ? ' ' + block.className : ''}">${block.html}</p>`;
    case 'subsection':
      return `<h3 class="subsection-title">${block.title}</h3>`;
    case 'overview-list':
      return `<ul class="overview-list">${block.items.map(li => `<li>${li}</li>`).join('')}</ul>`;
    case 'req-list':
      return `<div class="req-list${block.className ? ' ' + block.className : ''}">${block.items.map(renderReqItem).join('')}</div>`;
    case 'table':
      return `
        <div class="btn-table-wrap">
          <table class="data-table">
            <thead><tr>${block.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>${block.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </div>`;
    case 'rules':
      return `<ul class="rule-list">${block.items.map(li => `<li>${li}</li>`).join('')}</ul>`;
    case 'note':
      return `<div class="note-block ${block.variant || ''}">${block.html}</div>`;
    case 'flow':
      return `<div class="flow-diagram"><pre>${FLOW_DIAGRAM}</pre></div>`;
    case 'mode-split':
      return `
        <div class="mode-split">
          <div class="mode-card manual">
            <h4>主动报名</h4>
            <ul>
              <li>显示已报名人数</li><li>可展开报名名单</li>
              <li>期间可用随机匹配按钮</li>
              <li>仍从选手池按算法抽人</li>
              <li>也可手动确认红/蓝方</li>
            </ul>
          </div>
          <div class="mode-card random">
            <h4>随机匹配</h4>
            <ul>
              <li>与主动报名可兼容</li>
              <li>均从选手池匹配</li>
              <li>名称跳动约 5 秒</li>
              <li>支持单方重新匹配</li>
            </ul>
          </div>
        </div>`;
    case 'mockup':
      return typeof renderMockup === 'function' ? renderMockup(block.id) : '';
    default:
      return '';
  }
}

function renderSection(section) {
  const blocks = [...section.blocks];
  if (section.mockup) blocks.push({ type: 'mockup', id: section.mockup });
  const header = section.hideHeader ? '' : `
      <div class="section-header">
        <div class="section-num">${section.num}</div>
        <h2 class="section-title">${section.title}</h2>
      </div>`;
  return `
    <section class="doc-section${section.hideHeader ? ' doc-section--bare' : ''}" id="${section.id}">
      ${header}
      ${blocks.map(renderBlock).join('')}
    </section>`;
}

function init() {
  document.title = DOC_TITLE;
  document.getElementById('main-content').innerHTML = SECTIONS.map(renderSection).join('');
}

init();
