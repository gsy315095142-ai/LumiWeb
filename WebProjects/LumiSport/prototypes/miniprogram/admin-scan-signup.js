/**
 * 管理员端扫码 - 弹窗内报名流程
 */

function renderSignupContent(ct) {
  selectedSignupSide = null;
  signupRedFull = false;
  signupBlueFull = false;
  var h = '<div class="divider"></div>';
  h += '<div style="margin-bottom:10px;"><label class="form-label">选择区域</label><select class="select" id="signupZone" onchange="onSignupZoneChange()"><option value="雷霆击剑厅">雷霆击剑厅</option><option value="烈焰拳王厅">烈焰拳王厅</option><option value="疾速冰球厅">疾速冰球厅</option></select></div>';
  h += '<div style="margin-bottom:10px;"><label class="form-label">选择阵营</label><div class="flex-row" style="gap:10px;"><button class="btn btn-sm side-btn side-red" style="flex:1;" id="signupRed" onclick="selectSignupSide(\'red\')">红方</button><button class="btn btn-sm side-btn side-blue" style="flex:1;" id="signupBlue" onclick="selectSignupSide(\'blue\')">蓝方</button></div><div class="bet-hint" id="signupSideHint"></div></div>';
  h += '<div class="readonly-row"><span class="form-label">报名费</span><span class="readonly-val" id="signupFee">0</span></div><div class="bet-hint" id="signupFeeHint"></div>';
  h += '<div class="flex-row" style="margin-top:10px;"><button class="btn btn-purple btn-sm" style="flex:1;" id="signupConfirmBtn" onclick="confirmSignup()">确认报名</button></div>';
  ct.innerHTML = h;
  checkSignupAvailability();
}

function checkSignupAvailability() {
  var zone = document.getElementById('signupZone').value;
  var signups = matches.filter(function (m) { return m.phase === 'betting' && !m.guessing_open && m.zone === zone; });
  var hasMatch = signups.length > 0;
  signupRedFull = hasMatch && signups.every(function (m) { return m.red !== null; });
  signupBlueFull = hasMatch && signups.every(function (m) { return m.blue !== null; });
  var rb = document.getElementById('signupRed');
  var bb = document.getElementById('signupBlue');
  var hint = document.getElementById('signupSideHint');
  var msg = '';
  if (!hasMatch) {
    if (rb) { rb.classList.add('locked'); rb.disabled = true; }
    if (bb) { bb.classList.add('locked'); bb.disabled = true; }
    if (hint) hint.textContent = '该区域暂无报名中的比赛';
    var sfh = document.getElementById('signupFeeHint');
    if (sfh) sfh.textContent = '';
    return;
  }
  if (rb) rb.disabled = false;
  if (bb) bb.disabled = false;
  if (signupRedFull) { if (rb) { rb.classList.add('locked'); rb.disabled = true; } msg = '红方已满 '; }
  else { if (rb) { rb.classList.remove('locked'); rb.disabled = false; } }
  if (signupBlueFull) { if (bb) { bb.classList.add('locked'); bb.disabled = true; } msg += '蓝方已满'; }
  else { if (bb) { bb.classList.remove('locked'); bb.disabled = false; } }
  if (hint) hint.textContent = msg;
  if (selectedSignupSide === 'red' && signupRedFull) selectedSignupSide = null;
  if (selectedSignupSide === 'blue' && signupBlueFull) selectedSignupSide = null;
  if (rb) rb.classList.toggle('active', selectedSignupSide === 'red');
  if (bb) bb.classList.toggle('active', selectedSignupSide === 'blue');
  updateSignupFee();
}

function onSignupZoneChange() { checkSignupAvailability(); }

function updateSignupFee() {
  var zone = document.getElementById('signupZone').value;
  var signups = matches.filter(function (m) { return m.phase === 'betting' && !m.guessing_open && m.zone === zone; });
  var sf = document.getElementById('signupFee');
  var sfh = document.getElementById('signupFeeHint');
  if (signups.length === 0) {
    if (sf) sf.textContent = '-';
    if (sfh) sfh.textContent = '';
    return;
  }
  var fee = 0;
  var balance = parseInt((scannedUser ? scannedUser.gameCoin : '0').replace(/,/g, '')) || 0;
  if (sf) sf.textContent = fee;
  var btn = document.getElementById('signupConfirmBtn');
  if (fee > 0 && balance < fee) {
    if (sfh) { sfh.textContent = '余额不足(剩余' + balance + ')，请先发放游戏币'; sfh.style.color = 'var(--bad)'; }
    if (btn) { btn.disabled = true; btn.classList.remove('btn-purple'); btn.classList.add('btn-outline'); btn.style.opacity = '0.4'; }
  } else {
    if (sfh) { sfh.textContent = '余额充足(' + balance + ')'; sfh.style.color = 'var(--good)'; }
    if (btn) { btn.disabled = false; btn.classList.add('btn-purple'); btn.classList.remove('btn-outline'); btn.style.opacity = '1'; }
  }
}

function selectSignupSide(side) {
  if (side === 'red' && signupRedFull) return toastMsg('该区域红方已被占用');
  if (side === 'blue' && signupBlueFull) return toastMsg('该区域蓝方已被占用');
  if (side === selectedSignupSide) selectedSignupSide = null;
  else selectedSignupSide = side;
  var rb = document.getElementById('signupRed');
  var bb = document.getElementById('signupBlue');
  if (rb) rb.classList.toggle('active', selectedSignupSide === 'red');
  if (bb) bb.classList.toggle('active', selectedSignupSide === 'blue');
}

function confirmSignup() {
  if (!scannedUser) return toastMsg('请先扫码获取用户信息');
  if (!selectedSignupSide) return toastMsg('请选择红方或蓝方');
  var zone = document.getElementById('signupZone').value;
  var found = matches.filter(function (m) { return m.phase === 'betting' && !m.guessing_open && m.zone === zone; });
  if (found.length === 0) return toastMsg(zone + '暂无报名中的比赛');
  var fee = 0;
  var balance = parseInt(scannedUser.gameCoin.replace(/,/g, '')) || 0;
  if (balance < fee) return toastMsg('余额不足');
  if (fee > 0) scannedUser.gameCoin = String(balance - fee);
  var now = new Date().toTimeString().slice(0, 8);
  if (typeof signupQueues !== 'undefined') {
    if (!signupQueues[zone]) signupQueues[zone] = [];
    signupQueues[zone].push({ name: scannedUser.name, time: now, side: selectedSignupSide });
  }
  found.forEach(function (m) {
    if (selectedSignupSide === 'red' && !m.red) m.red = scannedUser.name;
    if (selectedSignupSide === 'blue' && !m.blue) m.blue = scannedUser.name;
  });
  document.getElementById('scanAction').value = '';
  document.getElementById('scanActionContent').innerHTML = '';
  updateScanBalance();
  renderZones();
  toastMsg('已报名 ' + zone + ' · ' + (selectedSignupSide === 'red' ? '红方' : '蓝方'));
}
