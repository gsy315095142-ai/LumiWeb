/**
 * 模块：页头 + 页面定位 + 报名流程概览
 */
(function () {
  'use strict';

  window.JoinHeader = {

    render: function (container) {
      // ---- 页头 ----
      var header = document.createElement('div');
      header.className = 'page-header';
      header.innerHTML =
        '<h1>🤺 匹配：选手报名</h1>' +
        '<p class="subtitle">管理员开放报名后，选手选边提交、管理员审核通过、观众等待竞猜的完整流程</p>';
      container.appendChild(header);

      // ---- 页面定位 ----
      container.appendChild(this._cardPosition());
      // ---- 流程概览 ----
      container.appendChild(this._cardFlow());
    },

    _cardPosition: function () {
      var card = document.createElement('div');
      card.className = 'card';
      card.innerHTML =
        '<h2><span class="icon">📖</span>页面定位</h2>' +
        '<p style="color:#475569;font-size:15px;margin-bottom:16px;">' +
          '「选手报名」是赛事从<strong style="color:#1e293b;">等待报名</strong>进入<strong style="color:#1e293b;">报名中</strong>阶段后的核心环节。' +
          '管理员点击「开始报名」后，选手通过赛事主页的「我要参赛」Tab 进行选边和提交，管理员在「场次管理」页面审核通过后，选手成为正式参赛者。' +
        '</p>' +
        '<p style="color:#64748b;font-size:14px;">' +
          '报名阶段的核心特点是<strong style="color:#1e293b;">三方异步协作</strong>：管理员审核选手、选手等待审核结果、观众等待双方选手通过后由管理员开启竞猜。' +
        '</p>';
      return card;
    },

    _cardFlow: function () {
      var card = document.createElement('div');
      card.className = 'card';
      card.innerHTML =
        '<h2><span class="icon">🔄</span>报名流程概览</h2>' +
        '<p style="color:#64748b;font-size:14px;margin-bottom:16px;">从管理员开放报名到竞猜开启，经历以下步骤：</p>' +
        '<div class="flow-strip">' +
          '<div class="flow-step"><span class="step-label">管理员开始报名</span></div>' +
          '<span class="flow-arrow">→</span>' +
          '<div class="flow-step"><span class="step-label">选手选边提交</span></div>' +
          '<span class="flow-arrow">→</span>' +
          '<div class="flow-step"><span class="step-label">管理员审核通过</span></div>' +
          '<span class="flow-arrow">→</span>' +
          '<div class="flow-step"><span class="step-label">管理员开启竞猜</span></div>' +
          '<span class="flow-arrow">→</span>' +
          '<div class="flow-step"><span class="step-label">观众可下注</span></div>' +
        '</div>' +
        '<div class="rule-box info">' +
          '<p class="rule-title">💡 关键前提</p>' +
          '<p class="rule-text">' +
            '竞猜功能需要管理员手动点击「开启竞猜」按钮后才会开放。若双方实力过于悬殊，系统将拒绝开启竞猜。在此之前，观众只能看到竞猜面板但无法操作。' +
          '</p>' +
        '</div>';
      return card;
    }
  };
})();
