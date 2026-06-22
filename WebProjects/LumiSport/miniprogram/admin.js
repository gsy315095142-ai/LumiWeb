/**
 * LumiSport 管理员端 - 核心脚本
 * 统一Tab栏：管理员登录后显示管理Tab，可切玩家模式
 */
var isAdmin = false, pendingConfirm = null;
var pageStack = ['home'];
var scannedUser = null, curProduct = null, curMatchId = null;
var selectedSignupSide = null;
var giveCoinAmt = 0, giveIsCustom = false;
var selectedStoreCat = '全部';
var signupRedFull = false, signupBlueFull = false;
var isLoggedIn = false, matchState = {}, MAX_BET = 200, selectedZone = '疾速冰球厅';

function setTitle(t) { document.getElementById('titleText').innerHTML = t; }

var ADMIN_TITLE = '🛠️ 管理';
function adminTitle(){ return ADMIN_TITLE + (isAdmin?' <span class="admin-badge">管理员</span>':''); }

// 页面 → 底部Tab 归属（用于高亮）
function pageToTab(p){
  if(p==='home'||p==='betting')return 'home';
  if(p==='admin'||p==='adminMatches'||p==='adminStore'||p==='adminBills'||p==='adminGiveCoin')return 'admin';
  if(p==='mine'||p==='betHistory'||p==='battleHistory'||p==='exchangeHistory'||p==='clientExchange')return 'mine';
  return null;
}

function navigateTo(page, title, isSub) {
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active')});
  document.getElementById('page-'+page).classList.add('active');
  setTitle(title);
  document.getElementById('backBtn').style.display = isSub?'block':'none';
  var tk=pageToTab(page);
  document.querySelectorAll('#tabBar .tab-item').forEach(function(e){e.classList.remove('active')});
  if(tk&&document.getElementById('tabBtn-'+tk))document.getElementById('tabBtn-'+tk).classList.add('active');
  if(page==='sign')updateQRState();
  if(page==='admin')renderAdminHub();
  if(page==='adminGiveCoin')renderAdminGiveCoin();
  if(page==='adminMatches')renderZones();
  if(page==='adminStore')renderStore();
  if(page==='adminBills')renderBills();
  if(page==='betHistory')renderBetHistory();
  if(page==='exchangeHistory'&&typeof renderExchangeHistory==='function')renderExchangeHistory();
  if(page==='clientExchange'&&typeof renderClientExchange==='function')renderClientExchange();
  if(page==='betting'){if(typeof syncStoreChrome==='function')syncStoreChrome();updateBannerAd();renderBettingMatches();}
  if(page==='home'){if(typeof syncStoreChrome==='function')syncStoreChrome();renderSignupView();updateBannerAd();}
  if(typeof updateCoinHudVisibility==='function')updateCoinHudVisibility();
}

// 门店下拉选项（与首页 clientStores 统一）
function storeOptions(){
  var stores = typeof clientStores !== 'undefined' ? clientStores : ['🏡 兰陵酒吧', '🍺 啤酒公社', '✨ 星光酒廊'];
  var active = typeof clientStore !== 'undefined' ? clientStore : stores[0];
  return stores.map(function(s){return '<option'+(s===active?' selected':'')+'>'+s+'</option>'}).join('');
}

// 管理中心：所有管理功能入口
function renderAdminHub(){
  var el=document.getElementById('adminHub');if(!el)return;
  if(!isAdmin){
    el.innerHTML='<div class="login-prompt"><div class="hint-icon">🔐</div><div class="hint-text">登录后可使用管理功能</div><button class="btn btn-primary" onclick="showLogin()" style="background:#07c160;width:auto;display:inline-block;padding:12px 40px;">🔽 一键登录</button></div>';
    return;
  }
  var h='';
  h+='<div class="card" style="display:flex;align-items:center;justify-content:space-between;gap:10px;">';
  var activeStore = typeof clientStore !== 'undefined' ? clientStore : '🏡 兰陵酒吧';
  h+='<div style="min-width:0;"><div style="color:var(--accent2);font-size:0.85em;font-weight:700;">🏬 当前门店</div><div class="store-venue">'+activeStore+'</div></div>';
  h+='<select class="select" style="width:auto;flex:0 0 auto;font-size:0.78em;" onchange="switchStore(this.value)">'+storeOptions()+'</select>';
  h+='</div>';
  h+='<div class="menu-btn" onclick="goAdminSub(\'adminGiveCoin\')"><span class="menu-left">📲 发放货币</span><span class="menu-arrow">→</span></div>';
  h+='<div class="menu-btn" onclick="goAdminSub(\'adminMatches\')"><span class="menu-left">📷 场次管理</span><span class="menu-arrow">→</span></div>';
  h+='<div class="menu-btn" onclick="goAdminSub(\'adminBills\')"><span class="menu-left">📋 账单管理</span><span class="menu-arrow">→</span></div>';
  el.innerHTML=h;
}

function switchTab(t){
  if(t==='home'){pageStack=['home'];navigateTo('home','🏟️ LumiSport',false);}
  else if(t==='admin'){pageStack=['admin'];navigateTo('admin',adminTitle(),false);}
  else if(t==='mine'){pageStack=['mine'];navigateTo('mine','👤 我的',false);}
}
function goSub(s){var titles={betHistory:'📋 竞猜记录',battleHistory:'⚔️ 比赛记录',betting:'🎯 竞猜',exchangeHistory:'📦 兑换记录',clientExchange:'📦 兑换商品'};pageStack.push(s);navigateTo(s,titles[s]||s,true)}
// 从管理中心进入二级管理页
function goAdminSub(page){
  var titles={adminGiveCoin:'📲 发放货币',adminMatches:'📷 场次管理',adminStore:'📦 商品管理',adminBills:'📋 账单管理'};
  pageStack.push(page);navigateTo(page,titles[page]||page,true);
}
// 客户端兑换入口
function goClientExchange(){ goSub('clientExchange'); }
function goBack(){
  if(pageStack.length<=1)return;
  pageStack.pop();var p=pageStack[pageStack.length-1];
  var titles={home:'🏟️ LumiSport',mine:'👤 我的',admin:adminTitle(),betHistory:'📋 竞猜记录',battleHistory:'⚔️ 比赛记录',betting:'🎯 竞猜',exchangeHistory:'📦 兑换记录',adminGiveCoin:'📲 发放货币',adminMatches:'📷 场次管理',adminStore:'📦 商品管理',adminBills:'📋 账单管理',clientExchange:'📦 兑换商品'};
  var isSub=(p==='betHistory'||p==='battleHistory'||p==='betting'||p==='exchangeHistory'||p==='adminGiveCoin'||p==='adminMatches'||p==='adminStore'||p==='adminBills'||p==='clientExchange');
  navigateTo(p,titles[p]||p,isSub);
}
function updateQRState(){
  var blur=document.getElementById('qrBlur'),tag=document.getElementById('statusTag'),tip=document.getElementById('qrTip');
  if(isAdmin){if(blur)blur.classList.add('hidden');if(tag)tag.textContent='未登记';if(tag)tag.className='status-tag status-none';if(tip)tip.textContent='兑换请出示此码'}
  else{if(blur)blur.classList.remove('hidden');if(tag)tag.textContent='未登录';if(tag)tag.className='status-tag status-none';if(tip)tip.textContent='登录后出示身份码'}
}
function showLogin(){document.getElementById('loginModal').classList.remove('hidden')}
function doLogin(){
  isAdmin=true;isLoggedIn=true;
  document.getElementById('loginModal').classList.add('hidden');
  var blurs=document.querySelectorAll('.qr-blur');for(var bi=0;bi<blurs.length;bi++)blurs[bi].classList.add('hidden');
  var tag=document.getElementById('statusTag');if(tag)tag.textContent='未登记';if(tag)tag.className='status-tag status-none';
  var tip=document.getElementById('qrTip');if(tip)tip.textContent='兑换请出示此码';
  var lp=document.getElementById('loginPrompt');if(lp)lp.classList.add('hidden');
  var pc=document.getElementById('profileCard');if(pc)pc.classList.remove('hidden');
  var lo=document.getElementById('logoutBtn');if(lo)lo.classList.remove('hidden');
  var mb=document.getElementById('menuBet');if(mb)mb.classList.remove('hidden');
  var mba=document.getElementById('menuBattle');if(mba)mba.classList.remove('hidden');
  var mex=document.getElementById('menuExchange');if(mex)mex.classList.remove('hidden');
  var at=document.getElementById('tabBtn-admin');if(at)at.classList.remove('hidden');
  // 更新兑换值显示
  if(typeof updateClientExchangeCoinDisplay==='function')updateClientExchangeCoinDisplay();
  if(typeof updateAllCoinDisplays==='function')updateAllCoinDisplays();
  if(typeof updateCoinHudVisibility==='function')updateCoinHudVisibility();
  if(typeof updateProfileStoreDisplay==='function')updateProfileStoreDisplay();
  if(window._pendingHome&&typeof runPendingHome==='function'){runPendingHome();}else{switchTab('admin');}
  toastMsg('管理员登录成功');
}
function doLogout(){
  isAdmin=false;isLoggedIn=false;scannedUser=null;
  var blurs=document.querySelectorAll('.qr-blur');for(var bi=0;bi<blurs.length;bi++)blurs[bi].classList.remove('hidden');
  var tag=document.getElementById('statusTag');if(tag)tag.textContent='未登录';if(tag)tag.className='status-tag status-none';
  var tip=document.getElementById('qrTip');if(tip)tip.textContent='登录后出示身份码';
  var lp=document.getElementById('loginPrompt');if(lp)lp.classList.remove('hidden');
  var pc=document.getElementById('profileCard');if(pc)pc.classList.add('hidden');
  var lo=document.getElementById('logoutBtn');if(lo)lo.classList.add('hidden');
  var mb=document.getElementById('menuBet');if(mb)mb.classList.add('hidden');
  var mba=document.getElementById('menuBattle');if(mba)mba.classList.add('hidden');
  var mex=document.getElementById('menuExchange');if(mex)mex.classList.add('hidden');
  var at=document.getElementById('tabBtn-admin');if(at)at.classList.add('hidden');
  switchTab('home');toastMsg('已退出登录');
  if(typeof updateCoinHudVisibility==='function')updateCoinHudVisibility();
}
function genQR(){var grids=document.querySelectorAll('.qr-inner');for(var k=0;k<grids.length;k++){var g=grids[k];g.innerHTML='';for(var i=0;i<64;i++){var c=document.createElement('div');c.className=Math.random()>0.55?'qr-cell':'qr-cell w';g.appendChild(c)}}}genQR();setInterval(genQR,5000);
function showConfirm(msg,cb){document.getElementById('confirmModal').style.zIndex='100';document.getElementById('confirmMsg').textContent=msg;document.getElementById('confirmModal').classList.remove('hidden');pendingConfirm=cb}
function closeConfirm(ok){document.getElementById('confirmModal').classList.add('hidden');document.getElementById('confirmModal').style.zIndex='';if(ok&&pendingConfirm)pendingConfirm();pendingConfirm=null}
function toastMsg(m){var t=document.getElementById('toast');t.textContent=m;t.classList.remove('hidden');setTimeout(function(){t.classList.add('hidden')},2200)}
function updateStoreView(){}
function switchStore(v){
  if(typeof selectClientStore==='function') selectClientStore(v);
  else {
    clientStore = v;
    if(typeof updateVenueLabels==='function') updateVenueLabels();
    if(typeof renderAdminHub==='function') renderAdminHub();
    toastMsg('已切换到 '+v);
  }
}

function updateVenueLabels(){
  var store = typeof clientStore !== 'undefined' ? clientStore : '🏡 兰陵酒吧';
  var ids=['billsVenue','storeVenueText'];
  for(var i=0;i<ids.length;i++){var el=document.getElementById(ids[i]);if(el)el.textContent=store;}
}

function showCoinHelp(type){
  var t=document.getElementById('coinHelpTitle'),c=document.getElementById('coinHelpContent');
  if(type==='coin'){t.innerHTML='💰 游戏币说明';c.innerHTML='<b>获得方式</b><br>• 管理员发放<br>• 活动赠送<br><br><b>消耗途径</b><br>• 参与竞猜下注（猜中不返还）<br>• 报名支付费用'}
  else{t.innerHTML='💎 兑换值说明';c.innerHTML='<b>获得方式</b><br>• 竞猜猜中奖励<br>• 活动赠送<br><br><b>消耗途径</b><br>• 兑换门店商品<br>• 兑换限定道具'}
  document.getElementById('coinHelpModal').classList.remove('hidden');
}

function updateCoinHudVisibility() {
  var hud = document.getElementById('coinHudBar');
  if (!hud) return;
  var page = pageStack[pageStack.length - 1];
  var tab = typeof pageToTab === 'function' ? pageToTab(page) : null;
  var show = isLoggedIn && (tab === 'mine' || tab === 'home');
  if (show) hud.classList.remove('hidden');
  else hud.classList.add('hidden');
}

// 初始化兑换值显示（兼容旧调用）
function initMyExchangeCoinDisplay() {
  if (typeof updateAllCoinDisplays === 'function') updateAllCoinDisplays();
}

// ========== 账单管理 ==========
var billsData = [
  {date:'2026-06-12', time:'21:35', user:'小明', type:'发放', desc:'管理员发放', amt:'+200', coin:'💰'},
  {date:'2026-06-12', time:'21:30', user:'阿强', type:'下注', desc:'竞猜下注 · 雷霆击剑', amt:'-500', coin:'💰'},
  {date:'2026-06-12', time:'21:25', user:'大飞', type:'兑换', desc:'兑换 🏡鸡尾酒', amt:'-80', coin:'💎'},
  {date:'2026-06-12', time:'21:20', user:'杰哥', type:'结算', desc:'猜中结算 · 雷霆击剑', amt:'+900', coin:'💎'},
  {date:'2026-06-12', time:'21:15', user:'老王', type:'发放', desc:'管理员发放', amt:'+100', coin:'💰'},
  {date:'2026-06-12', time:'21:10', user:'小明', type:'结算', desc:'猜中结算 · 烈焰拳王', amt:'+720', coin:'💎'},
  {date:'2026-06-12', time:'21:05', user:'阿豪', type:'下注', desc:'竞猜下注 · 疾速冰球', amt:'-200', coin:'💰'},
  {date:'2026-06-12', time:'21:00', user:'杰哥', type:'兑换', desc:'兑换 🖈威士忌', amt:'-50', coin:'💎'},
  {date:'2026-06-11', time:'23:50', user:'阿强', type:'发放', desc:'签到领取', amt:'+100', coin:'💰'},
  {date:'2026-06-11', time:'23:45', user:'大飞', type:'下注', desc:'竞猜下注 · 烈焰拳王', amt:'-300', coin:'💰'},
  {date:'2026-06-11', time:'23:30', user:'小明', type:'兑换', desc:'兑换 🏎红酒', amt:'-60', coin:'💎'},
  {date:'2026-06-11', time:'23:20', user:'老王', type:'发放', desc:'管理员发放', amt:'+50', coin:'💰'}
];
var billFilter='全部';

function renderBills(){
  var filtered=billsData.filter(function(b){return billFilter==='全部'||b.type===billFilter});
  var h='';
  filtered.forEach(function(b){
    var cls=b.amt.indexOf('+')===0?'flow-in':'flow-out';
    h+='<div class="flow-row"><span class="flow-time bill-time"><span class="bt-date">'+(b.date||'')+'</span><span class="bt-clock">'+b.time+'</span></span><span class="flow-desc">👤 '+b.user+' · '+b.desc+'</span><span class="flow-amt '+cls+'">'+b.amt+' '+b.coin+'</span></div>';
  });
  if(filtered.length===0)h='<div style="text-align:center;padding:20px;color:var(--muted);font-size:0.8em;">暂无记录</div>';
  document.getElementById('billsList').innerHTML=h;
  var bv=document.getElementById('billsVenue');if(bv)bv.textContent=typeof clientStore!=='undefined'?clientStore:'🏡 兰陵酒吧';
}
function filterBills(type){billFilter=type;renderBills();}
