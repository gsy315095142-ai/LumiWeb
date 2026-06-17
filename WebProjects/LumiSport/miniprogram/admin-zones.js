/**
 * LumiSport 管理员端 - 场次管理与步骤操作
 * 按厅切换查看，顶部展示场次流程，内联步骤操作
 */
var matches = [
  { id:'m1', game:'⚔️ 雷霆击剑', time:'21:45', zone:'雷霆击剑厅', phase:'betting', guessing_open:true,  round:'第3局', customName:'雷霆对决', isMaster:false, entryFee:200, red:'战神阿飞', blue:'疾风小刀', redOdds:1.80, blueOdds:2.00, players:[{name:'战神阿飞',time:'21:25:00',side:'red'},{name:'疾风小刀',time:'21:26:05',side:'blue'},{name:'小明',time:'21:15:32',side:'red'},{name:'阿强',time:'21:16:05',side:'blue'},{name:'大飞',time:'21:17:41',side:'red'}], redBet:'4,520', blueBet:'4,040', redBettors:12, blueBettors:9, winner:null, score:'', exCoin:'0', totalBet:'8,560', winnerReward:'0' },
  { id:'m2', game:'🔥 烈焰拳王', time:'22:15', zone:'烈焰拳王厅', phase:'waiting', guessing_open:false, configDone:false, round:'第1局', customName:'火焰对决', isMaster:false, entryFee:200, red:null, blue:null, redOdds:1.50, blueOdds:2.00, players:[], redBet:'0', blueBet:'0', redBettors:0, blueBettors:0, winner:null, score:'', exCoin:'0', totalBet:'0', winnerReward:'0' },
  { id:'m3', game:'🏒 疾速冰球', time:'21:30', zone:'疾速冰球厅', phase:'started', guessing_open:false, round:'第2局', customName:'冰上争锋', isMaster:true, entryFee:200, red:'荒野狼王', blue:'雷霆少年', redOdds:1.65, blueOdds:2.10, players:[{name:'荒野狼王',time:'21:10:00',side:'red'},{name:'雷霆少年',time:'21:11:05',side:'blue'}], redBet:'6,800', blueBet:'5,500', redBettors:18, blueBettors:14, winner:null, score:'', exCoin:'0', totalBet:'12,300', winnerReward:'0' },
  { id:'m4', game:'⚔️ 雷霆击剑', time:'21:00', zone:'雷霆击剑厅', phase:'settled', guessing_open:false, round:'第2局', customName:'剑影交错', isMaster:false, entryFee:200, red:'龙之影', blue:'鹰眼猎手', redOdds:1.70, blueOdds:1.95, players:[{name:'龙之影',time:'20:40:00',side:'red'},{name:'鹰眼猎手',time:'20:41:00',side:'blue'}], redBet:'4,820', blueBet:'4,300', redBettors:15, blueBettors:10, winner:'red', score:'3:2', exCoin:'4,820', totalBet:'9,120', winnerReward:'8,194' }
];

var adminMatchZone = '疾速冰球厅';
var flowSteps = [
  { key:'setup', label:'玩法配置' },
  { key:'waiting', label:'等待报名' },
  { key:'betting', label:'报名中' },
  { key:'guessing', label:'预测中' },
  { key:'started', label:'比赛中' },
  { key:'settled', label:'已结算' }
];

function escName(n){return n.replace(/'/g,"\\'")}
function getMatch(mid){return matches.find(function(x){return x.id===mid})}
function getZoneMatch(z){
  var zm=matches.filter(function(m){return m.zone===z&&m.phase!=='settled'}).sort(function(a,b){return a.time>b.time?1:-1})[0];
  if(!zm)zm=matches.filter(function(m){return m.zone===z}).sort(function(a,b){return a.time<b.time?1:-1})[0];
  return zm;
}
function bothPlayersReady(m){return !!(m&&m.red&&m.blue)}
function getFlowIndex(m){
  if(!m)return 0;
  if(m.phase==='waiting')return m.configDone?1:0;
  if(m.phase==='betting'){
    if(!bothPlayersReady(m)||!m.guessing_open)return 2;
    return 3;
  }
  if(m.phase==='started')return 4;
  if(m.phase==='settled')return 5;
  return 0;
}
function getFlowPhaseHint(m){
  if(!m)return '当前：该厅暂无场次，请先配置玩法并创建首局';
  if(m.phase==='waiting'){
    if(!m.configDone)return '当前：填写玩法并在下方点「完成配置」，创建首局';
    return '当前：等待开放报名（玩法与场次名已锁定）；可点「开始报名」';
  }
  if(m.phase==='betting'){
    if(!bothPlayersReady(m))return '当前：选手报名与审核；双方就位后可「开启观众竞猜」';
    if(!m.guessing_open)return '当前：双方选手已定，请在下方点「开启观众竞猜」；开启后观众方可投选';
    return '当前：预测进行中；可「开始比赛」开赛';
  }
  if(m.phase==='started')return '当前：比赛进行中，等待设备自动判定';
  if(m.phase==='settled')return '当前：本场已结算，可开启下一局';
  return '当前：加载中';
}
function getStep(m){
  if(m.phase==='waiting')return m.configDone?2:1;
  if(m.phase==='betting'&&!m.guessing_open)return 3;
  if(m.phase==='betting'&&m.guessing_open)return 4;
  if(m.phase==='started')return 5;
  if(m.phase==='settled')return 6;
  return 1;
}

function buildFlowProgressHtml(m){
  var cur=getFlowIndex(m), hint=getFlowPhaseHint(m);
  var h='<div class="flow-wrap"><div class="flow-head"><div class="flow-title">场次流程</div><div class="flow-phase">'+hint+'</div></div><div class="flow-steps">';
  for(var i=0;i<flowSteps.length;i++){
    var done=i<cur, current=i===cur;
    var circleCls=done?'circle-done':(current?'circle-current':'circle-todo');
    var leftCls=i===0?'line-hidden':(cur>=i?'line-active':'line-todo');
    var rightCls=i===flowSteps.length-1?'line-hidden':(cur>i?'line-active':'line-todo');
    h+='<div class="flow-col"><div class="flow-node-row">';
    h+='<div class="flow-line flow-line-left '+leftCls+'"></div>';
    h+='<div class="flow-circle-wrap"><div class="flow-circle '+circleCls+'">'+(done?'<span class="flow-check">✓</span>':'<span class="flow-num">'+(i+1)+'</span>')+'</div></div>';
    h+='<div class="flow-line flow-line-right '+rightCls+'"></div></div>';
    h+='<div class="flow-label'+(current?' flow-label-on':'')+'">'+flowSteps[i].label+'</div></div>';
  }
  h+='</div></div>';
  return h;
}

function buildStepHtml(mid){
  var m=getMatch(mid);if(!m)return '';
  var step=getStep(m), midEsc=escName(mid);
  var h='<div class="zone-step-panel">';
  h+='<div class="zone-step-title">流程操作</div>';
  if(step===1){
    h+='<div class="readonly-row"><span class="form-label">🔄 局数</span><span class="readonly-val">'+m.round+'</span></div>';
    h+='<div class="readonly-row" style="margin-top:8px;"><span class="form-label">🎮 项目</span><span class="readonly-val">'+m.game+'</span></div>';
    h+='<div class="readonly-row" style="margin-top:8px;"><span class="form-label">💰 报名费</span><span class="readonly-val">'+m.entryFee+' 💰/次</span></div>';
    h+='<div class="form-label" style="margin-top:10px;">✏️ 场次名称</div><input class="input" id="editCName-'+mid+'" value="'+m.customName+'">';
    if(m.game.indexOf('疾速冰球')!==-1){h+='<div style="margin-top:8px;"><label class="form-label">⚡ 模式</label><button class="btn btn-sm '+(m.isMaster?'btn-purple':'btn-outline')+'" style="width:auto;" onclick="toggleMaster(\''+midEsc+'\')">'+(m.isMaster?'大师模式':'普通模式')+'</button></div>'}
    h+='<div class="divider"></div><button class="btn btn-purple btn-block" onclick="stepCompleteConfig(\''+midEsc+'\')">✅ 完成配置</button>';
  }else if(step===2){
    h+='<div class="readonly-row"><span class="form-label">🔄 局数</span><span class="readonly-val">'+m.round+'</span></div>';
    h+='<div class="readonly-row" style="margin-top:8px;"><span class="form-label">🎮 项目</span><span class="readonly-val">'+m.game+'</span></div>';
    h+='<div class="readonly-row" style="margin-top:8px;"><span class="form-label">✏️ 场次名称</span><span class="readonly-val">'+m.customName+'</span></div>';
    h+='<div class="readonly-row" style="margin-top:8px;"><span class="form-label">💰 报名费</span><span class="readonly-val">'+m.entryFee+' 💰/次</span></div>';
    h+='<div class="divider"></div><p style="color:var(--muted);font-size:0.75em;text-align:center;margin-bottom:10px;">玩法已锁定，开放报名后选手可加入队列</p>';
    h+='<button class="btn btn-purple btn-block" onclick="stepOpenBetting(\''+midEsc+'\')">📋 开始报名</button>';
  }else if(step===3){
    var sq=(typeof signupQueues!=='undefined'&&signupQueues[m.zone])?signupQueues[m.zone]:[];
    var ezs=escName(m.zone);
    h+='<div style="color:var(--muted);font-size:0.75em;margin-bottom:6px;">报名队列（'+sq.length+'人，赛后不清空）</div>';
    if(sq.length>0){
      sq.forEach(function(p,idx){var sb=p.side==='red'?' 🔴':(p.side==='blue'?' 🔵':'');var en=escName(p.name);var iR=m.red===p.name,iB=m.blue===p.name;
        h+='<div class="reg-player">';
        h+='<div class="queue-arrows"><button class="q-arrow" onclick="moveQueue(\''+ezs+'\','+idx+',-1)" '+(idx===0?'disabled':'')+'>▲</button><button class="q-arrow" onclick="moveQueue(\''+ezs+'\','+idx+',1)" '+(idx===sq.length-1?'disabled':'')+'>▼</button></div>';
        h+='<div class="info"><div class="name">'+idx+'. 👤 '+p.name+sb+'</div><div class="time">'+p.time+'</div></div>';
        h+='<div class="actions">';
        h+='<button class="btn btn-sm side-btn side-red'+(iR?' active':'')+'" onclick="'+(iR?'stepRemovePick(\''+midEsc+'\',\'red\')':'stepAssign(\''+midEsc+'\',\'red\',\''+en+'\')')+'">'+(iR?'取消🔴':'🔴')+'</button>';
        h+='<button class="btn btn-sm side-btn side-blue'+(iB?' active':'')+'" onclick="'+(iB?'stepRemovePick(\''+midEsc+'\',\'blue\')':'stepAssign(\''+midEsc+'\',\'blue\',\''+en+'\')')+'">'+(iB?'取消🔵':'🔵')+'</button>';
        h+='</div></div>';
      });
    }else{h+='<div style="text-align:center;padding:10px;color:var(--muted);font-size:0.75em;">暂无选手报名</div>'}
    h+='<div class="divider"></div><div class="vs-preview" style="margin-bottom:8px;"><span class="vs-tag red">🔴 '+(m.red||'待定')+'</span><span style="color:var(--muted);">VS</span><span class="vs-tag blue">🔵 '+(m.blue||'待定')+'</span></div>';
    if(m.red&&m.blue){h+='<div class="readonly-row"><span class="form-label">🔴 红方赔率</span><span class="readonly-val">'+m.redOdds.toFixed(2)+'</span></div>';h+='<div class="readonly-row" style="margin-top:8px;"><span class="form-label">🔵 蓝方赔率</span><span class="readonly-val">'+m.blueOdds.toFixed(2)+'</span></div>'}
    if(m.red&&m.blue){h+='<div class="divider"></div><div style="text-align:center;margin-bottom:8px;"><button class="btn btn-outline btn-sm" style="width:auto;" onclick="stepSwapPlayers(\''+midEsc+'\')">🔄 互换红蓝站位</button></div>'}
    if(m.red&&m.blue){h+='<button class="btn btn-purple btn-block" onclick="stepOpenGuessing(\''+midEsc+'\')">📊 开启观众竞猜</button>'}else{h+='<button class="btn btn-outline btn-block" disabled style="opacity:0.4;cursor:not-allowed;">📊 开启观众竞猜（需选定双方选手）</button>'}
  }else if(step===4){
    h+='<div class="settle-stats"><div class="settle-stat"><div class="s-val" style="color:#f87171;">'+m.redBet+'</div><div class="s-lbl">🔴 投注额 · '+m.redBettors+'人支持</div></div><div class="settle-stat"><div class="s-val" style="color:#60a5fa;">'+m.blueBet+'</div><div class="s-lbl">🔵 投注额 · '+m.blueBettors+'人支持</div></div></div>';
    h+='<div class="divider"></div><div style="text-align:center;color:var(--muted);font-size:0.78em;">🔴 '+m.red+' vs 🔵 '+m.blue+'</div><div class="divider"></div><button class="btn btn-red btn-block" onclick="stepStartMatch(\''+midEsc+'\')">🔴 开始比赛</button>';
  }else if(step===5){
    h+='<div style="text-align:center;padding:16px 0;"><div style="font-size:2em;margin-bottom:8px;">⚔️</div><div class="vs-preview"><span class="vs-tag red">🔴 '+m.red+'</span><span style="color:var(--muted);">VS</span><span class="vs-tag blue">🔵 '+m.blue+'</span></div></div>';
    h+='<div class="settle-stats"><div class="settle-stat"><div class="s-val">'+m.redOdds.toFixed(2)+'</div><div class="s-lbl">🔴 赔率</div></div><div class="settle-stat"><div class="s-val">'+m.blueOdds.toFixed(2)+'</div><div class="s-lbl">🔵 赔率</div></div></div>';
    h+='<div class="divider"></div><p style="color:var(--bad);text-align:center;font-size:0.78em;">🔴 比赛进行中，等待设备自动判定...</p>';
    h+='<div class="divider"></div><p style="color:var(--muted);text-align:center;font-size:0.68em;">胜负由现场设备自动发送，无需手动操作</p>';
    h+='<button class="btn btn-outline btn-sm btn-block" style="margin-top:8px;color:var(--muted);" onclick="simulateDeviceSettle(\''+midEsc+'\')">⚡ 模拟设备结算（演示用）</button>';
  }else if(step===6){
    h+='<div style="text-align:center;padding:8px 0;"><div style="font-size:2em;">🏆</div><div style="color:var(--good);font-weight:700;font-size:1em;">'+(m.winner==='red'?m.red:m.blue)+' 获胜</div><div style="color:var(--muted);font-size:0.8em;">比分: '+m.score+'</div></div><div class="divider"></div>';
    h+='<div class="settle-stats"><div class="settle-stat"><div class="s-val" style="color:#c4b5fd;">'+m.exCoin+'</div><div class="s-lbl">💎 兑换币产出</div></div><div class="settle-stat"><div class="s-val" style="color:#fbbf24;">'+m.winnerReward+'</div><div class="s-lbl">💰 胜方获得</div></div><div class="settle-stat"><div class="s-val">'+m.totalBet+'</div><div class="s-lbl">💰 总投入</div></div></div>';
    h+='<div class="divider"></div><button class="btn btn-purple btn-block" onclick="stepNextRound(\''+midEsc+'\')">🔄 下一局</button>';
  }
  if(step!==1&&step!==5&&step!==6){
    h+='<button class="btn btn-outline btn-sm btn-block" style="margin-top:10px;color:var(--bad);" onclick="stepCancel(\''+midEsc+'\')">取消比赛</button>';
  }
  h+='</div>';
  return h;
}

function onAdminZoneChange(el){
  adminMatchZone=el?el.value:adminMatchZone;
  renderZones();
}

function renderZones(){
  var zones=['疾速冰球厅','雷霆击剑厅','烈焰拳王厅'];
  var emojiMap={'雷霆击剑厅':'⚔️','烈焰拳王厅':'🔥','疾速冰球厅':'🏒'};
  var z=adminMatchZone;
  var zm=getZoneMatch(z);
  var h='<div class="admin-match-head"><div class="section-title">📷 场次管理</div>';
  h+='<div class="admin-zone-row"><select class="zone-select zone-select-big" id="adminZoneSelect" onchange="onAdminZoneChange(this)">';
  zones.forEach(function(zz){h+='<option value="'+zz+'"'+(zz===z?' selected':'')+'>'+emojiMap[zz]+' '+zz+'</option>';});
  h+='</select></div></div>';
  h+=buildFlowProgressHtml(zm);
  var pt='',pc='',pp='',game='';
  if(zm){game=zm.game+' · 🕐 '+zm.time+' · '+zm.round;
    if(zm.phase==='waiting'){pc='tag-wait';pt=zm.configDone?'⏳ 等待报名':'⚪ 玩法配置';pp='🔴 '+(zm.red||'待定')+'  VS  🔵 '+(zm.blue||'待定')}
    else if(zm.phase==='betting'&&!zm.guessing_open){pc='tag-wait';pt='⚪ 报名中';pp='🔴 '+(zm.red||'待定')+'  VS  🔵 '+(zm.blue||'待定')}
    else if(zm.phase==='betting'&&zm.guessing_open){pc='tag-bet';pt='🟡 竞猜中';pp='🔴 '+zm.red+'  VS  🔵 '+zm.blue}
    else if(zm.phase==='started'){pc='tag-live';pt='🔴 比赛中';pp='🔴 '+zm.red+'  VS  🔵 '+zm.blue}
    else{pc='tag-done';pt='🟢 已结束';pp='🏆 胜方: '+(zm.winner==='red'?zm.red:zm.blue)}
  }else{pc='tag-wait';pt='⚪ 空闲';pp='暂无比赛'}
  h+='<div class="zone-box">';
  h+='<div class="zone-box-hd">📷 '+(emojiMap[z]||'')+' '+z+' <span class="tag '+pc+'">'+pt+'</span></div>';
  h+='<div class="zone-box-body">';
  h+='<div class="zone-box-game">'+(game||'—')+'</div>';
  h+='<div class="zone-box-vs">'+pp+'</div>';
  if(zm){h+=buildStepHtml(zm.id)}else{h+='<div class="queue-empty" style="margin-top:8px;">该厅暂无比赛</div>'}
  h+='</div></div>';
  var el=document.getElementById('zonesList');if(el)el.innerHTML=h;
}

function refreshQueueViews(){renderZones()}

function moveQueue(zone,idx,dir){
  var q=signupQueues[zone];if(!q)return;
  var newIdx=idx+dir;if(newIdx<0||newIdx>=q.length)return;
  var tmp=q[idx];q[idx]=q[newIdx];q[newIdx]=tmp;
  refreshQueueViews();
}
function moveQueueEnd(zone,idx){
  var q=signupQueues[zone];if(!q)return;
  if(idx<0||idx>=q.length-1)return;
  var p=q.splice(idx,1)[0];q.push(p);
  refreshQueueViews();
}
function moveQueueTop(zone,idx){
  var q=signupQueues[zone];if(!q)return;
  if(idx<=0||idx>=q.length)return;
  var p=q.splice(idx,1)[0];q.unshift(p);
  refreshQueueViews();
}
function kickQueue(zone,idx){
  var q=signupQueues[zone];if(!q)return;
  var p=q[idx];if(!p)return;
  showConfirm('确定将 '+p.name+' 踢出报名队列吗？',function(){
    q.splice(idx,1);
    matches.forEach(function(m){if(m.zone===zone){if(m.red===p.name)m.red=null;if(m.blue===p.name)m.blue=null;}});
    if(p.name==='本人'&&mySignup&&mySignup.zone===zone){if(typeof myGameCoin!=='undefined'){myGameCoin+=(mySignup.fee||0);if(typeof updateMyCoinDisplay==='function')updateMyCoinDisplay();}mySignup=null;if(typeof updateSignupBar==='function')updateSignupBar();}
    refreshQueueViews();
    toastMsg('已踢出 '+p.name);
  });
}

function stepCompleteConfig(mid){var m=getMatch(mid);if(!m)return;var el=document.getElementById('editCName-'+mid);m.customName=el?el.value:m.customName;m.configDone=true;toastMsg('玩法配置已完成');renderZones()}
function stepOpenBetting(mid){var m=getMatch(mid);if(!m)return;m.phase='betting';m.guessing_open=false;toastMsg('📋 报名已开启');renderZones()}
function syncQueueSide(zone,name,side){var q=(typeof signupQueues!=='undefined')?signupQueues[zone]:null;if(!q)return;q.forEach(function(p){if(p.side===side)p.side=null;});if(name){var hit=q.find(function(p){return p.name===name});if(hit)hit.side=side;}}
function stepAssign(mid,side,name){var m=getMatch(mid);if(!m)return;if(side==='red')m.red=name;else m.blue=name;syncQueueSide(m.zone,name,side);renderZones()}
function stepRemovePick(mid,side){var m=getMatch(mid);if(!m)return;if(side==='red')m.red=null;else m.blue=null;syncQueueSide(m.zone,null,side);renderZones()}
function simulateDeviceSettle(mid){var m=getMatch(mid);if(!m)return;var winner=Math.random()>0.5?'red':'blue';m.phase='settled';m.winner=winner;m.score=(winner==='red'?'3':Math.floor(Math.random()*3))+':'+(winner==='blue'?'3':Math.floor(Math.random()*3));m.exCoin=(winner==='red'?m.redBet:m.blueBet);m.winnerReward=String(Math.floor(parseInt(m.totalBet.replace(/,/g,''))*(winner==='red'?m.redOdds:m.blueOdds)));renderZones();toastMsg('📡 设备判定: '+(winner==='red'?m.red:m.blue)+' 获胜')}
function stepSwapPlayers(mid){var m=getMatch(mid);if(!m)return;var tmp=m.red;m.red=m.blue;m.blue=tmp;tmp=m.redOdds;m.redOdds=m.blueOdds;m.blueOdds=tmp;renderZones()}
function stepOpenGuessing(mid){var m=getMatch(mid);if(!m)return;if(!m.red||!m.blue)return toastMsg('请先选定红蓝双方选手');m.guessing_open=true;m.redBet='520';m.blueBet='430';m.redBettors=3;m.blueBettors=2;m.totalBet='950';toastMsg('📊 观众竞猜已开启');renderZones()}
function stepStartMatch(mid){var m=getMatch(mid);if(!m)return;m.phase='started';m.guessing_open=false;toastMsg('🔴 比赛开始');renderZones()}
function stepNextRound(mid){var m=getMatch(mid);if(!m)return;var nr='第'+(parseInt(m.round.replace('第','').replace('局',''))+1)+'局';m.phase='waiting';m.guessing_open=false;m.configDone=false;m.round=nr;m.red=null;m.blue=null;m.redBet='0';m.blueBet='0';m.redBettors=0;m.blueBettors=0;m.winner=null;m.score='';m.exCoin='0';m.totalBet='0';m.winnerReward='0';toastMsg('🔄 已进入 '+nr+'（报名队列已保留）');renderZones()}
function stepCancel(mid){var m=getMatch(mid);if(!m)return;showConfirm('确定回到玩法配置吗？当前进度将丢失，但报名队列将保留',function(){m.phase='waiting';m.guessing_open=false;m.configDone=false;m.red=null;m.blue=null;m.redBet='0';m.blueBet='0';m.redBettors=0;m.blueBettors=0;m.winner=null;m.score='';m.exCoin='0';m.totalBet='0';m.winnerReward='0';toastMsg('已回到玩法配置（队列已保留）');renderZones()})}
function toggleMaster(mid){var m=getMatch(mid);if(!m)return;m.isMaster=!m.isMaster;renderZones()}

renderZones();
