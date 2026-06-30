/**
 * 模块：选手 — 审核通过
 */
(function () {
  'use strict';

  window.JoinPlayerConfirmed = {

    render: function (container) {
      var card = document.createElement('div');
      card.className = 'card';
      card.innerHTML =
        '<h2><span class="icon">✅</span>选手：审核通过</h2>' +
        '<p style="color:#64748b;font-size:14px;margin-bottom:24px;">' +
          '管理员审核通过后，选手的界面从「审核中」变为「已报名」，名字出现在本场对阵模块中：' +
        '</p>' +
        '<div class="illus-row">' +
          '<div>' +
            '<div class="phone-frame">' +
              '<img src="join-player-confirmed.png" alt="选手视角 - 审核通过" onclick="JoinUtils.zoomImg(this.src)" onerror="this.alt=\'截图加载失败\';this.style.height=\'400px\';this.style.background=\'#e2e8f0\';">' +
            '</div>' +
            '<div class="phone-label">✅ 选手视角（审核通过）</div>' +
          '</div>' +
          '<div class="desc-area">' +
            '<h3><span class="role-tag player">选手</span> 审核通过后</h3>' +
            '<ul class="anno-list">' +
              '<li data-num="1"><strong>状态变为「已报名 红方/蓝方」</strong> — 明确显示所属阵营，文字颜色跟随阵营色（红/蓝）</li>' +
              '<li data-num="2"><strong>名字出现在对阵模块中</strong> — 本场对阵卡片展示正式选手昵称 + 积分</li>' +
              '<li data-num="3"><strong>「撤销参赛」按钮</strong> — 比赛正式开始前，选手仍可撤销报名退出比赛</li>' +
              '<li data-num="4"><strong>等待管理员开启竞猜或开始比赛</strong> — 双方均通过审核后，管理员可选择开启竞猜或直接开始比赛</li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="rule-box warn">' +
          '<p class="rule-title">⚠️ 撤销参赛的影响</p>' +
          '<p class="rule-text">' +
            '选手撤销参赛后，该阵营名额释放，其他选手可以重新报名。如果撤销时已有观众对比赛结果下注，所有相关竞猜币将<strong>全额退还</strong>。' +
          '</p>' +
        '</div>';
      container.appendChild(card);
    }
  };
})();
