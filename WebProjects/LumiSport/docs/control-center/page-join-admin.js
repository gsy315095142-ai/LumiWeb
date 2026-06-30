/**
 * 模块：管理员 — 报名阶段页面
 * 示意图：join-admin-review.png（由 join-admin-review-gen.html 生成，含新增「选手换边」按钮）
 */
(function () {
  'use strict';

  window.JoinAdmin = {

    render: function (container) {
      var card = document.createElement('div');
      card.className = 'card';
      card.innerHTML =
        '<h2><span class="icon">🛡️</span>管理员：报名阶段页面</h2>' +
        '<p style="color:#64748b;font-size:14px;margin-bottom:24px;">' +
          '管理员进入「场次管理」页面后，在报名阶段可进行选手审核和流程操作：' +
        '</p>' +
        '<div class="illus-row">' +
          '<div>' +
            '<div class="phone-frame">' +
              '<img src="join-admin-review.png" alt="管理员报名阶段页面" onclick="JoinUtils.zoomImg(this.src)" onerror="this.alt=\'截图加载失败\';this.style.height=\'400px\';this.style.background=\'#e2e8f0\';">' +
            '</div>' +
            '<div class="phone-label">🛡️ 管理员页面（报名阶段）</div>' +
          '</div>' +
          '<div class="desc-area">' +
            '<h3><span class="role-tag admin">管理员</span> 报名阶段时</h3>' +
            '<ul class="anno-list">' +
              '<li data-num="1"><strong>流程进度条</strong> — 顶部显示 6 步流程，当前停留在第 3 步「报名中」</li>' +
              '<li data-num="2"><strong>场次信息卡</strong> — 显示当前局数、玩法、模式，报名阶段字段已锁定不可编辑</li>' +
              '<li data-num="3"><strong>选手名单与审核</strong> — 红蓝双方分区展示：正式选手昵称、待审选手列表、每位待审选手旁的「通过」按钮。管理员通过某侧一人后，<strong>同侧其余待审记录自动从数据库删除</strong></li>' +
              '<li data-num="4"><strong>「选手换边」按钮</strong> — 点击后红蓝双方正式选手互换阵营。<span class="pending-tag">⚠️ 待实现</span></li>' +
              '<li data-num="5"><strong>「开启竞猜」按钮</strong> — 双方选手通过审核后可点击；若实力悬殊系统会拒绝并提示原因</li>' +
              '<li data-num="6"><strong>「重新等待报名」按钮</strong> — 取消本局，退还全部竞猜币，局数 +1，退回等待报名阶段</li>' +
              '<li data-num="7"><strong>「立即开始比赛」按钮</strong> — 可跳过竞猜阶段直接开赛，适用于无需竞猜的场景</li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="rule-box warn">' +
          '<p class="rule-title">⚠️ 审核规则</p>' +
          '<p class="rule-text">' +
            '同一阵营可多人同时待审，管理员通过其中一人后，<strong>同侧其余申请自动作废</strong>（数据库 DELETE）。' +
            '管理员在报名阶段可「移出该侧全部」选手（含正式和待审），操作后如有观众已下注，竞猜币全额退还。' +
            '报名阶段也可直接点击「立即开始比赛」跳过竞猜环节。' +
          '</p>' +
        '</div>' +
        '<div class="rule-box info">' +
          '<p class="rule-title">🔄 选手换边（待实现）</p>' +
          '<p class="rule-text">' +
            '管理员点击「选手换边」后，<strong>红蓝双方正式选手互换阵营</strong>（红方→蓝方、蓝方→红方）。' +
            '仅双方均有正式选手时可操作。若已有观众下注，换边后竞猜币<strong>全额退还</strong>并需重新开启竞猜。' +
            '此功能<strong>待后端实现</strong>，当前仅在示意图中展示。' +
          '</p>' +
        '</div>' +
        '<div class="rule-box pending">' +
          '<p class="rule-title">⚠️ 管理员能否参赛/竞猜（待实现）</p>' +
          '<p class="rule-text">' +
            '当前代码中 <code>PlayerJoinService.register</code> 不检查用户角色，<strong>管理员（role=admin）理论上可以报名参赛和下注</strong>。' +
            '产品设计上管理员身份互斥：不能报名参赛、不能参与竞猜。' +
            '此限制<strong>待后端增加 Guard/校验</strong>后落地，目前手动保管。' +
          '</p>' +
        '</div>';
      container.appendChild(card);
    }
  };
})();
