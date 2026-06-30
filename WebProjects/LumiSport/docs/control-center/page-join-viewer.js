/**
 * 模块：观众视角 — 报名阶段的赛事主页
 */
(function () {
  'use strict';

  window.JoinViewer = {

    render: function (container) {
      var card = document.createElement('div');
      card.className = 'card';
      card.innerHTML =
        '<h2><span class="icon">👥</span>观众：报名阶段的赛事主页</h2>' +
        '<p style="color:#64748b;font-size:14px;margin-bottom:24px;">' +
          '观众在「我要竞猜」Tab 下查看竞猜面板，但由于管理员尚未开启竞猜，无法进行任何下注操作：' +
        '</p>' +
        '<div class="illus-row">' +
          '<div>' +
            '<div class="phone-frame">' +
              '<img src="join-viewer.png" alt="观众视角 - 报名阶段" onclick="JoinUtils.zoomImg(this.src)" onerror="this.alt=\'截图加载失败\';this.style.height=\'400px\';this.style.background=\'#e2e8f0\';">' +
            '</div>' +
            '<div class="phone-label">👥 观众视角（报名阶段）</div>' +
          '</div>' +
          '<div class="desc-area">' +
            '<h3><span class="role-tag viewer">观众</span> 报名阶段时</h3>' +
            '<ul class="anno-list">' +
              '<li data-num="1"><strong>本场对阵模块显示当前状态</strong> — 局数 · 报名中 · 游戏类型，双方选手尚未确定或仍在审核中</li>' +
              '<li data-num="2"><strong>竞猜面板显示但不可操作</strong> — 根据游戏类型显示对应的竞猜项，均处于不可下注状态</li>' +
              '<li data-num="3"><strong>信息条显示个人竞猜资产</strong> — 昵称 + 当前金币余额</li>' +
              '<li data-num="4"><strong>等待管理员开启竞猜</strong> — 双方选手通过审核后，管理员手动点击「开启竞猜」才会开放下注</li>' +
              '<li data-num="5"><strong>排行榜可浏览</strong> — 即使无法下注，仍可查看竞猜排行榜与历史数据</li>' +
            '</ul>' +
          '</div>' +
        '</div>';
      container.appendChild(card);
    }
  };
})();
