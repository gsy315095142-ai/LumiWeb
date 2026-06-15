/**
 * LumiSport 管理员端 - 扫码/报名/发放/兑换
 * 兑换流程改为双扫码：先扫商品码，再扫用户身份码
 */
var randomNames=['小明','阿强','大飞','老王','杰哥','阿豪','小胖','KK','老周','铁拳陈','剑圣','刀锋','火神','岩魔','闪电赵'];
var exScanStep=0,exScannedProduct=null,exScannedUser=null;

var givePageUser=null,givePageAmt=0,givePageIsCustom=false;

function renderAdminGiveCoin(){
  var el=document.getElementById('adminGiveBody');if(!el)return;
  var h='';
  if(!givePageUser){
    h+='<div class="card give-scan-card"><div class="give-scan-frame"><div class="give-scan-icon">📲</div><p style="color:var(--muted);font-size:0.82em;margin:10px 0 16px;text-align:center;">扫描用户「我的」页身份码<br>确认后发放游戏币</p><button class="btn btn-purple btn-block" onclick="scanGivePageUser()">📲 扫描用户身份码</button></div></div>';
  }else{
    h+='<div class="card"><h3>👤 用户信息</h3><div class="scan-user-info" style="margin:0;"><div class="avatar">👁</div><div class="name">'+givePageUser.name+'</div><div class="scan-user-coins"><span style="color:#fbbf24;">💰 游戏币 <strong>'+givePageUser.gameCoin+'</strong></span><span style="color:#c4b5fd;">💎 兑换币 <strong>'+givePageUser.exCoin+'</strong></span></div></div><button class="btn btn-outline btn-sm btn-block" style="margin-top:10px;color:#fff;" onclick="rescanGivePageUser()">🔄 重新扫描</button></div>';
    h+='<div class="card"><h3>💰 发放金额</h3><div class="bet-chips" id="givePageChips"><span class="bet-chip" onclick="setGivePageCoin(100)">100</span><span class="bet-chip" onclick="setGivePageCoin(200)">200</span><span class="bet-chip" onclick="setGivePageCoin(500)">500</span><span class="bet-chip" onclick="setGivePageCoin(1000)">1000</span><span class="bet-chip" onclick="useCustomGivePage()">自定义</span></div>';
    h+='<div id="givePageCustomArea" class="hidden" style="margin-top:8px;"><input class="input" id="givePageCustomAmt" type="number" placeholder="手动输入金额" min="1" step="1" oninput="onCustomGivePage()"><div class="bet-hint" id="givePageHint"></div></div>';
    h+='<div style="margin-top:12px;"><label class="form-label">发放理由 <span style="color:var(--muted);">选填</span></label><select class="select" id="givePageReason"><option value="">请选择理由</option><option>酒店入住</option><option>购买套餐</option><option>活动奖励</option><option>签到奖励</option><option>新手福利</option><option>补偿发放</option><option>其他</option></select></div>';
    h+='<div style="margin-top:8px;"><label class="form-label">补充说明 <span style="color:var(--muted);">选填</span></label><input class="input" id="givePageReasonNote" type="text" placeholder="可选填写详细说明" maxlength="50"></div>';
    h+='<button class="btn btn-purple btn-block" style="margin-top:14px;" onclick="confirmGivePageCoin()">✅ 确认发放</button></div>';
  }
  el.innerHTML=h;
}
function scanGivePageUser(){
  var name=randomNames[Math.floor(Math.random()*randomNames.length)];
  var coin=Math.floor(Math.random()*2000)+100,ex=Math.floor(Math.random()*500)+50;
  givePageUser={name:name,gameCoin:String(coin),exCoin:String(ex)};
  givePageAmt=0;givePageIsCustom=false;
  renderAdminGiveCoin();
}
function rescanGivePageUser(){givePageUser=null;givePageAmt=0;givePageIsCustom=false;renderAdminGiveCoin()}
function setGivePageCoin(amt){givePageAmt=amt;givePageIsCustom=false;var chips=document.querySelectorAll('#givePageChips .bet-chip');for(var i=0;i<chips.length;i++)chips[i].classList.remove('active');event.target.classList.add('active');var ca=document.getElementById('givePageCustomArea');if(ca)ca.classList.add('hidden');var ci=document.getElementById('givePageCustomAmt');if(ci)ci.value='';var gh=document.getElementById('givePageHint');if(gh)gh.textContent=''}
function useCustomGivePage(){givePageIsCustom=true;givePageAmt=0;var chips=document.querySelectorAll('#givePageChips .bet-chip');for(var i=0;i<chips.length;i++)chips[i].classList.remove('active');event.target.classList.add('active');var ca=document.getElementById('givePageCustomArea');if(ca)ca.classList.remove('hidden');var ci=document.getElementById('givePageCustomAmt');if(ci)ci.focus()}
function onCustomGivePage(){var v=parseInt(document.getElementById('givePageCustomAmt').value)||0;var gh=document.getElementById('givePageHint');if(gh)gh.textContent=(document.getElementById('givePageCustomAmt').value&&v<1)?'请输入有效金额':'';if(v>=1)givePageAmt=v;else givePageAmt=0}
function confirmGivePageCoin(){
  if(!givePageUser)return toastMsg('请先扫描用户身份码');
  if(givePageIsCustom){var v=parseInt(document.getElementById('givePageCustomAmt').value)||0;if(v<1)return toastMsg('请输入有效的游戏币数量');givePageAmt=v}
  if(!givePageAmt)return toastMsg('请选择或输入发放金额');
  var reasonEl=document.getElementById('givePageReason');
  var noteEl=document.getElementById('givePageReasonNote');
  var reason=reasonEl?reasonEl.value:'';
  var note=noteEl?noteEl.value.trim():'';
  var userName=givePageUser.name;
  var amt=givePageAmt;
  showConfirm('确定向 '+userName+' 发放 '+amt+' 💰 游戏币吗？',function(){
    var desc=reason?(reason+(note?'('+note+')':'')):'管理员发放';
    toastMsg('✅ 已发放 '+amt+' 游戏币给 '+userName+(reason?' · '+desc:''));
    givePageUser=null;givePageAmt=0;givePageIsCustom=false;
    renderAdminGiveCoin();
  });
}

function simulateScan(){
  var name=randomNames[Math.floor(Math.random()*randomNames.length)];
  var coin=Math.floor(Math.random()*2000)+100,ex=Math.floor(Math.random()*500)+50;
  scannedUser={name:name,gameCoin:String(coin),exCoin:String(ex)};
  giveCoinAmt=0;giveIsCustom=false;
  var cc=document.querySelectorAll('#giveCoinChips .bet-chip');
  for(var i=0;i<cc.length;i++)cc[i].classList.remove('active');
  var ca=document.getElementById('customGiveArea');if(ca)ca.classList.add('hidden');
  var ci=document.getElementById('customGiveAmt');if(ci)ci.value='';
  var gh=document.getElementById('giveHint');if(gh)gh.textContent='';
  document.getElementById('scanAction').value='';
  document.getElementById('scanActionContent').innerHTML='';
  document.getElementById('scanModal').classList.remove('hidden');
  updateScanBalance();
  var nameEls=document.querySelectorAll('#scanModal .name');
  for(var j=0;j<nameEls.length;j++)nameEls[j].textContent=name;
}

function onScanAction(){var v=document.getElementById('scanAction').value,ct=document.getElementById('scanActionContent');if(v==='signup')renderSignupContent(ct);else if(v==='give')renderGiveContent(ct);else if(v==='exchange')renderExchangeContentNew(ct);else ct.innerHTML=''}

function renderExchangeContentNew(ct){
  // 新版双扫码兑换入口
  ct.innerHTML='<div class="divider"></div><div style="text-align:center;padding:16px 0;"><p style="color:var(--muted);font-size:0.82em;margin-bottom:12px;">兑换需两步扫码</p><div class="two-scan-steps"><div class="scan-step-num">1</div><span style="color:#ccc;font-size:0.78em;">扫商品条形码</span></div><div class="two-scan-steps" style="margin-top:6px;"><div class="scan-step-num">2</div><span style="color:#ccc;font-size:0.78em;">扫用户身份码</span></div><button class="btn btn-purple btn-sm" style="width:100%;margin-top:14px;" onclick="startExchangeFlow()">🛅 开始兑换流程</button></div>';
}

function startExchangeFlow(){
  document.getElementById('scanModal').classList.add('hidden');
  exScanStep=1;exScannedProduct=null;exScannedUser=null;
  document.getElementById('exchangeScanTitle').textContent='🛅 兑换 · 步骤 1/2';
  document.getElementById('exchangeScanStep').innerHTML='<div style="text-align:center;padding:20px 0;"><div class="scan-step-icon">📦</div><p style="color:#ccc;margin:10px 0;font-size:0.85em;">请扫描<span style="color:#fbbf24;">商品条形码</span></p><button class="btn btn-purple" style="width:auto;display:inline-block;padding:10px 28px;" onclick="simulateProductScan()">📲 模拟扫商品码</button></div>';
  document.getElementById('exchangeScanModal').classList.remove('hidden');
}

function simulateProductScan(){
  if(exScanStep!==1)return;
  var p=products[Math.floor(Math.random()*products.length)];
  exScannedProduct={icon:p.icon,name:p.name,price:p.price,origPrice:p.origPrice,desc:p.desc};
  exScanStep=2;
  document.getElementById('exchangeScanTitle').textContent='🛅 兑换 · 步骤 2/2';
  document.getElementById('exchangeScanStep').innerHTML='<div style="text-align:center;padding:12px 0;"><div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:14px;margin-bottom:16px;border:1px solid var(--accent2);"><div style="font-size:1.5em;">'+exScannedProduct.icon+'</div><div style="color:#fff;font-weight:600;font-size:0.85em;">'+exScannedProduct.name+'</div><div style="color:var(--muted);font-size:0.68em;margin-top:2px;">'+exScannedProduct.desc+'</div><div style="margin-top:4px;"><span style="color:var(--accent2);font-weight:700;">'+exScannedProduct.price+' 💎</span><span style="text-decoration:line-through;color:var(--muted);font-size:0.65em;margin-left:4px;">￥'+exScannedProduct.origPrice+'</span></div></div><div class="scan-step-icon">👤</div><p style="color:#ccc;margin:10px 0;font-size:0.85em;">请扫描<span style="color:#c4b5fd;">用户身份码</span></p><button class="btn btn-purple" style="width:auto;display:inline-block;padding:10px 28px;" onclick="simulateUserScan()">📲 模拟扫用户码</button></div>';
}

function simulateUserScan(){
  if(exScanStep!==2||!exScannedProduct)return;
  var name=randomNames[Math.floor(Math.random()*randomNames.length)];
  var coin=Math.floor(Math.random()*2000)+100,ex=Math.floor(Math.random()*500)+50;
  exScannedUser={name:name,gameCoin:String(coin),exCoin:String(ex)};
  exScanStep=3;
  document.getElementById('exchangeScanTitle').textContent='🛅 兑换 · 确认核销';
  document.getElementById('exchangeScanStep').innerHTML='<div style="text-align:center;padding:12px 0;"><div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:14px;margin-bottom:10px;border:1px solid var(--accent2);"><div style="font-size:1.5em;">'+exScannedProduct.icon+'</div><div style="color:#fff;font-weight:600;font-size:0.85em;">'+exScannedProduct.name+'</div><div style="margin-top:4px;"><span style="color:var(--accent2);font-weight:700;">'+exScannedProduct.price+' 💎</span><span style="text-decoration:line-through;color:var(--muted);font-size:0.65em;margin-left:4px;">￥'+exScannedProduct.origPrice+'</span></div></div><div class="divider"></div><div style="color:#ccc;font-size:0.85em;"><strong>'+exScannedUser.name+'</strong></div><div style="color:var(--muted);font-size:0.7em;">💰 游戏币: '+exScannedUser.gameCoin+' | 💎 兑换币: '+exScannedUser.exCoin+'</div><div class="divider"></div><button class="btn btn-purple btn-block" onclick="confirmExchange2()">✅ 确认核销 · 扣除 '+exScannedProduct.price+' 💎</button></div>';
}

function confirmExchange2(){
  if(!exScannedProduct||!exScannedUser)return;
  toastMsg('🎁 核销成功！'+exScannedUser.name+' 兑换 '+exScannedProduct.name+' · 扣除 '+exScannedProduct.price+' 💎');
  document.getElementById('exchangeScanModal').classList.add('hidden');
  exScanStep=0;exScannedProduct=null;exScannedUser=null;
}

function renderSignupContent(ct){
  selectedSignupSide=null;signupRedFull=false;signupBlueFull=false;
  var h='<div class="divider"></div>';
  h+='<div style="margin-bottom:10px;"><label class="form-label">选择区域</label><select class="select" id="signupZone" onchange="onSignupZoneChange()"><option value="雷霆击剑厅">雷霆击剑厅</option><option value="烈焰拳王厅">烈焰拳王厅</option><option value="疾速冰球厅">疾速冰球厅</option></select></div>';
  h+='<div style="margin-bottom:10px;"><label class="form-label">选择阵营</label><div class="flex-row" style="gap:10px;"><button class="btn btn-sm side-btn side-red" style="flex:1;" id="signupRed" onclick="selectSignupSide(\'red\')">红方</button><button class="btn btn-sm side-btn side-blue" style="flex:1;" id="signupBlue" onclick="selectSignupSide(\'blue\')">蓝方</button></div><div class="bet-hint" id="signupSideHint"></div></div>';
  h+='<div class="readonly-row"><span class="form-label">报名费</span><span class="readonly-val" id="signupFee">0</span></div><div class="bet-hint" id="signupFeeHint"></div>';
  h+='<div class="flex-row" style="margin-top:10px;"><button class="btn btn-purple btn-sm" style="flex:1;" id="signupConfirmBtn" onclick="confirmSignup()">确认报名</button></div>';
  ct.innerHTML=h;checkSignupAvailability();
}

function renderGiveContent(ct){
  giveCoinAmt=0;giveIsCustom=false;
  var h='<div class="divider"></div><div class="bet-chips" style="margin:6px 0;"><span class="bet-chip" onclick="setGiveCoin(100)">100</span><span class="bet-chip" onclick="setGiveCoin(200)">200</span><span class="bet-chip" onclick="setGiveCoin(500)">500</span><span class="bet-chip" onclick="setGiveCoin(1000)">1000</span><span class="bet-chip" onclick="useCustomGive()">自定义</span></div>';
  h+='<div id="customGiveArea" class="hidden" style="margin:6px 0;"><input class="input" id="customGiveAmt" type="number" placeholder="手动输入金额" min="1" step="1" oninput="onCustomGive()"><div style="font-size:0.65em;color:var(--bad);min-height:14px;" id="giveHint"></div></div>';
  h+='<div style="margin-top:10px;"><label class="form-label">发放理由 <span style="color:var(--muted);">选填</span></label><select class="select" id="giveReason"><option value="">请选择理由</option><option>酒店入住</option><option>购买套餐</option><option>活动奖励</option><option>签到奖励</option><option>新手福利</option><option>补偿发放</option><option>其他</option></select></div>';
  h+='<div style="margin-top:6px;"><label class="form-label">补充说明 <span style="color:var(--muted);">选填</span></label><input class="input" id="giveReasonNote" type="text" placeholder="可选填写详细说明" maxlength="50"></div>';
  h+='<div class="flex-row" style="margin-top:10px;"><button class="btn btn-purple btn-sm" style="flex:1;" onclick="confirmGiveCoin()">确认发放</button></div>';
  ct.innerHTML=h;
}

function renderExchangeContent(ct){} // 旧版已废弃

function setGiveCoin(amt){giveCoinAmt=amt;giveIsCustom=false;var cc=document.querySelectorAll('#giveCoinChips .bet-chip');for(var i=0;i<cc.length;i++)cc[i].classList.remove('active');event.target.classList.add('active');var ca=document.getElementById('customGiveArea');if(ca)ca.classList.add('hidden');var ci=document.getElementById('customGiveAmt');if(ci)ci.value=''}
function useCustomGive(){giveIsCustom=true;giveCoinAmt=0;var cc=document.querySelectorAll('#giveCoinChips .bet-chip');for(var i=0;i<cc.length;i++)cc[i].classList.remove('active');event.target.classList.add('active');var ca=document.getElementById('customGiveArea');if(ca)ca.classList.remove('hidden');var ci=document.getElementById('customGiveAmt');if(ci)ci.focus()}
function onCustomGive(){var v=parseInt(document.getElementById('customGiveAmt').value)||0;var gh=document.getElementById('giveHint');if(gh)gh.textContent=(document.getElementById('customGiveAmt').value&&v<1)?'请输入有效金额':'';if(v>=1)giveCoinAmt=v;else giveCoinAmt=0}

function updateScanBalance(){if(!scannedUser)return;var el=document.querySelector('#scanModal .scan-user-coins');if(el)el.innerHTML='<span style="color:#fbbf24;">游戏币 <strong>'+scannedUser.gameCoin+'</strong></span><span style="color:#c4b5fd;">兑换币 <strong>'+scannedUser.exCoin+'</strong></span>'}

function checkSignupAvailability(){
  var zone=document.getElementById('signupZone').value;
  var signups=matches.filter(function(m){return m.phase==='betting'&&!m.guessing_open&&m.zone===zone});
  var hasMatch=signups.length>0;
  signupRedFull=hasMatch&&signups.every(function(m){return m.red!==null});
  signupBlueFull=hasMatch&&signups.every(function(m){return m.blue!==null});
  var rb=document.getElementById('signupRed'),bb=document.getElementById('signupBlue'),hint=document.getElementById('signupSideHint'),msg='';
  if(!hasMatch){if(rb)rb.classList.add('locked');if(rb)rb.disabled=true;if(bb)bb.classList.add('locked');if(bb)bb.disabled=true;if(hint)hint.textContent='该区域暂无报名中的比赛';var sfh=document.getElementById('signupFeeHint');if(sfh)sfh.textContent='';return}
  if(rb)rb.disabled=false;if(bb)bb.disabled=false;
  if(signupRedFull){if(rb)rb.classList.add('locked');if(rb)rb.disabled=true;msg='红方已满 '}else{if(rb)rb.classList.remove('locked');if(rb)rb.disabled=false}
  if(signupBlueFull){if(bb)bb.classList.add('locked');if(bb)bb.disabled=true;msg+='蓝方已满'}else{if(bb)bb.classList.remove('locked');if(bb)bb.disabled=false}
  if(hint)hint.textContent=msg;
  if(selectedSignupSide==='red'&&signupRedFull)selectedSignupSide=null;
  if(selectedSignupSide==='blue'&&signupBlueFull)selectedSignupSide=null;
  if(rb)rb.classList.toggle('active',selectedSignupSide==='red');if(bb)bb.classList.toggle('active',selectedSignupSide==='blue');
  updateSignupFee();
}
function onSignupZoneChange(){checkSignupAvailability()}

function updateSignupFee(){
  var zone=document.getElementById('signupZone').value;
  var signups=matches.filter(function(m){return m.phase==='betting'&&!m.guessing_open&&m.zone===zone});
  var sf=document.getElementById('signupFee');var sfh=document.getElementById('signupFeeHint');
  if(signups.length===0){if(sf)sf.textContent='-';if(sfh)sfh.textContent='';return}
  var fee=0,balance=parseInt((scannedUser?scannedUser.gameCoin:'0').replace(/,/g,''))||0;
  if(sf)sf.textContent=fee;
  var btn=document.getElementById('signupConfirmBtn');
  if(fee>0&&balance<fee){if(sfh){sfh.textContent='余额不足(剩余'+balance+')，请先发放游戏币';sfh.style.color='var(--bad)'}if(btn){btn.disabled=true;btn.classList.remove('btn-purple');btn.classList.add('btn-outline');btn.style.opacity='0.4'}}
  else{if(sfh){sfh.textContent='余额充足('+balance+')';sfh.style.color='var(--good)'}if(btn){btn.disabled=false;btn.classList.add('btn-purple');btn.classList.remove('btn-outline');btn.style.opacity='1'}}
}

function selectSignupSide(side){if(side==='red'&&signupRedFull)return toastMsg('该区域红方已被占用');if(side==='blue'&&signupBlueFull)return toastMsg('该区域蓝方已被占用');if(side===selectedSignupSide){selectedSignupSide=null}else{selectedSignupSide=side}var rb=document.getElementById('signupRed'),bb=document.getElementById('signupBlue');if(rb)rb.classList.toggle('active',selectedSignupSide==='red');if(bb)bb.classList.toggle('active',selectedSignupSide==='blue')}
function confirmSignup(){if(!scannedUser)return toastMsg('请先扫码获取用户信息');if(!selectedSignupSide)return toastMsg('请选择红方或蓝方');var zone=document.getElementById('signupZone').value;var found=matches.filter(function(m){return m.phase==='betting'&&!m.guessing_open&&m.zone===zone});if(found.length===0)return toastMsg(zone+'暂无报名中的比赛');var fee=0,balance=parseInt(scannedUser.gameCoin.replace(/,/g,''))||0;if(balance<fee)return toastMsg('余额不足');if(fee>0)scannedUser.gameCoin=String(balance-fee);var now=new Date().toTimeString().slice(0,8);if(typeof signupQueues!=='undefined'){if(!signupQueues[zone])signupQueues[zone]=[];signupQueues[zone].push({name:scannedUser.name,time:now,side:selectedSignupSide});}found.forEach(function(m){if(selectedSignupSide==='red'&&!m.red)m.red=scannedUser.name;if(selectedSignupSide==='blue'&&!m.blue)m.blue=scannedUser.name});document.getElementById('scanAction').value='';document.getElementById('scanActionContent').innerHTML='';updateScanBalance();renderZones();toastMsg('已报名 '+zone+' · '+(selectedSignupSide==='red'?'红方':'蓝方'))}
function confirmGiveCoin(){if(giveIsCustom){var v=parseInt(document.getElementById('customGiveAmt').value)||0;if(v<1)return toastMsg('请输入有效的游戏币数量');giveCoinAmt=v}if(!giveCoinAmt)return toastMsg('请选择或输入发放金额');var reason=document.getElementById('giveReason').value;var note=document.getElementById('giveReasonNote').value.trim();var desc=reason?(reason+(note?'('+note+')':'')):'';toastMsg('已发放 '+giveCoinAmt+' 游戏币给 '+scannedUser.name+(desc?' · '+desc:''));document.getElementById('scanAction').value='';document.getElementById('scanActionContent').innerHTML='';giveCoinAmt=0;giveIsCustom=false;updateScanBalance()}
function confirmExchangeModal(){} // 旧版已废弃
