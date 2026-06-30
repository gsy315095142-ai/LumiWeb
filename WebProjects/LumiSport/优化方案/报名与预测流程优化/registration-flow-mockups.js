/* ============================================================
 * 报名与预测流程 · 界面示意图生成
 * 视觉参考：Lumi_Sport_Space_Wechat cyber-tokens + EventMatchModule
 * ============================================================ */

function mkPhone(role, title, body, badge) {
  return `
    <div class="mk-device mk-phone">
      <div class="mk-device-label">${role}</div>
      <div class="mk-screen cyber-bg">
        <div class="mk-status"><span>9:41</span><span>📶 🔋</span></div>
        <div class="mk-nav">${title}${badge ? `<span class="mk-badge">${badge}</span>` : ''}</div>
        <div class="mk-body">${body}</div>
      </div>
    </div>`;
}

function mkScreenWide(body) {
  return `
    <div class="mk-device mk-screen-device">
      <div class="mk-device-label">投屏</div>
      <div class="mk-screen-wide cyber-bg">
        <div class="mk-screen-body">${body}</div>
      </div>
    </div>`;
}

function mkWrap(title, rowHtml) {
  return `
    <div class="mockup-wrap">
      <div class="mockup-wrap-title">${title}</div>
      <div class="mockup-row">${rowHtml}</div>
    </div>`;
}

function mkWrapStacked(title, topRowHtml, bottomRowHtml) {
  return `
    <div class="mockup-wrap">
      <div class="mockup-wrap-title">${title}</div>
      <div class="mockup-stack">
        <div class="mockup-row">${topRowHtml}</div>
        <div class="mockup-row mockup-row--full">${bottomRowHtml}</div>
      </div>
    </div>`;
}

function mkHero(meta, blueContent, redContent, extra) {
  return `
    <div class="mk-hero">
      <span class="mk-hero-label">本场对阵</span>
      <div class="mk-hero-meta">${meta}</div>
      <div class="mk-vs-row">
        <div class="mk-side blue">
          <span class="mk-side-tag">蓝</span>
          <span class="mk-side-name">${blueContent}</span>
        </div>
        <span class="mk-vs">VS</span>
        <div class="mk-side red">
          <span class="mk-side-tag">红</span>
          <span class="mk-side-name">${redContent}</span>
        </div>
      </div>
      ${extra || ''}
    </div>`;
}

const MOCKUPS = {

  /* 二、信息码扫码与发币 */
  qrcode() {
    const adminBody = `
      <div class="mk-card">
        <div class="mk-card-title">👤 用户信息</div>
        <div class="mk-user-row">
          <div class="mk-avatar">🎮</div>
          <div>
            <div class="mk-user-name">玩家 · 小明</div>
            <div class="mk-coins">
              <span class="gold">💰 游戏币 <strong>520</strong></span>
              <span class="purple">🔮 预测币 <strong>80</strong></span>
            </div>
          </div>
        </div>
      </div>
      <div class="mk-card">
        <div class="mk-card-title">💰 发放金额</div>
        <div class="mk-chips">
          <span class="mk-chip">100</span>
          <span class="mk-chip active">200</span>
          <span class="mk-chip">500</span>
        </div>
        <p class="mk-hint">含预测币发放时，玩家端将收到到账提示</p>
        <button class="mk-btn mk-btn-primary">✅ 确认发放</button>
      </div>`;

    const playerBody = `
      <div class="mk-card">
        <div class="mk-card-title">我的 · 身份码</div>
        <div style="text-align:center;padding:16px 0;">
          <div style="width:80px;height:80px;margin:0 auto;background:rgba(0,255,255,0.08);border:1px dashed rgba(0,255,255,0.3);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:28px;">▦</div>
          <p class="mk-hint" style="margin-top:10px;">出示身份码供管理员扫码</p>
        </div>
      </div>
      <div class="mk-toast">
        <div class="mk-toast-title">🔮 预测币 +100 已到账</div>
        <div class="mk-toast-sub">当前预测币余额：180</div>
      </div>`;

    return mkWrap('界面示意 · 扫码发币 & 预测币到账提示',
      mkPhone('管理端', '发放游戏币', adminBody, '管理员') +
      mkPhone('小程序 · 玩家', '我的', playerBody)
    );
  },

  /* 三、选手池 */
  pool() {
    const adminBody = `
      <div class="mk-card">
        <div class="mk-card-title">选手池 · 今日（6 人）</div>
        <div class="mk-pool-list">
          <div class="mk-pool-item"><span>阿杰</span><span class="mk-pool-score">1280 分</span></div>
          <div class="mk-pool-item"><span>小雨</span><span class="mk-pool-score">1150 分</span></div>
          <div class="mk-pool-item"><span>大刘</span><span class="mk-pool-score">980 分</span></div>
          <div class="mk-pool-item"><span>…</span><span class="mk-pool-score">…</span></div>
        </div>
        <button class="mk-btn mk-btn-outline" style="margin-top:10px;">🗑 清除选手池</button>
        <p class="mk-hint" style="margin-top:8px;margin-bottom:0;">新一天开启新玩法时可手动清除后重新录入</p>
      </div>`;

    return mkWrap('界面示意 · 选手池 · 今日',
      mkPhone('管理端', '场次管理', adminBody, '管理员')
    );
  },

  /* 四、报名入口改造 */
  entry() {
    const adminBody = `
      <div class="mk-card">
        <div class="mk-card-title">流程操作</div>
        <p class="mk-hint">原「开启报名」拆分为以下两个入口：</p>
        <button class="mk-btn mk-btn-green">📝 主动报名</button>
        <button class="mk-btn mk-btn-purple">🎲 随机匹配</button>
      </div>
      <div class="mk-modal-overlay">
        <div class="mk-modal">
          <div class="mk-modal-title">确认开启主动报名？</div>
          <div class="mk-modal-text">开放后投屏与小程序将展示已报名人数，管理员手动确认红/蓝方。</div>
          <div class="mk-modal-btns">
            <button class="mk-btn mk-btn-outline">取消</button>
            <button class="mk-btn mk-btn-green">确认</button>
          </div>
        </div>
      </div>`;

    return mkWrap('界面示意 · 报名入口（二次确认）',
      mkPhone('管理端', '场次管理', adminBody, '管理员')
    );
  },

  /* 五、主动报名 */
  manual() {
    const heroMini = mkHero(
      '第 3 局 · 报名中 · 疾速冰球',
      '<span class="mk-reg-badge">已报名：5 人</span>',
      '<span class="mk-reg-badge">已报名：5 人</span>',
      `<div class="mk-dropdown">
        <div class="mk-dropdown-item">1. 阿杰</div>
        <div class="mk-dropdown-item">2. 小雨</div>
        <div class="mk-dropdown-item">3. 大刘</div>
        <div class="mk-dropdown-item">4. 小林</div>
        <div class="mk-dropdown-item">5. 阿豪</div>
      </div>`
    );

    const heroConfirmed = mkHero(
      '第 3 局 · 报名中 · 疾速冰球',
      '小雨',
      '阿杰'
    );

    const miniBody = heroMini;
    const screenBody = `
      <div class="mk-screen-title">LumiSport · 疾速冰球</div>
      <div class="mk-screen-sub">第 3 局 · 报名进行中</div>
      ${mkHero('等待管理员确认红/蓝方', '<span class="mk-reg-badge">已报名：5 人</span>', '<span class="mk-reg-badge">已报名：5 人</span>')}`;

    const adminBody = `
      ${heroConfirmed}
      <div class="mk-card">
        <div class="mk-card-title">阵容确认</div>
        <p class="mk-hint">确认后投屏/小程序改为显示选手名称</p>
        <div style="display:flex;gap:8px;">
          <button class="mk-btn mk-btn-sm mk-btn-cyan" style="flex:1;">蓝方：小雨 ✓</button>
          <button class="mk-btn mk-btn-sm mk-btn-cyan" style="flex:1;">红方：阿杰 ✓</button>
        </div>
      </div>`;

    return mkWrapStacked('界面示意 · 主动报名（名单 → 确认选手）',
      mkPhone('小程序 · 观众', '赛事', miniBody) +
      mkPhone('管理端', '场次管理', adminBody, '管理员'),
      mkScreenWide(screenBody)
    );
  },

  /* 六、随机匹配 */
  'random-jump'() {
    const jumping = '<span class="mk-side-name jumping">???</span>';
    const heroJump = mkHero(
      '第 3 局 · 匹配中 · 疾速冰球',
      jumping, jumping,
      '<p class="mk-hint" style="text-align:center;margin:8px 0 0;">名称跳动约 5 秒…</p>'
    );

    const screenBody = `
      <div class="mk-screen-title">LumiSport · 疾速冰球</div>
      <div class="mk-screen-sub">随机匹配进行中</div>
      ${heroJump}`;

    return mkWrap('界面示意 · 随机匹配（名称跳动）',
      mkPhone('小程序 · 观众', '赛事', heroJump) +
      mkScreenWide(screenBody)
    );
  },

  'random-rematch'() {
    const heroDone = mkHero('第 3 局 · 报名中 · 疾速冰球', '小雨', '阿杰');

    const adminBody = `
      ${heroDone}
      <div class="mk-card">
        <div class="mk-card-title">单方重新匹配</div>
        <div class="mk-btn-row">
          <button class="mk-btn mk-btn-orange">🔵 蓝方重新匹配</button>
          <button class="mk-btn mk-btn-orange">🔴 红方重新匹配</button>
        </div>
      </div>`;

    return mkWrap('界面示意 · 单方重新匹配',
      mkPhone('管理端', '场次管理', adminBody, '管理员')
    );
  },

  /* 七、预测阶段 */
  'predict-client'() {
    const clientBody = `
      ${mkHero('第 3 局 · 竞猜中 · 疾速冰球', '小雨 ×1.85', '阿杰 ×2.10')}
      <div class="mk-countdown">
        <div class="mk-countdown-num">30</div>
        <div class="mk-countdown-label">预测倒计时</div>
      </div>
      <p class="mk-hint" style="text-align:center;margin:0;">倒计时结束后无法继续预测</p>`;

    return mkWrap('界面示意 · 预测倒计时（小程序 · 观众）',
      mkPhone('小程序 · 观众', '赛事 · 竞猜', clientBody)
    );
  },

  'predict-admin'() {
    const adminBody = `
      <div class="mk-card">
        <div class="mk-card-title">流程操作</div>
        ${mkHero('第 3 局 · 竞猜中', '小雨', '阿杰')}
        <div class="mk-select-row">
          <button class="mk-btn mk-btn-primary" style="flex:1;">开始预测</button>
          <div class="mk-select">不限时 ▾</div>
        </div>
        <button class="mk-btn mk-btn-green">⏱ 延长预测时间</button>
        <button class="mk-btn mk-btn-purple">▶ 正式启动游戏</button>
        <p class="mk-hint" style="margin-bottom:0;">倒计时结束后观众不可再预测，管理员手动开赛</p>
      </div>`;

    return mkWrap('界面示意 · 管理员操作',
      mkPhone('管理端', '场次管理', adminBody, '管理员')
    );
  },

  /* 八、预测进度比拼 */
  'progress-during'() {
    const progressBar = (bluePct, redPct, label) => `
      <div class="mk-progress-block">
        <div class="mk-progress-labels">
          <span class="blue">蓝 ${bluePct}%</span>
          <span class="red">红 ${redPct}%</span>
        </div>
        <div class="mk-progress-track">
          <div class="mk-progress-blue" style="width:${bluePct}%"></div>
        </div>
        <div class="mk-progress-pct">${label}</div>
      </div>`;

    const duringBody = `
      ${mkHero('第 3 局 · 竞猜中', '小雨', '阿杰')}
      ${progressBar(62, 38, '红方下注总额 ÷ 双方下注总额')}
      <p class="mk-hint" style="text-align:center;margin:0;">预测期间实时更新</p>`;

    const screenBody = `
      <div class="mk-screen-title">LumiSport · 疾速冰球</div>
      <div class="mk-screen-sub">预测进度实时比拼</div>
      ${mkHero('第 3 局 · 竞猜中', '小雨', '阿杰')}
      ${progressBar(62, 38, '62% · 38%')}`;

    return mkWrap('界面示意 · 预测期间进度比拼',
      mkPhone('小程序 · 观众', '赛事 · 竞猜', duringBody) +
      mkScreenWide(screenBody)
    );
  },

  'progress-after'() {
    const progressBar = (bluePct, redPct, label) => `
      <div class="mk-progress-block">
        <div class="mk-progress-labels">
          <span class="blue">蓝 ${bluePct}%</span>
          <span class="red">红 ${redPct}%</span>
        </div>
        <div class="mk-progress-track">
          <div class="mk-progress-blue" style="width:${bluePct}%"></div>
        </div>
        <div class="mk-progress-pct">${label}</div>
      </div>`;

    const afterBody = `
      <div class="mk-card" style="text-align:center;">
        <div class="mk-card-title">🏆 比赛结束</div>
        <div style="font-size:14px;font-weight:800;color:#6ee7b7;margin:8px 0;">蓝方 小雨 获胜</div>
        <div style="font-size:11px;color:rgba(180,220,235,0.6);">最终比分 5 : 3</div>
      </div>
      ${progressBar(62, 38, '赛后预测进度比拼')}
      <p class="mk-hint" style="text-align:center;margin:0;">结算页保留双方预测占比</p>`;

    return mkWrap('界面示意 · 赛后预测进度比拼',
      mkPhone('小程序 · 观众', '结算页', afterBody)
    );
  },
};

function renderMockup(id) {
  const fn = MOCKUPS[id];
  if (!fn) return '';
  return fn();
}
