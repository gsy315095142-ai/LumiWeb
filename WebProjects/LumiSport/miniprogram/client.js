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
  var isSub = ['betHistory','battleHistory','betting','exchangeHistory'].indexOf(page)!==-1;
  document.getElementById('backBtn').style.display = isSub?'block':'none';
  if(!isSub){document.querySelectorAll('.tab-item').forEach(function(e){e.classList.remove('active')});document.getElementById('tabBtn-'+page).classList.add('active')}
  if(page==='sign')updateQRState();
  if(page==='betHistory')renderBetHistory();
  if(page==='exchangeHistory'&&typeof renderExchangeHistory==='function')renderExchangeHistory();
  if(page==='betting'){if(typeof syncStoreChrome==='function')syncStoreChrome();updateBannerAd();renderBettingMatches()}
  if(page==='home'){if(typeof syncStoreChrome==='function')syncStoreChrome();updateBannerAd();renderSignupView()}
}
function switchTab(t){pageStack=[t];var titles={home:'🏟️ LumiSport',mine:'👤 我的'};navigateTo(t,titles[t])}
function goSub(s){pageStack.push(s);var titles={betHistory:'📋 竞猜记录',battleHistory:'⚔️ 比赛记录',betting:'🎯 竞猜',exchangeHistory:'📦 兑换记录'};navigateTo(s,titles[s])}
function goBack(){if(pageStack.length<=1)return;pageStack.pop();var p=pageStack[pageStack.length-1];var titles={home:'🏟️ LumiSport',mine:'👤 我的',betHistory:'📋 竞猜记录',battleHistory:'⚔️ 比赛记录',betting:'🎯 竞猜',exchangeHistory:'📦 兑换记录'};navigateTo(p,titles[p])}
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
}
function doLogout(){
  isLoggedIn=false;
  var blurs=document.querySelectorAll('.qr-blur');for(var i=0;i<blurs.length;i++)blurs[i].classList.remove('hidden');
  document.getElementById('loginPrompt').classList.remove('hidden');document.getElementById('profileCard').classList.add('hidden');
  document.getElementById('logoutBtn').classList.add('hidden');document.getElementById('menuBet').classList.add('hidden');document.getElementById('menuBattle').classList.add('hidden');var mex=document.getElementById('menuExchange');if(mex)mex.classList.add('hidden');
  var cur=pageStack[pageStack.length-1];if(cur=='betHistory'||cur=='battleHistory'||cur=='exchangeHistory')goBack();toastMsg('已退出登录');
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
function showConfirm(msg,cb){document.getElementById('confirmMsg').textContent=msg;document.getElementById('confirmModal').classList.remove('hidden');pendingConfirm=cb}
function closeConfirm(ok){document.getElementById('confirmModal').classList.add('hidden');if(ok&&pendingConfirm)pendingConfirm();pendingConfirm=null}

function showCoinHelp(type){
  var t=document.getElementById('coinHelpTitle'),c=document.getElementById('coinHelpContent');
  if(type==='coin'){t.innerHTML='💰 游戏币说明';c.innerHTML='<b>获得方式</b><br>• 管理员发放<br>• 竞猜获胜奖励<br><br><b>消耗途径</b><br>• 参与竞猜下注<br>• 报名支付费用'}
  else{t.innerHTML='💎 兑换币说明';c.innerHTML='<b>获得方式</b><br>• 竞猜获胜额外奖励<br>• 活动赠送<br><br><b>消耗途径</b><br>• 兑换门店商品<br>• 兑换限定道具'}
  document.getElementById('coinHelpModal').classList.remove('hidden');
}
