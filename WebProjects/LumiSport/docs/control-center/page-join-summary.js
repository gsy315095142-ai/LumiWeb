/**
 * 模块：三角色对比表 + 状态流转 + 关键交互规则
 */
(function () {
  'use strict';

  window.JoinSummary = {

    render: function (container) {
      container.appendChild(this._cardRoleCompare());
      container.appendChild(this._cardStateFlow());
      container.appendChild(this._cardRules());
    },

    /** 三角色操作对比表 */
    _cardRoleCompare: function () {
      var card = document.createElement('div');
      card.className = 'card';
      card.innerHTML =
        '<h2><span class="icon">📊</span>报名阶段三角色操作对比</h2>' +
        '<table class="role-table">' +
          '<thead>' +
            '<tr><th>操作</th><th><span class="role-tag admin">管理员</span></th><th><span class="role-tag player">选手</span></th><th><span class="role-tag viewer">观众</span></th></tr>' +
          '</thead>' +
          '<tbody>' +
            '<tr><td style="font-weight:600;color:#1e293b;">选边报名</td><td>—</td><td>✅ 选择蓝/红方 → 提交报名</td><td>—</td></tr>' +
            '<tr><td style="font-weight:600;color:#1e293b;">审核通过</td><td>✅ 通过/拒绝待审选手</td><td>等待审核结果</td><td>—</td></tr>' +
            '<tr><td style="font-weight:600;color:#1e293b;">撤销报名</td><td>—</td><td>✅ 撤销已提交的报名</td><td>—</td></tr>' +
            '<tr><td style="font-weight:600;color:#1e293b;">移出选手</td><td>✅ 移出某侧全部选手（含待审）</td><td>—</td><td>—</td></tr>' +
            '<tr><td style="font-weight:600;color:#1e293b;">开启竞猜</td><td>✅ 双方通过后可操作</td><td>—</td><td>—</td></tr>' +
            '<tr><td style="font-weight:600;color:#1e293b;">竞猜下注</td><td>❌ 管理员不可下注<span class="pending-tag">⚠️ 待实现</span></td><td>❌ 参赛者不可竞猜</td><td>❌ 管理员未开启竞猜前不可下注</td></tr>' +
            '<tr><td style="font-weight:600;color:#1e293b;">重新等待报名</td><td>✅ 取消本局，退还竞猜币，局数 +1</td><td>—</td><td>—</td></tr>' +
            '<tr><td style="font-weight:600;color:#1e293b;">立即开始比赛</td><td>✅ 可跳过竞猜直接开赛</td><td>等待开始</td><td>等待开始</td></tr>' +
          '</tbody>' +
        '</table>';
      return card;
    },

    /** 选手报名状态流转 */
    _cardStateFlow: function () {
      var card = document.createElement('div');
      card.className = 'card';
      card.innerHTML =
        '<h2><span class="icon">🔀</span>选手报名状态流转</h2>' +
        '<p style="color:#64748b;font-size:14px;margin-bottom:16px;">选手在报名阶段的个人状态经历以下变化：</p>' +
        '<div class="flow-strip">' +
          '<div class="flow-step"><span class="step-label">未报名</span></div>' +
          '<span class="flow-arrow">→</span>' +
          '<div class="flow-step"><span class="step-label">待审核</span></div>' +
          '<span class="flow-arrow">→</span>' +
          '<div class="flow-step"><span class="step-label">已通过（正式选手）</span></div>' +
        '</div>' +
        '<table class="role-table" style="margin-top:20px;">' +
          '<thead><tr><th>选手状态</th><th>界面展示</th><th>可操作</th></tr></thead>' +
          '<tbody>' +
            '<tr><td style="font-weight:600;color:#1e293b;">未报名</td><td>显示选边按钮（蓝/红）+ 确认报名按钮</td><td>选边、提交报名</td></tr>' +
            '<tr><td style="font-weight:600;color:#1e293b;">待审核</td><td>显示「报名审核中 · 红方/蓝方」+ 撤销报名按钮</td><td>撤销报名<br><span style="color:#d97706;font-size:12px;">⚠️ 已在一侧待审时，想切阵营需先撤销再重选</span></td></tr>' +
            '<tr><td style="font-weight:600;color:#1e293b;">已通过</td><td>显示「已报名 红方/蓝方」+ 撤销参赛按钮；名字出现在对阵卡片</td><td>撤销参赛</td></tr>' +
          '</tbody>' +
        '</table>';
      return card;
    },

    /** 关键交互规则 */
    _cardRules: function () {
      var card = document.createElement('div');
      card.className = 'card';
      card.innerHTML =
        '<h2><span class="icon">⚙️</span>关键交互规则</h2>' +
        '<ul style="font-size:14px;color:#475569;padding-left:20px;line-height:2.2;">' +
          '<li><strong style="color:#1e293b;">每方限 1 人</strong> — 蓝方和红方各限 1 名正式选手，先通过审核先占位</li>' +
          '<li><strong style="color:#1e293b;">同侧互斥</strong> — 管理员通过某位选手后，同阵营其余待审申请自动作废（数据库 DELETE）</li>' +
          '<li><strong style="color:#1e293b;">阵营已占提示</strong> — 某方已有正式选手时，选边按钮显示灰色并标注「（已占）」，新选手无法选择该阵营</li>' +
          '<li><strong style="color:#1e293b;">切换阵营需先撤销</strong> — 已在一侧待审核时，想切换到另一阵营需先撤销当前报名再重新选边提交</li>' +
          '<li><strong style="color:#1e293b;">审核前不可竞猜</strong> — 选手在「待审核」状态下（<code>myPendingSide</code> 非空）无法参与竞猜下注</li>' +
          '<li><strong style="color:#1e293b;">参赛者不可竞猜</strong> — 已成为正式选手后（<code>mySide</code> 非空），不可对本场竞猜下注</li>' +
          '<li><strong style="color:#1e293b;">撤销退还竞猜币</strong> — 选手撤销参赛或管理员移出选手时，如有观众已下注则全额退还</li>' +
          '<li><strong style="color:#1e293b;">实力悬殊拦截</strong> — 双方实力过于悬殊时，管理员无法开启竞猜，系统会提示原因</li>' +
          '<li><strong style="color:#1e293b;">可跳过竞猜</strong> — 管理员可点击「立即开始比赛」跳过竞猜环节直接开赛</li>' +
          '<li><strong style="color:#1e293b;">管理员参赛/竞猜待拦截</strong> — 代码中 <code>PlayerJoinService.register</code> 不检查角色，管理员理论上可报名/下注，需后端补充 Guard <span class="pending-tag">⚠️ 待实现</span></li>' +
        '</ul>';
      return card;
    }
  };
})();
