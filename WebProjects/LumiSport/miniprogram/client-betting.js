/**
 * LumiSport 客户端 - 竞猜/报名 入口与初始化
 * 依赖：客户端.js + 客户端-竞猜-*.js
 */

// 首页入口：竞猜跳转页 / 报名弹窗
function goBetting() {
  if (!isLoggedIn) { window._pendingHome = 'betting'; if (typeof showLogin === 'function') showLogin(); return; }
  if (typeof goSub === 'function') goSub('betting');
}

function openSignupModal() {
  if (!isLoggedIn) { window._pendingHome = 'signup'; if (typeof showLogin === 'function') showLogin(); return; }
  renderSignupView();
  var m = document.getElementById('signupModal');
  if (m) m.classList.remove('hidden');
}

function closeSignupModal() {
  var m = document.getElementById('signupModal');
  if (m) m.classList.add('hidden');
}

// 登录成功后自动执行刚才的首页操作
function runPendingHome() {
  var a = window._pendingHome;
  window._pendingHome = null;
  if (a === 'betting') goBetting();
  else if (a === 'signup') openSignupModal();
}

// 初始化
initMatchState();
renderBettingMatches();
updateSignupBar();
renderSignupView();
updateBannerAd();
updateMyCoinDisplay();
renderBetHistory();

document.addEventListener('click', function (e) {
  if (e.target.closest && (e.target.closest('.store-switch') || e.target.closest('.store-menu'))) return;
  var menus = document.querySelectorAll('.store-menu');
  for (var i = 0; i < menus.length; i++) menus[i].classList.add('hidden');
});
