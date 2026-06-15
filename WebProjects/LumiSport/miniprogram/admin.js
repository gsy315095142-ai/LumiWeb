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
var currentStore = '🏡 兰陵酒吧';
var signupRedFull = false, signupBlueFull = false;
var isLoggedIn = false, matchState = {}, MAX_BET = 200, selectedZone = '疾速冰球厅';

function setTitle(t) { document.getElementById('titleText').innerHTML = t; }

var ADMIN_TITLE = '🛠️ 管理';
function adminTitle(){ return ADMIN_TITLE + (isAdmin?' <span class="admin-badge">管理员</span>':''); }

// 页面 → 底部Tab 归属（用于高亮）
function pageToTab(p){
  if(p==='home'||p==='betting')return 'home';
  if(p==='admin'||p==='adminMatches'||p==='adminStore'||p==='adminBills'||p==='adminGiveCoin'||p==='exchange')return 'admin';
  if(p==='mine'||p==='betHistory'||p==='battleHistory'||p==='exchangeHistory')return 'mine';
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
  if(page==='exchange')renderExchange();
  if(page==='adminGiveCoin')renderAdminGiveCoin();
  if(page==='adminMatches')renderZones();
  if(page==='adminStore')renderStore();
  if(page==='adminBills')renderBills();
  if(page==='betHistory')renderBetHistory();
  if(page==='exchangeHistory'&&typeof renderExchangeHistory==='function')renderExchangeHistory();
  if(page==='betting'){if(typeof syncStoreChrome==='function')syncStoreChrome();updateBannerAd();renderBettingMatches();}
  if(page==='home'){if(typeof syncStoreChrome==='function')syncStoreChrome();renderSignupView();updateBannerAd();}
}

// 门店下拉选项
function storeOptions(){
  var stores=['🏡 兰陵酒吧','🏑 啤酒公社','🖈 星光酒廊'];
  return stores.map(function(s){return '<option'+(s===currentStore?' selected':'')+'>'+s+'</option>'}).join('');
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
  h+='<div style="min-width:0;"><div style="color:var(--accent2);font-size:0.85em;font-weight:700;">🏬 当前门店</div><div class="store-venue">'+currentStore+'</div></div>';
  h+='<select class="select" style="width:auto;flex:0 0 auto;font-size:0.78em;" onchange="switchStore(this.value)">'+storeOptions()+'</select>';
  h+='</div>';
  h+='<div class="menu-btn" onclick="goAdminSub(\'adminGiveCoin\')"><span class="menu-left">📲 发放货币</span><span class="menu-arrow">→</span></div>';
  h+='<div class="menu-btn" onclick="goAdminSub(\'adminMatches\')"><span class="menu-left">📷 场次管理</span><span class="menu-arrow">→</span></div>';
  h+='<div class="menu-btn" onclick="goExchange()"><span class="menu-left">📦 兑换物品</span><span class="menu-arrow">→</span></div>';
  h+='<div class="menu-btn" onclick="goAdminSub(\'adminBills\')"><span class="menu-left">📋 账单管理</span><span class="menu-arrow">→</span></div>';
  el.innerHTML=h;
}

// ========== 兑换物品（双扫码） ==========
var exItem = null;  // { icon,name,price,origPrice,desc }
var exUser2 = null; // { name,id,exCoin }

function goExchange(){ exItem=null; exUser2=null; pageStack.push('exchange'); navigateTo('exchange','📦 兑换物品',true); }

function scanExItem(){
  var p=products[Math.floor(Math.random()*products.length)];
  exItem={icon:p.icon,name:p.name,price:p.price,origPrice:p.origPrice,desc:p.desc};
  renderExchange();
}
function scanExUser(){
  var name=randomNames[Math.floor(Math.random()*randomNames.length)];
  exUser2={name:name,id:'Lumi_'+(Math.floor(Math.random()*9000)+1000),exCoin:Math.floor(Math.random()*500)+50};
  renderExchange();
}
function confirmExchangeItem(){
  if(!exItem||!exUser2)return;
  if(exUser2.exCoin<exItem.price)return toastMsg('兑换币余额不足');
  toastMsg('🎁 核销成功！'+exUser2.name+' 兑换 '+exItem.name+' · 扣除 '+exItem.price+' 💎');
  exItem=null;exUser2=null;renderExchange();
}

function renderExchange(){
  var el=document.getElementById('exchangeBody');if(!el)return;
  var h='<p style="color:var(--muted);font-size:0.75em;margin-bottom:10px;text-align:center;">分别扫描「物品条形码」与「用户身份码」完成兑换核销</p>';
  // 物品信息
  h+='<div class="card"><h3>📦 物品信息</h3>';
  if(exItem){
    h+='<div class="ex-scanned"><div class="ex-scanned-icon">'+exItem.icon+'</div><div class="ex-scanned-info"><div class="ex-scanned-name">'+exItem.name+'</div><div class="ex-scanned-meta">售价 <span style="color:var(--accent2);font-weight:700;">'+exItem.price+' 💎</span> · 原价 ￥'+exItem.origPrice+'</div><div class="ex-scanned-desc">'+exItem.desc+'</div></div></div>';
    h+='<button class="btn btn-outline btn-sm btn-block" style="margin-top:10px;color:#fff;" onclick="scanExItem()">🔄 重新扫描物品</button>';
  }else{
    h+='<div class="ex-scan-empty"><div class="scan-step-icon">📦</div><p style="color:var(--muted);font-size:0.8em;margin:6px 0 12px;">请扫描物品条形码</p><button class="btn btn-purple" style="width:auto;display:inline-block;padding:10px 28px;" onclick="scanExItem()">📲 扫描物品二维码</button></div>';
  }
  h+='</div>';
  // 用户信息
  h+='<div class="card"><h3>👤 用户信息</h3>';
  if(exUser2){
    h+='<div class="ex-scanned"><div class="ex-scanned-icon">👁</div><div class="ex-scanned-info"><div class="ex-scanned-name">'+exUser2.name+'</div><div class="ex-scanned-meta">ID: '+exUser2.id+'</div><div class="ex-scanned-meta">💎 兑换币余额 <strong style="color:#c4b5fd;">'+exUser2.exCoin+'</strong></div></div></div>';
    h+='<button class="btn btn-outline btn-sm btn-block" style="margin-top:10px;color:#fff;" onclick="scanExUser()">🔄 重新扫描用户</button>';
  }else{
    h+='<div class="ex-scan-empty"><div class="scan-step-icon">👤</div><p style="color:var(--muted);font-size:0.8em;margin:6px 0 12px;">请扫描用户「我的」二维码</p><button class="btn btn-purple" style="width:auto;display:inline-block;padding:10px 28px;" onclick="scanExUser()">📲 扫描用户身份码</button></div>';
  }
  h+='</div>';
  // 核销
  if(exItem&&exUser2){
    var enough=exUser2.exCoin>=exItem.price;
    h+='<div class="card"><div class="ex-confirm-row"><span>需扣除</span><strong style="color:var(--accent2);">'+exItem.price+' 💎</strong></div><div class="ex-confirm-row"><span>用户余额</span><strong style="color:#c4b5fd;">'+exUser2.exCoin+' 💎</strong></div>';
    if(enough){
      h+='<button class="btn btn-purple btn-block" style="margin-top:12px;" onclick="confirmExchangeItem()">✅ 确认核销 · 扣除 '+exItem.price+' 💎</button>';
    }else{
      h+='<div class="bet-hint" style="text-align:center;">兑换币余额不足，无法核销</div><button class="btn btn-outline btn-block" disabled style="margin-top:4px;opacity:0.4;cursor:not-allowed;color:#fff;">余额不足</button>';
    }
    h+='</div>';
  }
  el.innerHTML=h;
}

function switchTab(t){
  if(t==='home'){pageStack=['home'];navigateTo('home','🏟️ LumiSport',false);}
  else if(t==='admin'){pageStack=['admin'];navigateTo('admin',adminTitle(),false);}
  else if(t==='mine'){pageStack=['mine'];navigateTo('mine','👤 我的',false);}
}
function goSub(s){var titles={betHistory:'📋 竞猜记录',battleHistory:'⚔️ 比赛记录',betting:'🎯 竞猜',exchangeHistory:'📦 兑换记录'};pageStack.push(s);navigateTo(s,titles[s]||s,true)}
// 从管理中心进入二级管理页
function goAdminSub(page){
  var titles={adminGiveCoin:'📲 发放货币',adminMatches:'📷 场次管理',adminStore:'📦 商品管理',adminBills:'📋 账单管理'};
  pageStack.push(page);navigateTo(page,titles[page]||page,true);
}
function goBack(){
  if(pageStack.length<=1)return;
  pageStack.pop();var p=pageStack[pageStack.length-1];
  var titles={home:'🏟️ LumiSport',mine:'👤 我的',admin:adminTitle(),betHistory:'📋 竞猜记录',battleHistory:'⚔️ 比赛记录',betting:'🎯 竞猜',exchangeHistory:'📦 兑换记录',adminGiveCoin:'📲 发放货币',adminMatches:'📷 场次管理',adminStore:'📦 商品管理',adminBills:'📋 账单管理',exchange:'📦 兑换物品'};
  var isSub=(p==='betHistory'||p==='battleHistory'||p==='betting'||p==='exchangeHistory'||p==='adminGiveCoin'||p==='adminMatches'||p==='adminStore'||p==='adminBills'||p==='exchange');
  navigateTo(p,titles[p]||p,isSub);
}
function updateQRState(){
  var blur=document.getElementById('qrBlur'),tag=document.getElementById('statusTag'),tip=document.getElementById('qrTip');
  if(isAdmin){if(blur)blur.classList.add('hidden');if(tag)tag.textContent='未登记';if(tag)tag.className='status-tag status-none';if(tip)tip.textContent='报名、兑换请出示此码'}
  else{if(blur)blur.classList.remove('hidden');if(tag)tag.textContent='未登录';if(tag)tag.className='status-tag status-none';if(tip)tip.textContent='登录后出示身份码'}
}
function showLogin(){document.getElementById('loginModal').classList.remove('hidden')}
function doLogin(){
  isAdmin=true;isLoggedIn=true;
  document.getElementById('loginModal').classList.add('hidden');
  var blurs=document.querySelectorAll('.qr-blur');for(var bi=0;bi<blurs.length;bi++)blurs[bi].classList.add('hidden');
  var tag=document.getElementById('statusTag');if(tag)tag.textContent='未登记';if(tag)tag.className='status-tag status-none';
  var tip=document.getElementById('qrTip');if(tip)tip.textContent='报名、兑换请出示此码';
  var lp=document.getElementById('loginPrompt');if(lp)lp.classList.add('hidden');
  var pc=document.getElementById('profileCard');if(pc)pc.classList.remove('hidden');
  var lo=document.getElementById('logoutBtn');if(lo)lo.classList.remove('hidden');
  var mb=document.getElementById('menuBet');if(mb)mb.classList.remove('hidden');
  var mba=document.getElementById('menuBattle');if(mba)mba.classList.remove('hidden');
  var mex=document.getElementById('menuExchange');if(mex)mex.classList.remove('hidden');
  var at=document.getElementById('tabBtn-admin');if(at)at.classList.remove('hidden');
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
}
function genQR(){var grids=document.querySelectorAll('.qr-inner');for(var k=0;k<grids.length;k++){var g=grids[k];g.innerHTML='';for(var i=0;i<64;i++){var c=document.createElement('div');c.className=Math.random()>0.55?'qr-cell':'qr-cell w';g.appendChild(c)}}}genQR();setInterval(genQR,5000);
function showConfirm(msg,cb){document.getElementById('confirmMsg').textContent=msg;document.getElementById('confirmModal').classList.remove('hidden');pendingConfirm=cb}
function closeConfirm(ok){document.getElementById('confirmModal').classList.add('hidden');if(ok&&pendingConfirm)pendingConfirm();pendingConfirm=null}
function toastMsg(m){var t=document.getElementById('toast');t.textContent=m;t.classList.remove('hidden');setTimeout(function(){t.classList.add('hidden')},2200)}
function updateStoreView(){}
function switchStore(v){currentStore=v;toastMsg('已切换到 '+v);updateVenueLabels();var cur=pageStack[pageStack.length-1];if(cur==='adminStore')renderStore();if(cur==='adminBills')renderBills();if(cur==='admin')renderAdminHub()}
var storeHotelAd={
  '🏡 兰陵酒吧':{badge:'🏨 兰陵大酒店',title:'住客专享 · 入住即送1000游戏币',desc:'前台领取实体筹码，扫码兑换即时到账'},
  '🏑 啤酒公社':{badge:'🏨 公社精酿酒店',title:'住客专享 · 畅饮套餐送500游戏币',desc:'凭房卡到吧台领取，竞猜赢取兑换币'},
  '🖈 星光酒廊':{badge:'🏨 星光国际酒店',title:'住客专享 · 入住即享888游戏币',desc:'扫码即时到账，赛事竞猜赢豪礼'}
};
function updateVenueLabels(){
  var ids=['homeVenue','billsVenue','storeVenueText'];
  for(var i=0;i<ids.length;i++){var el=document.getElementById(ids[i]);if(el)el.textContent=currentStore;}
  var ad=storeHotelAd[currentStore];
  if(ad){
    var b=document.getElementById('homeHotelBadge');if(b)b.textContent=ad.badge;
    var t=document.getElementById('homeHotelTitle');if(t)t.textContent=ad.title;
    var d=document.getElementById('homeHotelDesc');if(d)d.textContent=ad.desc;
  }
}

function showCoinHelp(type){
  var t=document.getElementById('coinHelpTitle'),c=document.getElementById('coinHelpContent');
  if(type==='coin'){t.innerHTML='💰 游戏币说明';c.innerHTML='<b>获得方式</b><br>• 管理员发放<br>• 竞猜获胜奖励<br><br><b>消耗途径</b><br>• 参与竞猜下注<br>• 报名支付费用'}
  else{t.innerHTML='💎 兑换币说明';c.innerHTML='<b>获得方式</b><br>• 竞猜获胜额外奖励<br>• 活动赠送<br><br><b>消耗途径</b><br>• 兑换门店商品<br>• 兑换限定道具'}
  document.getElementById('coinHelpModal').classList.remove('hidden');
}

// ========== 账单管理 ==========
var billsData = [
  {date:'2026-06-12', time:'21:35', user:'小明', type:'发放', desc:'管理员发放', amt:'+200', coin:'💰'},
  {date:'2026-06-12', time:'21:30', user:'阿强', type:'下注', desc:'竞猜下注 · 雷霆击剑', amt:'-500', coin:'💰'},
  {date:'2026-06-12', time:'21:25', user:'大飞', type:'兑换', desc:'兑换 🏡鸡尾酒', amt:'-80', coin:'💎'},
  {date:'2026-06-12', time:'21:20', user:'杰哥', type:'结算', desc:'猜中结算 · 雷霆击剑', amt:'+900', coin:'💰'},
  {date:'2026-06-12', time:'21:15', user:'老王', type:'发放', desc:'管理员发放', amt:'+100', coin:'💰'},
  {date:'2026-06-12', time:'21:10', user:'小明', type:'结算', desc:'猜中结算 · 烈焰拳王', amt:'+720', coin:'💰'},
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
  var bv=document.getElementById('billsVenue');if(bv)bv.textContent=currentStore;
}
function filterBills(type){billFilter=type;renderBills();}
