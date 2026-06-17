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
  var m = document.getElementById('signupModal');
  if (!m) return;
  try { if (typeof renderSignupView === 'function') renderSignupView(); } catch (e) { console.error('renderSignupView failed', e); }
  m.classList.remove('hidden');
  m.style.zIndex = '60';
}

function closeSignupModal() {
  var m = document.getElementById('signupModal');
  if (m) { m.classList.add('hidden'); m.style.zIndex = ''; }
}

// 登录成功后自动执行刚才的首页操作
function runPendingHome() {
  var a = window._pendingHome;
  window._pendingHome = null;
  if (a === 'betting') goBetting();
  else if (a === 'signup') openSignupModal();
}

// 初始化（单步失败不影响报名弹窗等其它功能）
function initClientBetting() {
  try { initMatchState(); } catch (e) { console.error(e); }
  try { renderBettingMatches(); } catch (e) { console.error(e); }
  try { updateSignupBar(); } catch (e) { console.error(e); }
  try { renderSignupView(); } catch (e) { console.error(e); }
  try { updateBannerAd(); } catch (e) { console.error(e); }
  try { updateMyCoinDisplay(); } catch (e) { console.error(e); }
  try { if (typeof updateAllCoinDisplays === 'function') updateAllCoinDisplays(); } catch (e) { console.error(e); }
  try { if (typeof updateCoinHudVisibility === 'function') updateCoinHudVisibility(); } catch (e) { console.error(e); }
  try { if (typeof updateProfileStoreDisplay === 'function') updateProfileStoreDisplay(); } catch (e) { console.error(e); }
  try { if (typeof syncAdminStoreViews === 'function') syncAdminStoreViews(); } catch (e) { console.error(e); }
  try { renderBetHistory(); } catch (e) { console.error(e); }
}
initClientBetting();

document.addEventListener('click', function (e) {
  if (e.target.closest && (e.target.closest('.store-switch') || e.target.closest('.store-menu'))) return;
  var menus = document.querySelectorAll('.store-menu');
  for (var i = 0; i < menus.length; i++) menus[i].classList.add('hidden');
});
