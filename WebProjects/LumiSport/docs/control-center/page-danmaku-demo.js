/**
 * 弹幕飘屏演示（挂载在 #danmakuDemo 片段加载后初始化）
 */
(function () {
  'use strict';

  var demoBox, demoInput, demoSendBtn;
  var demoLane = 0;
  var autoIdx = 0;
  var autoTimer = null;

  var DEMO_COLORS = ['#ffffff','#a5b4fc','#34d399','#fb923c','#f87171','#fbbf24','#c084fc'];

  var presetDanmaku = [
    '红方加油！💪', '蓝方必胜！🔥', '这场感觉会很激烈',
    '竞猜押了红方 100 币', '好紧张啊', '裁判是我同学',
    '我赌蓝方翻盘', '上一局打得好精彩', '大师模式太好看了',
    '比分咬得好紧', '有没有人一起猜精准总分', '开局就上强度了',
  ];

  function spawnDanmaku(text, isUser) {
    if (!demoBox) return;
    var el = document.createElement('div');
    el.className = 'danmaku-bullet';
    el.textContent = text;
    var lane = demoLane % 3;
    demoLane++;
    var topOffset = 20 + lane * 36;
    var duration = 11 + Math.random() * 5;
    el.style.top = topOffset + 'px';
    el.style.left = '100%';
    el.style.animationDuration = duration + 's';
    if (isUser) {
      el.style.color = '#00e8ff';
      el.style.fontWeight = '600';
      el.style.textShadow = '0 0 6px rgba(0,232,255,0.6), 0 0 12px rgba(0,0,0,0.5)';
    } else {
      el.style.color = DEMO_COLORS[Math.floor(Math.random() * DEMO_COLORS.length)];
    }
    demoBox.appendChild(el);
    el.addEventListener('animationend', function () { el.remove(); });
  }

  function sendDemoDanmaku() {
    if (!demoInput) return;
    var text = demoInput.value.trim();
    if (!text) return;
    spawnDanmaku(text, true);
    demoInput.value = '';
  }

  window.DanmakuDemo = {
    init: function () {
      demoBox = document.getElementById('danmakuDemo');
      demoInput = document.getElementById('demoInput');
      demoSendBtn = document.getElementById('demoSendBtn');
      if (!demoBox || !demoInput) return;

      demoLane = 0;
      autoIdx = 0;
      demoBox.innerHTML = '<span class="demo-label">LIVE DEMO</span>';

      window.sendDemoDanmaku = sendDemoDanmaku;

      if (demoSendBtn) {
        demoSendBtn.onclick = sendDemoDanmaku;
      }

      demoInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') sendDemoDanmaku();
      });

      if (autoTimer) clearInterval(autoTimer);
      autoTimer = setInterval(function () {
        spawnDanmaku(presetDanmaku[autoIdx % presetDanmaku.length], false);
        autoIdx++;
      }, 2200 + Math.random() * 1800);

      setTimeout(function () { spawnDanmaku('欢迎来到弹幕演示区 🎉', false); }, 300);
      setTimeout(function () { spawnDanmaku('试试在下方输入弹幕发送吧', false); }, 1500);
    }
  };
})();
