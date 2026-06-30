/**
 * 模块：选手 — 选边报名
 */
(function () {
  'use strict';

  window.JoinPlayerSignup = {

    render: function (container) {
      var card = document.createElement('div');
      card.className = 'card';
      card.innerHTML =
        '<h2><span class="icon">🤺</span>选手：选边报名</h2>' +
        '<p style="color:#64748b;font-size:14px;margin-bottom:24px;">' +
          '管理员开放报名后，选手在「我要参赛」Tab 中看到选边界面，选择蓝方或红方并提交报名：' +
        '</p>' +
        '<div class="illus-row">' +
          '<div>' +
            '<div class="phone-frame">' +
              '<img src="join-player-ready.png" alt="选手视角 - 选边报名" onclick="JoinUtils.zoomImg(this.src)" onerror="this.alt=\'截图加载失败\';this.style.height=\'400px\';this.style.background=\'#e2e8f0\';">' +
            '</div>' +
            '<div class="phone-label">🤺 选手视角（选边报名）</div>' +
          '</div>' +
          '<div class="desc-area">' +
            '<h3><span class="role-tag player">选手</span> 选边报名时</h3>' +
            '<ul class="anno-list">' +
              '<li data-num="1"><strong>状态提示文案</strong> — 「报名进行中，请选择阵营并提交（需管理员通过后方为正式选手）」</li>' +
              '<li data-num="2"><strong>「选边 · 每方 1 人」提示</strong> — 每个阵营限 1 名正式选手，先通过审核先占位</li>' +
              '<li data-num="3"><strong>蓝方 / 红方选边按钮</strong> — 点击选择阵营；如果某一方已有正式选手，该按钮变为灰色并显示「（已占）」</li>' +
              '<li data-num="4"><strong>「确认报名」按钮</strong> — 选中阵营后点击提交，进入待审核状态。提交前可自由切换阵营</li>' +
              '<li data-num="5"><strong>信息条显示个人积分</strong> — 昵称 + 三种玩法积分（冰球 / 拳王 / 击剑）</li>' +
              '<li data-num="6"><strong>上一局结果卡片（如有）</strong> — 如果上一局刚结束，会展示上一局的比分结果</li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="rule-box info">' +
          '<p class="rule-title">💡 选边规则</p>' +
          '<p class="rule-text">' +
            '每方限 1 名正式选手，先通过审核先占位。同一阵营可有多人排队待审，但管理员通过其中一人后，' +
            '<strong>同侧其余申请将被后端自动删除</strong>（<code>DELETE FROM registration_requests WHERE sessionId=? AND side=?</code>）。' +
            '选手提交报名后状态变为「待审」，在审核通过前不可参与竞猜。' +
            '<strong>已在一侧待审核中</strong>时，若想切换到另一阵营，' +
            '<strong style="color:#d97706;">需先撤销当前报名</strong>再重新选边提交。' +
          '</p>' +
        '</div>';
      container.appendChild(card);
    }
  };
})();
