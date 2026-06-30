/**
 * LumiSport 管理员端 - 场次管理 + 匹配报名 + 竞猜倒计时 + 一键补位匹配
 */
var matches = [
  { id:'m1', game:'⚔️ 雷霆击剑', time:'21:45', zone:'雷霆击剑厅', phase:'betting', guessing_open:true,  round:'第3局', customName:'雷霆对决', isMaster:false, entryFee:200, red:'战神阿飞', blue:'疾风小刀', redOdds:1.80, blueOdds:2.00, players:[{name:'战神阿飞',time:'21:25:00',side:'red'},{name:'疾风小刀',time:'21:26:05',side:'blue'},{name:'小明',time:'21:15:32',side:'red'},{name:'阿强',time:'21:16:05',side:'blue'},{name:'大飞',time:'21:17:41',side:'red'}], redBet:'4,520', blueBet:'4,040', redBettors:12, blueBettors:9, winner:null, score:'', exCoin:'0', totalBet:'8,560', winnerReward:'0', warmupActive:false },
  { id:'m2', game:'🔥 烈焰拳王', time:'22:15', zone:'烈焰拳王厅', phase:'waiting', guessing_open:false, configDone:false, round:'第1局', customName:'火焰对决', isMaster:false, entryFee:200, red:null, blue:null, redOdds:1.50, blueOdds:2.00, players:[], redBet:'0', blueBet:'0', redBettors:0, blueBettors:0, winner:null, score:'', exCoin:'0', totalBet:'0', winnerReward:'0', warmupActive:false },
  { id:'m3', game:'🏒 疾速冰球', time:'21:30', zone:'疾速冰球厅', phase:'started', guessing_open:false, round:'第2局', customName:'冰上争锋', isMaster:true, entryFee:200, red:'荒野狼王', blue:'雷霆少年', redOdds:1.65, blueOdds:2.10, players:[{name:'荒野狼王',time:'21:10:00',side:'red'},{name:'雷霆少年',time:'21:11:05',side:'blue'}], redBet:'6,800', blueBet:'5,500', redBettors:18, blueBettors:14, winner:null, score:'', exCoin:'0', totalBet:'12,300', winnerReward:'0', warmupActive:false },
  { id:'m4', game:'⚔️ 雷霆击剑', time:'21:00', zone:'雷霆击剑厅', phase:'settled', guessing_open:false, round:'第2局', customName:'剑影交错', isMaster:false, entryFee:200, red:'龙之影', blue:'鹰眼猎手', redOdds:1.70, blueOdds:1.95, players:[{name:'龙之影',time:'20:40:00',side:'red'},{name:'鹰眼猎手',time:'20:41:00',side:'blue'}], redBet:'4,820', blueBet:'4,300', redBettors:15, blueBettors:10, winner:'red', score:'3:2', exCoin:'4,820', totalBet:'9,120', winnerReward:'8,194', warmupActive:false }
];

var adminMatchZone = '疾速冰球厅';
var flowSteps = [
  { key:'setup', label:'玩法配置' },{ key:'waiting', label:'等待报名' },{ key:'betting', label:'报名中' },
  { key:'guessing', label:'预测中' },{ key:'started', label:'比赛中' },{ key:'settled', label:'已结算' }
];

var zoneMatchMode = {};
var matchRedPlayer = null, matchBluePlayer = null, matchStep = 'pickRed', matchLotteryTimer = null;
var zoneTimeLimit = {};
var guessingTimer = null, guessingSecondsLeft = 0, guessingExpired = false;
var expandedPlayerLists = {};

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
  if(m.phase==='betting'){if(!bothPlayersReady(m)||!m.guessing_open)return 2;return 3;}
  if(m.phase==='started')return 4;if(m.phase==='settled')return 5;return 0;
}
function getFlowPhaseHint(m){
  if(!m)return '当前：该厅暂无场次';
  if(m.phase==='waiting'){return m.configDone?'当前：等待开放报名':'当前：填写玩法并完成配置';}
  if(m.phase==='betting'){if(!bothPlayersReady(m))return '当前：选手报名中';if(!m.guessing_open)return '当前：双方已定，可开启预测';return '当前：预测进行中';}
  if(m.phase==='started')return '当前：比赛进行中';if(m.phase==='settled')return '当前：已结算';return '';
}
function getStep(m){
  if(m.phase==='waiting')return m.configDone?2:1;
  if(m.phase==='betting'&&!m.guessing_open)return 3;
  if(m.phase==='betting'&&m.guessing_open)return 4;
  if(m.phase==='started')return 5;if(m.phase==='settled')return 6;return 1;
}
function stepStartMatch(mid){var m=getMatch(mid);if(!m)return;stopGuessingTimer();m.phase='started';toastMsg('🔴 比赛开始');renderZones()}

function togglePlayerList(zone){expandedPlayerLists[zone]=!expandedPlayerLists[zone];renderZones();}

function buildPlayerListHtml(zone){
  var q=(typeof signupQueues!=='undefined'&&signupQueues[zone])?signupQueues[zone]:[];
  var expanded=!!expandedPlayerLists[zone];
  var h='<div class="player-list-fold">';
  h+='<div class="player-list-head" onclick="togglePlayerList(\''+escName(zone)+'\')">📋 已报名玩家（'+q.length+'人） <span style="font-size:0.7em;">'+(expanded?'▼':'▶')+'</span></div>';
  if(expanded){
    if(q.length>0){
      h+='<div class="player-list-body">';
      q.forEach(function(p,idx){var sb=p.side==='red'?' 🔴':(p.side==='blue'?' 🔵':'');
        h+='<div class="player-list-item"><span class="pli-idx">'+(idx+1)+'.</span><span class="pli-name">'+p.name+sb+'</span><span class="pli-time">'+p.time+'</span></div>';
      });
      h+='</div>';
    }else{h+='<div class="player-list-empty">暂无玩家报名</div>'}
  }
  h+='</div>';return h;
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
    h+='<div class="flow-circle-wrap"><div class="flow-circle '+circleCls+'">'+(done?'✓':(i+1))+'</div></div>';
    h+='<div class="flow-line flow-line-right '+rightCls+'"></div></div>';
    h+='<div class="flow-label'+(current?' flow-label-on':'')+'">'+flowSteps[i].label+'</div></div>';
  }
  h+='</div></div>';return h;
}

function buildStepHtml(mid){
  var m=getMatch(mid);if(!m)return '';
  var step=getStep(m), midEsc=escName(mid);
  var h='<div class="zone-step-panel"><div class="zone-step-title">流程操作</div>';
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
    h+='<div class="divider"></div><p style="color:var(--muted);font-size:0.75em;text-align:center;margin-bottom:10px;">玩法已锁定，选择报名方式开放报名</p>';
    h+='<div style="display:flex;gap:8px;margin-bottom:4px;">';
    h+='<button class="btn btn-purple btn-sm" style="flex:1;" onclick="startActiveSignup(\''+midEsc+'\')">📋 主动报名</button>';
    h+='<button class="btn btn-purple btn-sm" style="flex:1;" onclick="startMatchSignup(\''+midEsc+'\')">🎰 匹配报名</button>';
    h+='</div>';
  }else if(step===3){
    var curMode = zoneMatchMode[m.zone] || 'active';
    if (curMode === 'active') {
      var sq=(typeof signupQueues!=='undefined'&&signupQueues[m.zone])?signupQueues[m.zone]:[];
      var ezs=escName(m.zone);
      h+='<div style="color:var(--muted);font-size:0.75em;margin-bottom:6px;">报名队列（'+sq.length+'人，赛后不清空）</div>';
      if(sq.length>0){sq.forEach(function(p,idx){var sb=p.side==='red'?' 🔴':(p.side==='blue'?' 🔵':'');var en=escName(p.name);var iR=m.red===p.name,iB=m.blue===p.name;
        h+='<div class="reg-player"><div class="queue-arrows"><button class="q-arrow" onclick="moveQueue(\''+ezs+'\','+idx+',-1)\" '+(idx===0?'disabled':'')+'>▲</button><button class="q-arrow" onclick="moveQueue(\''+ezs+'\','+idx+',1)\" '+(idx===sq.length-1?'disabled':'')+'>▼</button></div>';
        h+='<div class="info"><div class="name">'+idx+'. 👤 '+p.name+sb+'</div><div class="time">'+p.time+'</div></div><div class="actions">';
        h+='<button class="btn btn-sm side-btn side-red'+(iR?' active':'')+'\" onclick=\"'+(iR?'stepRemovePick(\''+midEsc+'\',\'red\')':'stepAssign(\''+midEsc+'\',\'red\',\''+en+'\')')+'\">'+(iR?'取消🔴':'🔴')+'</button>';
        h+='<button class="btn btn-sm side-btn side-blue'+(iB?' active':'')+'\" onclick=\"'+(iB?'stepRemovePick(\''+midEsc+'\',\'blue\')':'stepAssign(\''+midEsc+'\',\'blue\',\''+en+'\')')+'\">'+(iB?'取消🔵':'🔵')+'</button>';
        h+='</div></div>';});}else{h+='<div style="text-align:center;padding:10px;color:var(--muted);font-size:0.75em;">暂无选手报名</div>'}
      h+='<div class="divider"></div><div class="vs-preview" style="margin-bottom:8px;"><span class="vs-tag red">🔴 '+(m.red||'待定')+'</span><span style="color:var(--muted);">VS</span><span class="vs-tag blue">🔵 '+(m.blue||'待定')+'</span></div>';

      // ★ 一键补位匹配
      if(m.red && !m.blue){
        h+='<div class="quick-fill-area" id="quickFill_'+mid+'" style="text-align:center;padding:4px 0;font-size:0.85em;color:#c4b5fd;display:none;"></div>';
        h+='<button class="btn btn-accent btn-sm btn-block" style="margin-bottom:8px;" onclick="quickFillMatch(\''+midEsc+'\',\'blue\')">🎰 一键匹配蓝方对手</button>';
      } else if(!m.red && m.blue){
        h+='<div class="quick-fill-area" id="quickFill_'+mid+'" style="text-align:center;padding:4px 0;font-size:0.85em;color:#c4b5fd;display:none;"></div>';
        h+='<button class="btn btn-accent btn-sm btn-block" style="margin-bottom:8px;" onclick="quickFillMatch(\''+midEsc+'\',\'red\')">🎰 一键匹配红方对手</button>';
      } else if(!m.red && !m.blue){
        h+='<div class="quick-fill-area" id="quickFill_'+mid+'" style="text-align:center;padding:4px 0;font-size:0.85em;color:#c4b5fd;display:none;"></div>';
        h+='<button class="btn btn-accent btn-sm btn-block" style="margin-bottom:8px;" onclick="quickFillMatch(\''+midEsc+'\',\'both\')">🎰 一键匹配双方选手</button>';
      }

      if(m.red&&m.blue){h+='<div class="readonly-row"><span class="form-label">🔴 红方奖励系数</span><span class="readonly-val">'+m.redOdds.toFixed(2)+'</span></div>';h+='<div class="readonly-row" style="margin-top:8px;"><span class="form-label">🔵 蓝方奖励系数</span><span class="readonly-val">'+m.blueOdds.toFixed(2)+'</span></div>'}
      if(m.red&&m.blue){h+='<div class="divider"></div><div style="text-align:center;margin-bottom:8px;"><button class="btn btn-outline btn-sm" style="width:auto;" onclick="stepSwapPlayers(\''+midEsc+'\')">🔄 互换红蓝站位</button></div>'}
      if(m.red&&m.blue){
        var curLimit=zoneTimeLimit[m.zone]||'unlimited';
        h+='<div style="display:flex;gap:8px;align-items:center;">';
        h+='<button class="btn btn-purple" style="flex:2;" onclick="stepOpenGuessing(\''+midEsc+'\')">📊 开启观众预测</button>';
        h+='<select class="select" style="flex:1;" onchange="setTimeLimit(\''+escName(m.zone)+'\',this.value)\">';
        h+='<option value="unlimited"'+(curLimit=='unlimited'?' selected':'')+'>无限制</option>';
        h+='<option value="30"'+(curLimit=='30'?' selected':'')+'>30 秒</option>';
        h+='</select></div>';
      }else{h+='<button class="btn btn-outline btn-block" disabled style="opacity:0.4;">📊 需选定双方选手</button>'}
      h+='<div class="divider"></div>';
      h+='<button class="btn btn-outline btn-sm btn-block" style="margin-top:4px;color:#c4b5fd;" onclick="switchToMatchSignup(\''+midEsc+'\')">🎰 切换到匹配报名</button>';
    } else {
      var pool=(typeof getPoolForZone==='function')?getPoolForZone(m.zone):[];
      var poolSize=pool.length;
      var isPickRed=(matchStep==='pickRed'),isPickBlue=(matchStep==='pickBlue');

      h+='<div class="match-lottery" id="matchLottery_'+mid+'" style="display:none;"><div class="lottery-text" id="lotteryText_'+mid+'">正在抽取...</div></div>';

      h+='<div class="match-result-area"><div class="match-vs-row">';
      h+='<div class="match-player-card match-player-red"><div class="match-player-side">🔴 红方</div><div class="match-player-name">'+(matchRedPlayer?matchRedPlayer.name+' ('+matchRedPlayer.points+'分)':'—')+'</div>';
      h+='<button class="btn btn-xs btn-outline rematch-btn" onclick="rematchPlayerForMatch(\''+midEsc+'\',\'red\')"'+(matchRedPlayer?'':' disabled')+'>🔄 重抽</button></div>';
      h+='<div class="match-vs">VS</div>';
      h+='<div class="match-player-card match-player-blue"><div class="match-player-side">🔵 蓝方</div><div class="match-player-name">'+(matchBluePlayer?matchBluePlayer.name+' ('+matchBluePlayer.points+'分)':'—')+'</div>';
      h+='<button class="btn btn-xs btn-outline rematch-btn" onclick="rematchPlayerForMatch(\''+midEsc+'\',\'blue\')"'+(matchBluePlayer?'':' disabled')+'>🔄 重抽</button></div>';
      h+='</div>';

      if(matchStep!=='ready'){
        var btnLabel=isPickRed?'🎰 抽取红方':'🎰 抽取蓝方';
        var canPick=isPickRed?(poolSize>=4):(poolSize>=3);
        h+='<button class="btn btn-purple btn-block match-start-btn" '+(canPick?'onclick="startMatchLotteryForMatch(\''+midEsc+'\')"':'disabled style="opacity:0.4"')+'>';
        h+=canPick?btnLabel:'⚠️ 玩家池不足';h+='</button>';
      }

      if(matchStep==='ready'){
        var mcurLimit=zoneTimeLimit[m.zone]||'unlimited';
        h+='<div style="display:flex;gap:8px;align-items:center;margin-top:8px;">';
        h+='<button class="btn btn-purple" style="flex:2;" onclick="confirmMatchSignupForMatch(\''+midEsc+'\')">✅ 确认匹配，开启预测</button>';
        h+='<select class="select" style="flex:1;" onchange="setTimeLimit(\''+escName(m.zone)+'\',this.value)\">';
        h+='<option value="unlimited"'+(mcurLimit=='unlimited'?' selected':'')+'>无限制</option>';
        h+='<option value="30"'+(mcurLimit=='30'?' selected':'')+'>30 秒</option>';
        h+='</select></div>';
      }
      h+='</div>';
      h+=buildPlayerListHtml(m.zone);
    }
  }else if(step===4){
    var rBet=parseFloat(m.redBet.replace(/,/g,''))||0;
    var bBet=parseFloat(m.blueBet.replace(/,/g,''))||0;
    var total=rBet+bBet;
    var rPct=total>0?(rBet/total*100):50;
    var bPct=total>0?(bBet/total*100):50;
    var rDisplay=rPct,bDisplay=bPct;
    if(rDisplay<5){rDisplay=5;bDisplay=95;}
    else if(rDisplay>95){rDisplay=95;bDisplay=5;}
    if(bDisplay<5){bDisplay=5;rDisplay=95;}
    else if(bDisplay>95){bDisplay=95;rDisplay=5;}
    h+='<div class="settle-stats"><div class="settle-stat"><div class="s-val" style="color:#f87171;">'+m.redBet+'</div><div class="s-lbl">🔴 投注额 · '+m.redBettors+'人支持</div></div><div class="settle-stat"><div class="s-val" style="color:#60a5fa;">'+m.blueBet+'</div><div class="s-lbl">🔵 投注额 · '+m.blueBettors+'人支持</div></div></div>';
    h+='<div class="divider"></div>';
    h+='<div class="support-bar-section"><div class="support-bar-header"><span>📊 实时支持度</span><span class="support-refresh-tag">⏳ 每3秒刷新</span></div><div class="support-bar-track"><div class="support-bar-fill support-bar-red" style="width:'+rDisplay.toFixed(1)+'%;"><span class="support-pct-text">'+rDisplay.toFixed(1)+'%</span></div><div class="support-bar-fill support-bar-blue" style="width:'+bDisplay.toFixed(1)+'%;"><span class="support-pct-text">'+bDisplay.toFixed(1)+'%</span></div></div><div class="support-bar-legend"><span style="color:#fca5a5;">🔴 '+m.red+' · '+m.redBet+'</span><span style="color:#93c5fd;">'+m.blue+' · '+m.blueBet+' 🔵</span></div></div>';
    h+='<div class="divider"></div>';
    var tl=zoneTimeLimit[m.zone];
    if(tl&&tl>0){
      if(!guessingExpired){
        var pct=Math.max(0,Math.round(guessingSecondsLeft/tl*100));
        var barColor=guessingSecondsLeft>10?'#22c55e':(guessingSecondsLeft>5?'#fbbf24':'#ef4444');
        h+='<div class="countdown-bar-wrap"><div class="countdown-bar" id="countdownBar_'+mid+'" style="width:'+pct+'%;background:'+barColor+';"></div></div>';
        h+='<div class="countdown-text" id="countdownText_'+mid+'">⏱ '+guessingSecondsLeft+' 秒</div>';
      }else{
        h+='<div class="countdown-expired">⏰ 竞猜时间已到</div>';
        h+='<button class="btn btn-accent btn-block" onclick="restartGuessing(\''+midEsc+'\')">🔄 再次开启竞猜（30 秒）</button>';
      }
    }
    h+='<div class="divider"></div><div style="text-align:center;color:var(--muted);font-size:0.78em;">🔴 '+m.red+' vs 🔵 '+m.blue+'</div><div class="divider"></div>';
    h+='<button class="btn btn-red btn-block" onclick="stepStartMatch(\''+midEsc+'\')">🔴 开始比赛</button>';
  }else if(step===5){
    h+='<div style="text-align:center;padding:16px 0;"><div style="font-size:2em;margin-bottom:8px;">⚔️</div><div class="vs-preview"><span class="vs-tag red">🔴 '+m.red+'</span><span style="color:var(--muted);">VS</span><span class="vs-tag blue">🔵 '+m.blue+'</span></div></div>';
    h+='<div class="settle-stats"><div class="settle-stat"><div class="s-val">'+m.redOdds.toFixed(2)+'</div><div class="s-lbl">🔴 奖励系数</div></div><div class="settle-stat"><div class="s-val">'+m.blueOdds.toFixed(2)+'</div><div class="s-lbl">🔵 奖励系数</div></div></div>';
    h+='<div class="divider"></div><p style="color:var(--bad);text-align:center;font-size:0.78em;">🔴 比赛进行中...</p>';
    h+='<button class="btn btn-outline btn-sm btn-block" style="margin-top:8px;color:var(--muted);" onclick="simulateDeviceSettle(\''+midEsc+'\')">⚡ 模拟设备结算</button>';
  }else if(step===6){
    h+='<div style="text-align:center;padding:8px 0;"><div style="font-size:2em;">🏆</div><div style="color:var(--good);font-weight:700;">'+(m.winner==='red'?m.red:m.blue)+' 获胜</div><div style="color:var(--muted);font-size:0.8em;">比分: '+m.score+'</div></div><div class="divider"></div>';
    h+='<div class="settle-stats"><div class="settle-stat"><div class="s-val" style="color:#c4b5fd;">'+m.exCoin+'</div><div class="s-lbl">💎 礼品点数产出</div></div><div class="settle-stat"><div class="s-val" style="color:#c4b5fd;">'+m.winnerReward+'</div><div class="s-lbl">💎 猜中发放</div></div><div class="settle-stat"><div class="s-val">'+m.totalBet+'</div><div class="s-lbl">💰 总投入</div></div></div>';
    h+='<div class="divider"></div><button class="btn btn-purple btn-block" onclick="stepNextRound(\''+midEsc+'\')">🔄 下一局</button>';
  }
  if(step!==1&&step!==5&&step!==6){
    h+='<button class="btn btn-outline btn-sm btn-block" style="margin-top:10px;color:var(--bad);" onclick="stepCancel(\''+midEsc+'\')">取消比赛</button>';
  }
  if(typeof buildWarmupPanelHtml==='function')h+=buildWarmupPanelHtml(mid);
  h+='</div>';return h;
}

/* === 匹配报名 === */
function startActiveSignup(mid){var m=getMatch(mid);if(!m)return;zoneMatchMode[m.zone]='active';resetMatchState();stepOpenBetting(mid);}
function startMatchSignup(mid){var m=getMatch(mid);if(!m)return;zoneMatchMode[m.zone]='match';resetMatchState();stepOpenBetting(mid);}
function switchToMatchSignup(mid){
  var m=getMatch(mid);if(!m)return;
  resetMatchState();
  zoneMatchMode[m.zone]='match';
  renderZones();
}
function resetMatchState(){matchRedPlayer=null;matchBluePlayer=null;matchStep='pickRed';if(matchLotteryTimer){clearInterval(matchLotteryTimer);matchLotteryTimer=null;}}

/* === 一键补位匹配 === */
function quickFillMatch(mid, side){
  var m=getMatch(mid);if(!m)return;
  var pool=(typeof getPoolForZone==='function')?getPoolForZone(m.zone):[];
  if(!pool||pool.length<1){toastMsg('玩家池不足');return;}

  var target=null, targetSide=side, fillRed=null;

  if(side==='blue'){
    var redPlayer=pool.find(function(p){return p.name===m.red;});
    var redPoints=redPlayer?redPlayer.points:500;
    var candidates=pool.filter(function(p){return p.name!==m.red;});
    if(candidates.length===0){toastMsg('玩家池无可用选手');return;}
    candidates.sort(function(a,b){return Math.abs(a.points-redPoints)-Math.abs(b.points-redPoints);});
    target=candidates.slice(0,Math.min(5,candidates.length));
    target=target[Math.floor(Math.random()*target.length)];
  }else if(side==='red'){
    var bluePlayer=pool.find(function(p){return p.name===m.blue;});
    var bluePoints=bluePlayer?bluePlayer.points:500;
    var candidates=pool.filter(function(p){return p.name!==m.blue;});
    if(candidates.length===0){toastMsg('玩家池无可用选手');return;}
    candidates.sort(function(a,b){return Math.abs(a.points-bluePoints)-Math.abs(b.points-bluePoints);});
    target=candidates.slice(0,Math.min(5,candidates.length));
    target=target[Math.floor(Math.random()*target.length)];
  }else{
    if(pool.length<2){toastMsg('玩家池不足（至少需要2人）');return;}
    var sorted=pool.slice().sort(function(a,b){return a.points-b.points;});
    var trimmed=sorted.length>=3?sorted.slice(1,-1):sorted;
    fillRed=trimmed[Math.floor(Math.random()*trimmed.length)];
    var blueCands=pool.filter(function(p){return p.name!==fillRed.name;});
    blueCands.sort(function(a,b){return Math.abs(a.points-fillRed.points)-Math.abs(b.points-fillRed.points);});
    target=blueCands.slice(0,Math.min(5,blueCands.length));
    target=target[Math.floor(Math.random()*target.length)];
  }

  var qf=document.getElementById('quickFill_'+mid);
  if(qf){qf.style.display='block';qf.textContent='🎯 正在匹配...';}

  var names=pool.map(function(p){return p.name;});
  var idx=0,timer=setInterval(function(){
    idx=(idx+1)%names.length;
    if(qf)qf.textContent='🎯 '+names[idx];
  },120);

  setTimeout(function(){
    clearInterval(timer);
    if(qf){qf.style.display='none';}
    if(fillRed){m.red=fillRed.name;}
    if(target){
      if(targetSide==='red'){m.red=target.name;}
      else{m.blue=target.name;}
    }
    if(side==='both'&&fillRed)targetSide='blue';
    var now=new Date().toTimeString().slice(0,8);
    if(typeof signupQueues!=='undefined'){
      if(!signupQueues[m.zone])signupQueues[m.zone]=[];
      if(fillRed)signupQueues[m.zone].push({name:fillRed.name,time:now,side:'red',matchType:'quickFill'});
      if(target)signupQueues[m.zone].push({name:target.name,time:now,side:targetSide,matchType:'quickFill'});
    }
    renderZones();
    var msg=fillRed?(fillRed.name+' 🔴 VS 🔵 '+target.name):target.name;
    toastMsg('🎰 匹配完成：'+msg);
  },2500);
}

function startMatchLotteryForMatch(mid){
  var m=getMatch(mid);if(!m)return;
  var pool=(typeof getPoolForZone==='function')?getPoolForZone(m.zone):[];
  if(matchStep==='pickRed'){if(pool.length<4){toastMsg('玩家池不足');return;}}else{if(pool.length<3){toastMsg('玩家池不足');return;}}
  var lt=document.getElementById('matchLottery_'+mid);if(lt)lt.style.display='block';
  var r;if(matchStep==='pickRed'){r=pickRedFromPool(pool);if(!r){if(lt)lt.style.display='none';toastMsg('抽取失败');return;}}
  else{r=pickBlueForRed(pool,matchRedPlayer);if(!r){if(lt)lt.style.display='none';toastMsg('抽取失败');return;}}
  runLotteryAnimation(mid,pool,r);
}
function runLotteryAnimation(mid,pool,result){
  var an=[];for(var i=0;i<pool.length;i++)an.push(pool[i].name);if(an.length<2)an=an.concat(['—']);
  var ci=0,fi=60,fd=1800,si=150,sd=900,el=0,nt=document.getElementById('lotteryText_'+mid);
  matchLotteryTimer=setInterval(function(){
    el+=fi;
    if(el<=fd){ci=(ci+1)%an.length;if(nt)nt.textContent='🎯 '+an[ci];}
    else if(el<=fd+sd){clearInterval(matchLotteryTimer);matchLotteryTimer=setInterval(function(){ci=(ci+1)%an.length;if(nt)nt.textContent='🎯 '+an[ci];},si);
      setTimeout(function(){clearInterval(matchLotteryTimer);matchLotteryTimer=null;onLotteryDone(mid,result);},sd);}
  },fi);
}
function pickRedFromPool(pool){if(pool.length<4)return null;var s=pool.slice().sort(function(a,b){return a.points-b.points});var t=s.slice(1,-1);if(!t.length)return null;return t[Math.floor(Math.random()*t.length)];}
function pickBlueForRed(pool,rp){if(!rp||pool.length<2)return null;var s=pool.slice().sort(function(a,b){return a.points-b.points});var t=s.slice(1,-1);var o=t.filter(function(p){return p.name!==rp.name});if(!o.length)return null;var w=o.map(function(p){return{player:p,diff:Math.abs(p.points-rp.points)}});w.sort(function(a,b){return a.diff-b.diff});return w.slice(0,5)[Math.floor(Math.random()*Math.min(5,w.length))].player;}
function onLotteryDone(mid,player){
  var lt=document.getElementById('matchLottery_'+mid);if(lt)lt.style.display='none';
  if(matchStep==='pickRed'){matchRedPlayer=player;matchStep='pickBlue';toastMsg('红方：'+player.name);}
  else{matchBluePlayer=player;matchStep='ready';toastMsg('蓝方：'+player.name);}
  renderZones();
}
function rematchPlayerForMatch(mid,side){
  var m=getMatch(mid);if(!m)return;var pool=(typeof getPoolForZone==='function')?getPoolForZone(m.zone):[];
  if(side==='red'){matchRedPlayer=null;matchStep='pickRed';}else{matchBluePlayer=null;matchStep=matchRedPlayer?'pickBlue':'pickRed';}
  if(matchLotteryTimer){clearInterval(matchLotteryTimer);matchLotteryTimer=null;}renderZones();
  var r;if(side==='red'){if(pool.length<4){toastMsg('玩家池不足');return;}r=pickRedFromPool(pool);if(!r){toastMsg('重抽失败');return;}}
  else{if(pool.length<3){toastMsg('玩家池不足');return;}r=pickBlueForRed(pool,matchRedPlayer);if(!r){toastMsg('重抽失败');return;}}
  var lt=document.getElementById('matchLottery_'+mid);if(lt)lt.style.display='block';
  runLotteryAnimation(mid,pool,r);
}

/* === 竞猜倒计时 === */
function setTimeLimit(zone,val){zoneTimeLimit[zone]=val==='unlimited'?null:parseInt(val);}
function startGuessingTimer(mid){
  var m=getMatch(mid);if(!m)return;var tl=zoneTimeLimit[m.zone];if(!tl||tl<=0)return;
  stopGuessingTimer();guessingExpired=false;guessingSecondsLeft=tl;
  guessingTimer=setInterval(function(){
    guessingSecondsLeft--;
    if(guessingSecondsLeft<=0){stopGuessingTimer();guessingExpired=true;renderZones();return;}
    var bar=document.getElementById('countdownBar_'+mid);
    var txt=document.getElementById('countdownText_'+mid);
    if(bar){var pct=Math.round(guessingSecondsLeft/tl*100);bar.style.width=pct+'%';bar.style.background=guessingSecondsLeft>10?'#22c55e':(guessingSecondsLeft>5?'#fbbf24':'#ef4444');}
    if(txt)txt.textContent='⏱ '+guessingSecondsLeft+' 秒';
  },1000);
}
function restartGuessing(mid){var m=getMatch(mid);if(!m)return;var tl=zoneTimeLimit[m.zone]||30;guessingExpired=false;guessingSecondsLeft=tl;renderZones();startGuessingTimer(mid);toastMsg('竞猜已重新开启');}
function stopGuessingTimer(){if(guessingTimer){clearInterval(guessingTimer);guessingTimer=null;}guessingSecondsLeft=0;guessingExpired=false;}

function confirmMatchSignupForMatch(mid){
  var m=getMatch(mid);if(!m)return;
  if(!matchRedPlayer||!matchBluePlayer)return toastMsg('请先抽取双方');
  m.red=matchRedPlayer.name;m.blue=matchBluePlayer.name;
  var now=new Date().toTimeString().slice(0,8);
  if(typeof signupQueues!=='undefined'){if(!signupQueues[m.zone])signupQueues[m.zone]=[];signupQueues[m.zone].push({name:m.red,time:now,side:'red',matchType:'match'});signupQueues[m.zone].push({name:m.blue,time:now,side:'blue',matchType:'match'});}
  resetMatchState();m.guessing_open=true;m.redBet='520';m.blueBet='430';m.redBettors=3;m.blueBettors=2;m.totalBet='950';
  guessingExpired=false;var tl=zoneTimeLimit[m.zone];if(tl&&tl>0)guessingSecondsLeft=tl;
  renderZones();if(tl&&tl>0)startGuessingTimer(mid);
  toastMsg('匹配成功：'+m.red+' VS '+m.blue+' · 预测已开启');
}

/* === 场次管理 === */
function onAdminZoneChange(el){adminMatchZone=el?el.value:adminMatchZone;renderZones();}
function renderZones(){
  var zones=['疾速冰球厅','雷霆击剑厅','烈焰拳王厅'];
  var emojiMap={'雷霆击剑厅':'⚔️','烈焰拳王厅':'🔥','疾速冰球厅':'🏒'};
  var z=adminMatchZone;var zm=getZoneMatch(z);
  var h='<div class="admin-match-head"><div class="section-title">📷 场次管理</div>';
  h+='<div class="admin-zone-row"><select class="zone-select zone-select-big" id="adminZoneSelect" onchange="onAdminZoneChange(this)">';
  zones.forEach(function(zz){h+='<option value="'+zz+'"'+(zz===z?' selected':'')+'>'+emojiMap[zz]+' '+zz+'</option>';});
  h+='</select></div></div>';h+=buildFlowProgressHtml(zm);
  var pt='',pc='',pp='',game='';
  if(zm){game=zm.game+' · 🕐 '+zm.time+' · '+zm.round;
    if(zm.phase==='waiting'){pc='tag-wait';pt=zm.configDone?'⏳ 等待报名':'⚪ 玩法配置';pp='🔴 '+(zm.red||'待定')+'  VS  🔵 '+(zm.blue||'待定')}
    else if(zm.phase==='betting'&&!zm.guessing_open){pc='tag-wait';pt='⚪ 报名中';pp='🔴 '+(zm.red||'待定')+'  VS  🔵 '+(zm.blue||'待定')}
    else if(zm.phase==='betting'&&zm.guessing_open){pc='tag-bet';pt='🟡 预测中';pp='🔴 '+zm.red+'  VS  🔵 '+zm.blue}
    else if(zm.phase==='started'){pc='tag-live';pt='🔴 比赛中';pp='🔴 '+zm.red+'  VS  🔵 '+zm.blue}
    else{pc='tag-done';pt='🟢 已结束';pp='🏆 胜方: '+(zm.winner==='red'?zm.red:zm.blue)}
  }else{pc='tag-wait';pt='⚪ 空闲';pp='暂无比赛'}
  h+='<div class="zone-box"><div class="zone-box-hd">📷 '+(emojiMap[z]||'')+' '+z+' <span class="tag '+pc+'">'+pt+'</span></div>';
  h+='<div class="zone-box-body"><div class="zone-box-game">'+(game||'—')+'</div><div class="zone-box-vs">'+pp+'</div>';
  if(zm){h+='<div id="stepPanel">'+buildStepHtml(zm.id)+'</div>'}else{h+='<div class="queue-empty" style="margin-top:8px;">该厅暂无比赛</div>'}
  h+='</div></div>';var el=document.getElementById('zonesList');if(el)el.innerHTML=h;
}
function refreshQueueViews(){renderZones()}
function moveQueue(zone,idx,dir){var q=signupQueues[zone];if(!q)return;var ni=idx+dir;if(ni<0||ni>=q.length)return;var t=q[idx];q[idx]=q[ni];q[ni]=t;refreshQueueViews();}
function stepCompleteConfig(mid){var m=getMatch(mid);if(!m)return;var el=document.getElementById('editCName-'+mid);m.customName=el?el.value:m.customName;m.configDone=true;toastMsg('配置完成');renderZones()}
function stepOpenBetting(mid){var m=getMatch(mid);if(!m)return;m.phase='betting';m.guessing_open=false;toastMsg('报名已开启');renderZones()}
function syncQueueSide(zone,name,side){var q=(typeof signupQueues!=='undefined')?signupQueues[zone]:null;if(!q)return;q.forEach(function(p){if(p.side===side)p.side=null;});if(name){var h=q.find(function(p){return p.name===name});if(h)h.side=side;}}
function stepAssign(mid,side,name){var m=getMatch(mid);if(!m)return;if(side==='red')m.red=name;else m.blue=name;syncQueueSide(m.zone,name,side);renderZones()}
function stepRemovePick(mid,side){var m=getMatch(mid);if(!m)return;if(side==='red')m.red=null;else m.blue=null;syncQueueSide(m.zone,null,side);renderZones()}
function simulateDeviceSettle(mid){var m=getMatch(mid);if(!m)return;var w=Math.random()>0.5?'red':'blue';m.phase='settled';m.winner=w;m.score=(w==='red'?'3':Math.floor(Math.random()*3))+':'+(w==='blue'?'3':Math.floor(Math.random()*3));m.exCoin=(w==='red'?m.redBet:m.blueBet);m.winnerReward=String(Math.floor(parseInt(m.totalBet.replace(/,/g,''))*(w==='red'?m.redOdds:m.blueOdds)));renderZones();toastMsg('判定: '+(w==='red'?m.red:m.blue)+' 获胜')}
function stepSwapPlayers(mid){var m=getMatch(mid);if(!m)return;var t=m.red;m.red=m.blue;m.blue=t;t=m.redOdds;m.redOdds=m.blueOdds;m.blueOdds=t;renderZones()}
function stepOpenGuessing(mid){var m=getMatch(mid);if(!m)return;if(!m.red||!m.blue)return toastMsg('请先选定双方');m.guessing_open=true;m.redBet='520';m.blueBet='430';m.redBettors=3;m.blueBettors=2;m.totalBet='950';guessingExpired=false;var tl=zoneTimeLimit[m.zone];if(tl&&tl>0)guessingSecondsLeft=tl;renderZones();if(tl&&tl>0)startGuessingTimer(mid);toastMsg('预测已开启');}
function stepNextRound(mid){stopGuessingTimer();var m=getMatch(mid);if(!m)return;var nr='第'+(parseInt(m.round.replace('第','').replace('局',''))+1)+'局';m.phase='waiting';m.guessing_open=false;m.configDone=false;m.round=nr;m.red=null;m.blue=null;m.redBet='0';m.blueBet='0';m.redBettors=0;m.blueBettors=0;m.winner=null;m.score='';m.exCoin='0';m.totalBet='0';m.winnerReward='0';toastMsg('🔄 '+nr);renderZones()}
function stepCancel(mid){stopGuessingTimer();var m=getMatch(mid);if(!m)return;showConfirm('确定回到玩法配置？',function(){m.phase='waiting';m.guessing_open=false;m.configDone=false;m.red=null;m.blue=null;m.redBet='0';m.blueBet='0';m.redBettors=0;m.blueBettors=0;m.winner=null;m.score='';m.exCoin='0';m.totalBet='0';m.winnerReward='0';toastMsg('已取消');renderZones()})}
function toggleMaster(mid){var m=getMatch(mid);if(!m)return;m.isMaster=!m.isMaster;renderZones()}

setInterval(function(){
  var zm=getZoneMatch(adminMatchZone);
  if(!zm||zm.phase!=='betting'||!zm.guessing_open)return;
  var panel=document.getElementById('stepPanel');
  if(!panel)return;
  var rBet=parseInt(zm.redBet.replace(/,/g,''))+Math.floor(Math.random()*50)+5;
  var bBet=parseInt(zm.blueBet.replace(/,/g,''))+Math.floor(Math.random()*50)+5;
  zm.redBet=rBet.toLocaleString();
  zm.blueBet=bBet.toLocaleString();
  zm.totalBet=(rBet+bBet).toLocaleString();
  if(Math.random()>0.35)zm.redBettors++;
  if(Math.random()>0.35)zm.blueBettors++;
  panel.innerHTML=buildStepHtml(zm.id);
},3000);

renderZones();
