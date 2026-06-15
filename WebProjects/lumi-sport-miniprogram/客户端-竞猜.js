/**
 * LumiSport 客户端 - 竞猜下注 & 报名 & 选手数据
 */

// 比赛数据（竞猜用）
var matchData = [
  { id:'m1', game:'⚔️ 雷霆击剑', time:'21:45', zone:'雷霆击剑厅', phase:'betting', red:'战神阿飞', blue:'疾风小刀', redOdds:1.80, blueOdds:2.00 },
  { id:'m2', game:'🔥 烈焰拳王', time:'22:15', zone:'烈焰拳王厅', phase:'betting', red:'北地枪王', blue:'深海巨鲨', redOdds:1.50, blueOdds:2.00 },
  { id:'m3', game:'🏒 疾速冰球', time:'21:30', zone:'疾速冰球厅', phase:'playing',  red:'荒野狼王', blue:'雷霆少年', redOdds:1.65, blueOdds:2.10 },
  { id:'m4', game:'⚔️ 雷霆击剑', time:'21:00', zone:'雷霆击剑厅', phase:'settled', red:'龙之影',   blue:'鹰眼猎手', redOdds:1.70, blueOdds:1.95, winner:'red' }
];

// 选手统计数据
var playerStats = {
  '战神阿飞':   { points:1250, wins:34, losses:16, recent:['win','win','lose','win','win'],   zone:'雷霆击剑厅', side:'red'  },
  '疾风小刀':   { points:980,  wins:28, losses:20, recent:['win','lose','win','lose','win'], zone:'雷霆击剑厅', side:'blue' },
  '北地枪王':   { points:1520, wins:42, losses:12, recent:['win','win','win','lose','win'],  zone:'烈焰拳王厅', side:'red'  },
  '深海巨鲨':   { points:1100, wins:30, losses:22, recent:['lose','win','win','win','lose'], zone:'烈焰拳王厅', side:'blue' },
  '荒野狼王':   { points:860,  wins:22, losses:18, recent:['win','lose','lose','win','win'], zone:'疾速冰球厅', side:'red'  },
  '雷霆少年':   { points:720,  wins:18, losses:14, recent:['lose','win','win','lose','win'], zone:'疾速冰球厅', side:'blue' },
  '龙之影':     { points:1350, wins:38, losses:10, recent:['win','win','win','win','lose'],  zone:'雷霆击剑厅', side:'red'  },
  '鹰眼猎手':   { points:1050, wins:26, losses:24, recent:['lose','win','lose','win','win'], zone:'雷霆击剑厅', side:'blue' }
};

// 每厅报名基础信息（项目、报名费）。报名费为 0，不再扣费/退还
var signupInfo = {
  '疾速冰球厅': { game:'🏒 疾速冰球', fee:0 },
  '雷霆击剑厅': { game:'⚔️ 雷霆击剑', fee:0 },
  '烈焰拳王厅': { game:'🔥 烈焰拳王', fee:0 }
};

// 各厅报名队列（命名选手，赛场tab与管理端区域管理共享同一数据源）
var signupQueues = {
  '疾速冰球厅': [
    { name:'荒野狼王', time:'21:10:00', side:'red'  },
    { name:'雷霆少年', time:'21:11:05', side:'blue' },
    { name:'冰刃飞将', time:'21:12:30', side:null   },
    { name:'极地风暴', time:'21:14:10', side:null   },
    { name:'寒霜之刃', time:'21:15:48', side:null   },
    { name:'银甲游侠', time:'21:17:22', side:null   },
    { name:'疾风骑士', time:'21:19:05', side:null   },
    { name:'雪原猎手', time:'21:20:41', side:null   }
  ],
  '雷霆击剑厅': [
    { name:'战神阿飞', time:'21:25:00', side:'red'  },
    { name:'疾风小刀', time:'21:26:05', side:'blue' },
    { name:'小明',     time:'21:15:32', side:null   },
    { name:'阿强',     time:'21:16:05', side:null   },
    { name:'大飞',     time:'21:17:41', side:null   },
    { name:'剑影无双', time:'21:18:50', side:null   }
  ],
  '烈焰拳王厅': [
    { name:'北地枪王', time:'21:30:00', side:null   },
    { name:'深海巨鲨', time:'21:31:00', side:null   },
    { name:'烈焰拳神', time:'21:32:15', side:null   },
    { name:'铁拳豪杰', time:'21:33:40', side:null   },
    { name:'狂暴战熊', time:'21:35:02', side:null   },
    { name:'赤焰武僧', time:'21:36:28', side:null   },
    { name:'霹雳火',   time:'21:38:00', side:null   }
  ]
};

function signupNowTime(){var d=new Date();function p(n){return n<10?'0'+n:''+n;}return p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds());}

// 当前报名状态（切厅不丢失）
var mySignup = null; // { game, zone, fee }

// 当前用户游戏币余额（演示用，报名扣费/取消退还）
var myGameCoin = 1250;
function updateMyCoinDisplay(){var el=document.getElementById('myGameCoinVal');if(el)el.textContent=myGameCoin.toLocaleString();}

// 我已下注记录（按场次累计，红/蓝分别累计），下注确认后持久显示
var myBets = {}; // { mid: { red:金额, blue:金额 } }
function getMyBet(mid,side){var b=myBets[mid];return b&&b[side]?b[side]:0;}
function myBetTag(mid,side){var amt=getMyBet(mid,side);return amt>0?'<div class="my-bet-tag">已下注 '+amt+' 💰</div>':'';}

// ========== 竞猜记录 & 预言家段位 ==========
// 竞猜记录（真实数据来源，预言家段位与胜率均由此计算）
var betRecords = [
  { game:'⚔️ 雷霆击剑', zone:'雷霆击剑厅', date:'2026-06-12', time:'20:32', red:'龙之影',   blue:'鹰眼猎手', result:'win',  coin:170, ex:70 },
  { game:'⚔️ 雷霆击剑', zone:'雷霆击剑厅', date:'2026-06-12', time:'20:08', red:'战神阿飞', blue:'疾风小刀', result:'lose', coin:-100, ex:0 },
  { game:'🔥 烈焰拳王', zone:'烈焰拳王厅', date:'2026-06-12', time:'19:45', red:'北地枪王', blue:'深海巨鲨', result:'win',  coin:150, ex:50 },
  { game:'🏒 疾速冰球', zone:'疾速冰球厅', date:'2026-06-12', time:'19:20', red:'荒野狼王', blue:'雷霆少年', result:'win',  coin:130, ex:40 },
  { game:'⚔️ 雷霆击剑', zone:'雷霆击剑厅', date:'2026-06-11', time:'21:50', red:'鹰眼猎手', blue:'龙之影',   result:'lose', coin:-80, ex:0 },
  { game:'🔥 烈焰拳王', zone:'烈焰拳王厅', date:'2026-06-11', time:'21:10', red:'深海巨鲨', blue:'北地枪王', result:'win',  coin:160, ex:60 },
  { game:'🏒 疾速冰球', zone:'疾速冰球厅', date:'2026-06-11', time:'20:30', red:'雷霆少年', blue:'荒野狼王', result:'win',  coin:120, ex:40 },
  { game:'⚔️ 雷霆击剑', zone:'雷霆击剑厅', date:'2026-06-11', time:'19:55', red:'战神阿飞', blue:'疾风小刀', result:'win',  coin:140, ex:50 },
  { game:'🔥 烈焰拳王', zone:'烈焰拳王厅', date:'2026-06-10', time:'21:30', red:'北地枪王', blue:'深海巨鲨', result:'lose', coin:-100, ex:0 },
  { game:'🏒 疾速冰球', zone:'疾速冰球厅', date:'2026-06-10', time:'20:45', red:'荒野狼王', blue:'雷霆少年', result:'win',  coin:110, ex:30 },
  { game:'⚔️ 雷霆击剑', zone:'雷霆击剑厅', date:'2026-06-10', time:'20:00', red:'龙之影',   blue:'鹰眼猎手', result:'win',  coin:180, ex:80 },
  { game:'🔥 烈焰拳王', zone:'烈焰拳王厅', date:'2026-06-09', time:'21:15', red:'深海巨鲨', blue:'北地枪王', result:'lose', coin:-90, ex:0 }
];

// 预言家段位（按累计竞猜场次划分，min 为进入该段位所需场次）
var prophetTiers = [
  { name:'青铜预言家', icon:'🥉', min:0 },
  { name:'白银预言家', icon:'🥈', min:5 },
  { name:'黄金预言家', icon:'🥇', min:15 },
  { name:'铂金预言家', icon:'💠', min:30 },
  { name:'钻石预言家', icon:'💎', min:60 }
];

function renderBetHistory(){
  var listEl=document.getElementById('betHistoryList');
  if(listEl){
    var html='';
    betRecords.forEach(function(r){
      var rs=r.result==='win'
        ?'<span class="result-win">+'+r.coin+' 💰 · +'+r.ex+' 💎</span>'
        :'<span class="result-lose">'+r.coin+' 💰</span>';
      html+='<div class="history-item"><div class="hist-top"><span class="hist-match">'+r.game+' · '+r.zone+'</span>'+rs+'</div>';
      html+='<div class="hist-detail">📅 '+r.date+' &nbsp; 🕐 '+r.time+' &nbsp;|&nbsp; 🔴 <span class="player-nick-link" onclick="showPlayerStats(\''+r.red+'\')">'+r.red+'</span> vs 🔵 <span class="player-nick-link" onclick="showPlayerStats(\''+r.blue+'\')">'+r.blue+'</span></div></div>';
    });
    listEl.innerHTML=html;
  }
  var cardEl=document.getElementById('prophetCard');
  if(cardEl){
    var total=betRecords.length;
    var wins=betRecords.filter(function(r){return r.result==='win'}).length;
    var rate=total>0?Math.round(wins/total*100):0;
    var ti=0;for(var i=0;i<prophetTiers.length;i++){if(total>=prophetTiers[i].min)ti=i;}
    var cur=prophetTiers[ti],next=prophetTiers[ti+1];
    var pct,note;
    if(next){pct=Math.min(100,Math.round(total/next.min*100));note='距'+next.name+'还差 '+(next.min-total)+' 场';}
    else{pct=100;note='🏆 已达最高段位';}
    cardEl.innerHTML='<div class="rank-icon">'+cur.icon+'</div><div class="rank-name">'+cur.name+'</div>'
      +'<div class="rank-note" style="margin-top:6px;">竞猜 '+total+' 场 · 猜中 '+wins+' 场 · 胜率 '+rate+'%</div>'
      +'<div class="rank-bar"><div class="rank-fill" style="width:'+pct+'%;"></div></div>'
      +'<div class="rank-note">'+note+'</div>';
  }
}

// ========== 选手数据弹窗 ==========
function showPlayerStats(name){
  var ps=playerStats[name];if(!ps)return;
  var total=ps.wins+ps.losses;
  var rate=total>0?Math.round(ps.wins/total*100):0;
  document.getElementById('psAvatar').textContent=ps.side==='red'?'🔴':'🔵';
  document.getElementById('psAvatar').className='player-stats-avatar '+(ps.side==='red'?'red':'blue');
  document.getElementById('psName').textContent=name;
  document.getElementById('psZone').textContent='主厅：'+ps.zone;
  document.getElementById('psPoints').textContent=ps.points.toLocaleString();
  document.getElementById('psWinRate').textContent=rate+'%';
  document.getElementById('psWins').textContent=ps.wins+'胜';
  document.getElementById('psLosses').textContent=ps.losses+'负';
  var dots='';
  ps.recent.forEach(function(r){dots+='<div class=\"ps-dot '+(r==='win'?'win':'lose')+'\">'+(r==='win'?'✓':'✗')+'</div>'});
  document.getElementById('psRecent').innerHTML=dots;
  document.getElementById('playerStatsModal').classList.remove('hidden');
}

// ========== 报名入口行 ==========
function getZoneSignupInfo(zone){
  var info=signupInfo[zone]||{game:'',fee:0};
  var q=signupQueues[zone]||[];
  return {game:info.game,fee:info.fee,queueCount:q.length};
}

function getMyQueuePos(zone){
  if(!mySignup||mySignup.zone!==zone)return -1;
  var q=signupQueues[zone]||[];
  for(var i=0;i<q.length;i++){if(q[i].name==='本人')return i+1;}
  return q.length;
}

function updateSignupBar(){
  var bar=document.getElementById('signupBar');
  if(!bar)return;
  var zone=selectedZone;
  bar.classList.remove('hidden');
  var info=getZoneSignupInfo(zone);
  var emojiMap={'疾速冰球厅':'🏒','雷霆击剑厅':'⚔️','烈焰拳王厅':'🔥'};
  var emoji=emojiMap[zone]||'🏟️';
  var elZone=document.getElementById('signupBarZone');
  var elCount=document.getElementById('signupQueueCount');
  var elMeta=document.getElementById('signupBarMeta');
  var btn=document.getElementById('signupBarBtn');
  if(elZone)elZone.textContent=emoji+' '+zone;
  if(elCount)elCount.textContent=info.queueCount;
  if(!btn)return;
  if(mySignup&&mySignup.zone===zone){
    var pos=getMyQueuePos(zone);
    btn.textContent='取消报名';btn.classList.add('done');
    if(elMeta)elMeta.innerHTML='报名费 <span>'+info.fee+' 💰</span> · 排队 <strong>'+info.queueCount+'</strong> 人<span class=\"signup-my-pos\">排名 <strong>'+pos+'/'+info.queueCount+'</strong></span>';
  }else{
    btn.textContent='✋ 一键报名';btn.classList.remove('done');
    if(elMeta)elMeta.innerHTML='报名费 <span>'+info.fee+' 💰</span> · 排队 <strong id=\"signupQueueCount\">'+info.queueCount+'</strong> 人';
  }
}

// ========== 门店切换（客户端首页 Banner） ==========
var clientStore = '🏡 兰陵酒吧';

// Banner 广告：按 门店 + 大厅 组合匹配，缺失大厅时用门店级兜底
var storeAds = {
  '🏡 兰陵酒吧': {
    hotel: { badge:'🏨 兰陵大酒店', title:'住客专享 · 入住即送1000游戏币', desc:'前台领取实体筹码，扫码兑换即时到账' },
    tag: '今夜精彩赛事 · 参与竞猜赢好礼',
    zones: {
      '疾速冰球厅': '🏒 疾速冰球 · 今晚 21:30 开赛',
      '雷霆击剑厅': '⚔️ 雷霆击剑 · 新手报名立减 50',
      '烈焰拳王厅': '🔥 烈焰拳王 · 冠军竞猜赢双倍'
    }
  },
  '🍺 啤酒公社': {
    hotel: { badge:'🏨 公社精酿酒店', title:'住客专享 · 畅饮套餐送500游戏币', desc:'凭房卡到吧台领取，竞猜赢取兑换币' },
    tag: '畅饮 + 竞猜 · 嗨爆今夜',
    zones: {
      '疾速冰球厅': '🍺 啤酒公社 · 冰球之夜精酿特惠',
      '雷霆击剑厅': '🍺 啤酒公社 · 击剑对决配冰啤',
      '烈焰拳王厅': '🍺 啤酒公社 · 拳王之夜买一送一'
    }
  },
  '✨ 星光酒廊': {
    hotel: { badge:'🏨 星光国际酒店', title:'住客专享 · 入住即享888游戏币', desc:'扫码即时到账，赛事竞猜赢豪礼' },
    tag: '星光璀璨 · 竞猜赢大奖',
    zones: {
      '疾速冰球厅': '✨ 星光酒廊 · 冰球星光夜',
      '雷霆击剑厅': '✨ 星光酒廊 · 剑指巅峰盛典',
      '烈焰拳王厅': '✨ 星光酒廊 · 烈焰拳王之夜'
    }
  }
};

function updateBannerAd(){
  var s=storeAds[clientStore]||storeAds['🏡 兰陵酒吧'];if(!s)return;
  var hotels=document.querySelectorAll('.hotel-ad');
  for(var i=0;i<hotels.length;i++)hotels[i].innerHTML='<div class="hotel-ad-badge">'+s.hotel.badge+'</div><div class="hotel-ad-title">'+s.hotel.title+'</div><div class="hotel-ad-desc">'+s.hotel.desc+'</div>';
  var tagTxt=(s.zones&&s.zones[selectedZone])?s.zones[selectedZone]:s.tag;
  var tags=document.querySelectorAll('.ad-tag');
  for(var j=0;j<tags.length;j++)tags[j].textContent=tagTxt;
}
// 同步所有「门店名/大厅下拉」副本（首页 + 竞猜页共用）
function syncStoreChrome(){
  var vns=document.querySelectorAll('.venue-name');for(var i=0;i<vns.length;i++)vns[i].textContent=clientStore;
  var zs=document.querySelectorAll('.zone-select');for(var k=0;k<zs.length;k++)zs[k].value=selectedZone;
  var items=document.querySelectorAll('.store-menu-item');for(var n=0;n<items.length;n++)items[n].classList.toggle('active',items[n].textContent.trim()===clientStore);
}
function toggleStoreMenu(e,el){
  if(e&&e.stopPropagation)e.stopPropagation();
  var menus=document.querySelectorAll('.store-menu');
  var own=el?el.parentNode.querySelector('.store-menu'):document.getElementById('storeMenu');
  for(var i=0;i<menus.length;i++){if(menus[i]===own)menus[i].classList.toggle('hidden');else menus[i].classList.add('hidden');}
}
function selectClientStore(name){
  clientStore=name;
  var menus=document.querySelectorAll('.store-menu');for(var i=0;i<menus.length;i++)menus[i].classList.add('hidden');
  syncStoreChrome();
  updateBannerAd();renderBettingMatches();updateSignupBar();renderSignupView();
  toastMsg('已切换到 '+name);
}

// ========== 首页入口：竞猜跳转页 / 报名弹窗 ==========
function goBetting(){
  if(!isLoggedIn){window._pendingHome='betting';if(typeof showLogin==='function')showLogin();return;}
  if(typeof goSub==='function')goSub('betting');
}
function openSignupModal(){
  if(!isLoggedIn){window._pendingHome='signup';if(typeof showLogin==='function')showLogin();return;}
  renderSignupView();var m=document.getElementById('signupModal');if(m)m.classList.remove('hidden');
}
function closeSignupModal(){var m=document.getElementById('signupModal');if(m)m.classList.add('hidden');}
// 登录成功后自动执行刚才的首页操作
function runPendingHome(){var a=window._pendingHome;window._pendingHome=null;if(a==='betting')goBetting();else if(a==='signup')openSignupModal();}

// 报名视图（客户端首页报名子页）
function renderSignupView(){
  var panel=document.getElementById('signupPanel');if(!panel)return;
  var zone=selectedZone;
  var info=getZoneSignupInfo(zone);
  var emojiMap={'疾速冰球厅':'🏒','雷霆击剑厅':'⚔️','烈焰拳王厅':'🔥'};
  var emoji=emojiMap[zone]||'🏟️';
  var q=signupQueues[zone]||[];
  var signedUp=mySignup&&mySignup.zone===zone;
  var pos=signedUp?getMyQueuePos(zone):0;
  var h='<div class="signup-panel-card">';
  h+='<div class="sp-head"><div class="sp-zone">'+emoji+' '+zone+'</div><div class="sp-game">'+info.game+'</div></div>';
  h+='<div class="sp-stats"><div class="sp-stat"><div class="sp-val">'+info.fee+' 💰</div><div class="sp-lbl">报名费</div></div><div class="sp-stat"><div class="sp-val">'+info.queueCount+'</div><div class="sp-lbl">排队人数</div></div>';
  if(signedUp)h+='<div class="sp-stat"><div class="sp-val" style="color:#fbbf24;">'+pos+'/'+info.queueCount+'</div><div class="sp-lbl">我的排名</div></div>';
  h+='</div>';
  if(signedUp)h+='<button class="signup-bar-btn done" style="width:100%;" onclick="toggleSignup()">取消报名</button>';
  else h+='<button class="signup-bar-btn" style="width:100%;" onclick="toggleSignup()">✋ 一键报名</button>';
  h+='</div>';
  h+='<div class="section-title" style="margin-top:14px;">📋 当前排队（'+q.length+'人）</div>';
  if(q.length>0){
    h+='<div class="sp-queue">';
    q.forEach(function(p,idx){
      var sb=p.side==='red'?'🔴':(p.side==='blue'?'🔵':'⚪');
      var me=p.name==='本人'?' sp-q-me':'';
      var nameHtml=(p.name!=='本人'&&playerStats[p.name])?'<span class="player-nick-link" onclick="showPlayerStats(\''+p.name+'\')">'+p.name+'</span>':p.name;
      h+='<div class="sp-q-item'+me+'"><div class="sp-q-pos">'+(idx+1)+'</div><div class="sp-q-name">'+sb+' '+nameHtml+'</div><div class="sp-q-time">'+p.time+'</div></div>';
    });
    h+='</div>';
  }else{h+='<div class="queue-empty" style="text-align:center;padding:16px;color:var(--muted);font-size:0.8em;">暂无排队选手</div>';}
  panel.innerHTML=h;
}

function toggleSignup(){
  if(!isLoggedIn){toastMsg('请先登录后再报名');showLogin();return}
  if(mySignup&&mySignup.zone===selectedZone){
    cancelSignup();
  }else{
    var info=signupInfo[selectedZone];
    if(!info){toastMsg('当前大厅暂无可报名场次');return}
    var fee=info.fee||0;
    if(fee>0&&myGameCoin<fee){toastMsg('游戏币余额不足，报名需 '+fee+' 💰');return}
    if(fee>0&&typeof showConfirm==='function'){
      showConfirm('报名「'+info.game+'」需支付报名费 '+fee+' 💰（当前余额 '+myGameCoin.toLocaleString()+' 💰），确认报名？',doSignup);
    }else{
      doSignup();
    }
  }
}

function doSignup(){
  var zone=selectedZone;
  var info=signupInfo[zone];
  if(!info){toastMsg('当前大厅暂无可报名场次');return}
  var fee=info.fee||0;
  if(myGameCoin<fee){toastMsg('游戏币余额不足，报名需 '+fee+' 💰');return}
  if(!signupQueues[zone])signupQueues[zone]=[];
  var q=signupQueues[zone];
  var exists=q.some(function(p){return p.name==='本人'});
  if(!exists)q.push({name:'本人',time:signupNowTime(),side:null});
  if(fee>0){myGameCoin-=fee;updateMyCoinDisplay();}
  mySignup={game:info.game,zone:zone,fee:fee};
  updateSignupBar();renderSignupView();
  if(typeof refreshQueueViews==='function')refreshQueueViews();
  toastMsg(fee>0?('✅ 报名成功，已扣除报名费 '+fee+' 💰'):'✅ 报名成功，等待管理员安排上场');
}

function confirmCancelSignup(){
  if(!mySignup)return;
  var fee=mySignup.fee||0;
  var msg='取消报名将退还报名费 '+fee+' 💰，确认取消？';
  if(typeof showConfirm==='function')showConfirm(msg,cancelSignup);else cancelSignup();
}

function cancelSignup(){
  if(!mySignup)return;
  var zone=mySignup.zone;
  var fee=mySignup.fee||0;
  var q=signupQueues[zone];
  if(q){for(var i=0;i<q.length;i++){if(q[i].name==='本人'){q.splice(i,1);break;}}}
  var game=mySignup.game;
  if(fee>0){myGameCoin+=fee;updateMyCoinDisplay();}
  mySignup=null;
  updateSignupBar();renderSignupView();
  if(typeof refreshQueueViews==='function')refreshQueueViews();
  toastMsg(fee>0?('已取消「'+game+'」报名，退还 '+fee+' 💰'):('已取消「'+game+'」报名'));
}

// ========== 竞猜 ==========
function initMatchState(){matchState={};matchData.forEach(function(m){if(m.phase=='betting'){matchState[m.id]={side:null,amt:0,isCustom:false,placed:false}}})}

function onZoneChange(el){selectedZone=(el&&el.value)?el.value:document.getElementById('zoneSelect').value;syncStoreChrome();updateBannerAd();renderBettingMatches();updateSignupBar();renderSignupView()}

function updateBetButton(mid){
  var st=matchState[mid];if(!st)return;
  var btn=document.getElementById('betBtn-'+mid);
  if(!btn)return;
  if(st.side&&st.amt>0){btn.disabled=false;btn.style.background='#7c3aed';btn.style.color='#fff';btn.style.border='none'}
  else{btn.disabled=true;btn.style.background='rgba(255,255,255,0.06)';btn.style.color='#999';btn.style.border='1px solid var(--border)'}
}

function renderBettingMatches(){
  var container=document.getElementById('bettingMatchesList');if(!container)return;
  var filtered=matchData.filter(function(m){if(m.phase!=='betting')return false;if(selectedZone!==m.zone)return false;return true});
  if(filtered.length===0){container.innerHTML='<div style=\"text-align:center;padding:40px 0;color:var(--muted);font-size:0.85em;\">📭 当前区域暂无竞猜中的比赛</div>';return}
  var html='';
  filtered.forEach(function(m){
    var st=matchState[m.id]||{side:null,amt:0,isCustom:false,placed:false};
    html+='<div class=\"match-card\" data-match=\"'+m.id+'\"><div class=\"match-header\"><span class=\"match-label\">⚡ 当前场次</span><span class=\"countdown cd-bet\">🟡 竞猜中</span></div><div class=\"match-game\">'+m.game+'</div><div class=\"match-meta\">🕐 <span>'+m.time+'</span> &nbsp;·&nbsp; 📷 <span>'+m.zone+'</span></div><div class=\"vs-row\">';
    html+='<div class=\"player-box red\" onclick=\"selectBet(this,\'red\',\''+m.id+'\')\"><div class=\"player-avatar red-av\">🔴</div><div class=\"player-nick player-nick-link\" onclick=\"event.stopPropagation();showPlayerStats(\''+m.red+'\')\">'+m.red+'</div><div class=\"odds-tag odds-red\">赔率 '+m.redOdds.toFixed(2)+'</div></div><div class=\"vs-divider\">VS</div>';
    html+='<div class=\"player-box blue\" onclick=\"selectBet(this,\'blue\',\''+m.id+'\')\"><div class=\"player-avatar blue-av\">🔵</div><div class=\"player-nick player-nick-link\" onclick=\"event.stopPropagation();showPlayerStats(\''+m.blue+'\')\">'+m.blue+'</div><div class=\"odds-tag odds-blue\">赔率 '+m.blueOdds.toFixed(2)+'</div></div></div>';
    if(st.placed){
      var pOdds=st.side==='red'?m.redOdds:m.blueOdds;
      var pWho=st.side==='red'?('🔴 '+m.red):('🔵 '+m.blue);
      var pTotal=Math.floor(st.amt*pOdds);
      html+='<div class=\"bet-placed\"><div class=\"bet-placed-row\">✅ 已下注 '+pWho+'</div>';
      html+='<div class=\"bet-placed-amt\">下注 '+st.amt+' 💰 · 赔率 '+pOdds.toFixed(2)+'x</div>';
      html+='<div class=\"bet-placed-profit\">预期收益：'+pTotal+' 💰</div>';
      html+='<button class=\"btn bet-cancel-btn\" onclick=\"cancelBet(\''+m.id+'\')\">取消下注</button></div></div>';
      return;
    }
    html+='<div class=\"bet-section\"><label>💰 下注（游戏币）<span style=\"font-size:0.78em;color:var(--muted);\"> · 单次上限 '+MAX_BET+'</span></label>';
    html+='<div class=\"bet-chips\" id=\"chips-'+m.id+'\"><span class=\"bet-chip\" onclick=\"setChipBet(\''+m.id+'\',10)\">10</span><span class=\"bet-chip\" onclick=\"setChipBet(\''+m.id+'\',50)\">50</span><span class=\"bet-chip\" onclick=\"setChipBet(\''+m.id+'\',100)\">100</span><span class=\"bet-chip\" onclick=\"setChipBet(\''+m.id+'\','+MAX_BET+')\">'+MAX_BET+'</span><span class=\"bet-chip\" onclick=\"useCustom(\''+m.id+'\')\">自定义</span></div>';
    html+='<div id=\"customArea-'+m.id+'\" class=\"hidden\"><input class=\"bet-input\" id=\"customInput-'+m.id+'\" type=\"number\" placeholder=\"手动输入金额（10~'+MAX_BET+'）\" min=\"10\" max=\"'+MAX_BET+'\" step=\"1\" oninput=\"onCustomInput(\''+m.id+'\')\"><div class=\"bet-hint\" id=\"hint-'+m.id+'\"></div></div>';
    html+='<button class=\"btn\" style=\"margin-top:8px;width:100%;background:rgba(255,255,255,0.06);color:#999;border:1px solid var(--border);\" id=\"betBtn-'+m.id+'\" disabled onclick=\"placeBet(\''+m.id+'\')\">🎉 确认下注</button></div></div>';
  });
  container.innerHTML=html;
  Object.keys(matchState).forEach(function(mid){var st=matchState[mid];if(st.placed)return;if(st.side){var card=document.querySelector('[data-match=\"'+mid+'\"]');if(card){var box=card.querySelector('.player-box.'+st.side);if(box)box.classList.add('selected')}}if(st.amt>0&&!st.isCustom){var chips=document.querySelectorAll('#chips-'+mid+' .bet-chip');chips.forEach(function(c){if(parseInt(c.textContent)===st.amt)c.classList.add('active')})}if(st.isCustom){var customChip=document.querySelector('#chips-'+mid+' .bet-chip:last-child');if(customChip)customChip.classList.add('active');document.getElementById('customArea-'+mid).classList.remove('hidden');if(st.amt>0)document.getElementById('customInput-'+mid).value=st.amt}updateBetButton(mid)});
}

function selectBet(el,side,mid){if(!matchState[mid])matchState[mid]={side:null,amt:0,isCustom:false};if(el.classList.contains('selected')){el.classList.remove('selected');matchState[mid].side=null}else{el.closest('.match-card').querySelectorAll('.player-box').forEach(function(b){b.classList.remove('selected')});el.classList.add('selected');matchState[mid].side=side}updateBetButton(mid)}
function setChipBet(mid,amt){if(!matchState[mid])matchState[mid]={side:null,amt:0,isCustom:false};var s=matchState[mid];if(event.target.classList.contains('active')&&s.amt===amt&&!s.isCustom){event.target.classList.remove('active');s.amt=0;updateBetButton(mid);return}s.amt=amt;s.isCustom=false;document.querySelectorAll('#chips-'+mid+' .bet-chip').forEach(function(c){c.classList.remove('active')});event.target.classList.add('active');document.getElementById('customArea-'+mid).classList.add('hidden');document.getElementById('customInput-'+mid).value='';document.getElementById('hint-'+mid).textContent='';updateBetButton(mid)}
function useCustom(mid){if(!matchState[mid])matchState[mid]={side:null,amt:0,isCustom:false};var s=matchState[mid];if(s.isCustom&&event.target.classList.contains('active')){event.target.classList.remove('active');s.isCustom=false;s.amt=0;document.getElementById('customArea-'+mid).classList.add('hidden');document.getElementById('customInput-'+mid).value='';document.getElementById('hint-'+mid).textContent='';updateBetButton(mid);return}s.amt=0;s.isCustom=true;document.querySelectorAll('#chips-'+mid+' .bet-chip').forEach(function(c){c.classList.remove('active')});event.target.classList.add('active');document.getElementById('customArea-'+mid).classList.remove('hidden');document.getElementById('customInput-'+mid).focus();updateBetButton(mid)}
function onCustomInput(mid){var inp=document.getElementById('customInput-'+mid),hint=document.getElementById('hint-'+mid);var v=parseFloat(inp.value);if(inp.value&&!Number.isInteger(v))inp.value=Math.floor(v)||'';var iv=parseInt(inp.value)||0;if(iv>MAX_BET){inp.value=MAX_BET;iv=MAX_BET;hint.textContent='单次最高下注 '+MAX_BET+' 游戏币，已自动调整'}else if(iv<10&&inp.value){hint.textContent='最低下注 10 游戏币'}else{hint.textContent=''}if(!matchState[mid])matchState[mid]={side:null,amt:0,isCustom:false};if(iv>=10)matchState[mid].amt=iv;else matchState[mid].amt=0;updateBetButton(mid)}
function placeBet(mid){if(!isLoggedIn){window._pendingBet=mid;showLogin();return}doPlaceBet(mid)}
function doPlaceBet(mid){var m=matchData.find(function(x){return x.id===mid});if(!m)return toastMsg('比赛数据异常');if(!matchState[mid])matchState[mid]={side:null,amt:0,isCustom:false};var s=matchState[mid];if(!s.side)return toastMsg('请先选择一方选手');if(s.isCustom){var v=parseInt(document.getElementById('customInput-'+mid).value)||0;if(v<10)return toastMsg('最低下注 10 游戏币');if(v>MAX_BET)return toastMsg('单次最高下注 '+MAX_BET+' 游戏币');s.amt=v}if(!s.amt)return toastMsg('请选择或输入下注金额');if(s.amt>MAX_BET)return toastMsg('单次最高下注 '+MAX_BET+' 游戏币');if(!myBets[mid])myBets[mid]={red:0,blue:0};myBets[mid][s.side]+=s.amt;s.placed=true;renderBettingMatches();toastMsg('✅ 下注成功')}
function cancelBet(mid){matchState[mid]={side:null,amt:0,isCustom:false,placed:false};if(myBets[mid])myBets[mid]={red:0,blue:0};renderBettingMatches();toastMsg('已取消下注')}

// ========== 兑换记录 ==========
var exchangeRecords=[
  {time:'2025-01-15 21:30', item:'🍸 特调鸡尾酒', store:'兰陵酒吧', cost:80},
  {time:'2025-01-14 19:00', item:'🥃 威士忌 Shot', store:'兰陵酒吧', cost:50},
  {time:'2025-01-13 22:15', item:'🍷 红酒一杯', store:'啤酒公社', cost:60}
];
function renderExchangeHistory(){
  var c=document.getElementById('exchangeHistoryList');if(!c)return;
  if(!exchangeRecords.length){c.innerHTML='<div style=\"text-align:center;padding:40px 0;color:var(--muted);font-size:0.85em;\">📭 暂无兑换记录</div>';return}
  var html='';
  exchangeRecords.forEach(function(r){
    html+='<div class=\"exh-item\"><div class=\"exh-top\"><span class=\"exh-name\">'+r.item+'</span><span class=\"exh-cost\">-'+r.cost+' 💎</span></div><div class=\"exh-sub\">🕐 '+r.time+' &nbsp;·&nbsp; 📍 '+r.store+'</div></div>';
  });
  c.innerHTML=html;
}

// ========== 初始化 ==========
initMatchState();renderBettingMatches();updateSignupBar();renderSignupView();updateBannerAd();updateMyCoinDisplay();renderBetHistory();
document.addEventListener('click',function(e){if(e.target.closest&&(e.target.closest('.store-switch')||e.target.closest('.store-menu')))return;var menus=document.querySelectorAll('.store-menu');for(var i=0;i<menus.length;i++)menus[i].classList.add('hidden');});
