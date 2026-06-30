/**
 * LumiSport 客户端 - 核心脚本
 */
var isLoggedIn = false;
var pageStack = ['home'];
var selectedZone = '疾速冰球厅';
var matchState = {};
var MAX_BET = 200;

function navigateTo(page, title) {
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active')});
  document.getElementById('page-'+page).classList.add('active');
  document.getElementById('titleText').textContent = title;
  var isSub = ['betHistory','battleHistory','betting','exchangeHistory','clientExchange'].indexOf(page)!==-1;
  document.getElementById('backBtn').style.display = isSub?'block':'none';
  if(!isSub){document.querySelectorAll('.tab-item').forEach(function(e){e.classList.remove('active')});document.getElementById('tabBtn-'+page).classList.add('active')}
  if(page==='sign')updateQRState();
  if(page==='betHistory')renderBetHistory();
  if(page==='exchangeHistory'&&typeof renderExchangeHistory==='function')renderExchangeHistory();
  if(page==='clientExchange'&&typeof renderClientExchange==='function')renderClientExchange();
  if(page==='betting'){if(typeof syncStoreChrome==='function')syncStoreChrome();updateBannerAd();renderBettingMatches()}
  if(page==='home'){if(typeof syncStoreChrome==='function')syncStoreChrome();updateBannerAd();renderSignupView()}
  if(typeof updateCoinHudVisibility==='function')updateCoinHudVisibility();
}
function switchTab(t){pageStack=[t];var titles={home:'🏟️ LumiSport',mine:'👤 我的'};navigateTo(t,titles[t])}
function goSub(s){pageStack.push(s);var titles={betHistory:'📋 预测记录',battleHistory:'⚔️ 比赛记录',betting:'🎯 预测',exchangeHistory:'📦 兑换记录',clientExchange:'📦 兑换商品'};navigateTo(s,titles[s])}
function goClientExchange(){ goSub('clientExchange'); }
function goBack(){if(pageStack.length<=1)return;pageStack.pop();var p=pageStack[pageStack.length-1];var titles={home:'🏟️ LumiSport',mine:'👤 我的',betHistory:'📋 预测记录',battleHistory:'⚔️ 比赛记录',betting:'🎯 预测',exchangeHistory:'📦 兑换记录',clientExchange:'📦 兑换商品'};navigateTo(p,titles[p])}
function showLogin(){document.getElementById('loginModal').classList.remove('hidden')}
function doLogin(){
  isLoggedIn=true;document.getElementById('loginModal').classList.add('hidden');
  var blurs=document.querySelectorAll('.qr-blur');for(var i=0;i<blurs.length;i++)blurs[i].classList.add('hidden');
  document.getElementById('loginPrompt').classList.add('hidden');
  document.getElementById('profileCard').classList.remove('hidden');
  document.getElementById('logoutBtn').classList.remove('hidden');
  document.getElementById('menuBet').classList.remove('hidden');document.getElementById('menuBattle').classList.remove('hidden');var mex=document.getElementById('menuExchange');if(mex)mex.classList.remove('hidden');
  if(window._pendingBet){doPlaceBet(window._pendingBet);window._pendingBet=null}toastMsg('登录成功');
  if(typeof runPendingHome==='function')runPendingHome();
  genQRForMine();
  if(typeof updateAllCoinDisplays==='function')updateAllCoinDisplays();
  if(typeof updateCoinHudVisibility==='function')updateCoinHudVisibility();
  if(typeof updateProfileStoreDisplay==='function')updateProfileStoreDisplay();
}
function doLogout(){
  isLoggedIn=false;
  var blurs=document.querySelectorAll('.qr-blur');for(var i=0;i<blurs.length;i++)blurs[i].classList.remove('hidden');
  document.getElementById('loginPrompt').classList.remove('hidden');document.getElementById('profileCard').classList.add('hidden');
  document.getElementById('logoutBtn').classList.add('hidden');document.getElementById('menuBet').classList.add('hidden');document.getElementById('menuBattle').classList.add('hidden');var mex=document.getElementById('menuExchange');if(mex)mex.classList.add('hidden');
  var cur=pageStack[pageStack.length-1];if(cur=='betHistory'||cur=='battleHistory'||cur=='exchangeHistory'||cur=='clientExchange')goBack();toastMsg('已退出登录');
  if(typeof updateCoinHudVisibility==='function')updateCoinHudVisibility();
}
function updateQRState(){
  var blur=document.getElementById('qrBlur');if(blur){if(isLoggedIn)blur.classList.add('hidden');else blur.classList.remove('hidden')}
}
function genQR(){var g=document.getElementById('qrGrid');if(!g)return;g.innerHTML='';for(var i=0;i<64;i++){var c=document.createElement('div');c.className=Math.random()>0.55?'qr-cell':'qr-cell w';g.appendChild(c)}}
function genQRForMine(){
  var qrs=document.querySelectorAll('.qr-inner');for(var j=1;j<qrs.length;j++){
    qrs[j].innerHTML='';for(var i=0;i<64;i++){var c=document.createElement('div');c.className=Math.random()>0.55?'qr-cell':'qr-cell w';qrs[j].appendChild(c)}
  }
}
genQR();setInterval(function(){genQR();genQRForMine()},5000);
function toastMsg(m){var t=document.getElementById('toast');t.textContent=m;t.classList.remove('hidden');setTimeout(function(){t.classList.add('hidden')},2000)}

var pendingConfirm=null;
function showConfirm(msg,cb){document.getElementById('confirmModal').style.zIndex='100';document.getElementById('confirmMsg').textContent=msg;document.getElementById('confirmModal').classList.remove('hidden');pendingConfirm=cb}
function closeConfirm(ok){document.getElementById('confirmModal').classList.add('hidden');document.getElementById('confirmModal').style.zIndex='';if(ok&&pendingConfirm)pendingConfirm();pendingConfirm=null}

function showCoinHelp(type){
  var t=document.getElementById('coinHelpTitle'),c=document.getElementById('coinHelpContent');
  if(type==='coin'){t.innerHTML='💰 预测币说明';c.innerHTML='<b>获得方式</b><br>• 管理员发放<br>• 活动赠送<br><br><b>消耗途径</b><br>• 参与预测提交（猜中不返还）<br>• 报名支付费用'}
  else{t.innerHTML='💎 礼品点数说明';c.innerHTML='<b>获得方式</b><br>• 预测命中奖励<br>• 活动赠送<br><br><b>消耗途径</b><br>• 兑换门店商品<br>• 兑换限定道具'}
  document.getElementById('coinHelpModal').classList.remove('hidden');
}

function isMineTabPage(page) {
  return page === 'mine' || page === 'betHistory' || page === 'battleHistory' || page === 'exchangeHistory';
}

function isHomeTabPage(page) {
  return page === 'home' || page === 'betting';
}

function updateAllCoinDisplays() {
  var gc = typeof myGameCoin !== 'undefined' ? myGameCoin : 0;
  var ec = typeof myExchangeCoin !== 'undefined' ? myExchangeCoin : 0;
  var gStr = gc.toLocaleString();
  var eStr = ec.toLocaleString();
  var g = document.getElementById('myGameCoinVal');
  if (g) g.textContent = gStr;
  var e = document.getElementById('myExchangeCoinVal');
  if (e) e.textContent = eStr;
  var hg = document.getElementById('hudGameCoinVal');
  if (hg) hg.textContent = gStr;
  var he = document.getElementById('hudExchangeCoinVal');
  if (he) he.textContent = eStr;
  var bal = document.getElementById('exCoinBalance');
  if (bal) bal.textContent = ec;
  var balModal = document.getElementById('exCoinBalanceModal');
  if (balModal) balModal.textContent = ec;
}

function updateCoinHudVisibility() {
  var hud = document.getElementById('coinHudBar');
  if (!hud) return;
  var page = pageStack[pageStack.length - 1];
  if (isLoggedIn && (isMineTabPage(page) || isHomeTabPage(page))) hud.classList.remove('hidden');
  else hud.classList.add('hidden');
}
