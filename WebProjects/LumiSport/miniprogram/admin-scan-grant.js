/**
 * 管理员端扫码 - 弹窗内发放游戏币
 */

function renderGiveContent(ct) {
  giveCoinAmt = 0;
  giveIsCustom = false;
  var h = '<div class="divider"></div><div class="bet-chips" style="margin:6px 0;"><span class="bet-chip" onclick="setGiveCoin(100)">100</span><span class="bet-chip" onclick="setGiveCoin(200)">200</span><span class="bet-chip" onclick="setGiveCoin(500)">500</span><span class="bet-chip" onclick="setGiveCoin(1000)">1000</span><span class="bet-chip" onclick="useCustomGive()">自定义</span></div>';
  h += '<div id="customGiveArea" class="hidden" style="margin:6px 0;"><input class="input" id="customGiveAmt" type="number" placeholder="手动输入金额" min="1" step="1" oninput="onCustomGive()"><div style="font-size:0.65em;color:var(--bad);min-height:14px;" id="giveHint"></div></div>';
  h += '<div style="margin-top:10px;"><label class="form-label">发放理由 <span style="color:var(--muted);">选填</span></label><select class="select" id="giveReason"><option value="">请选择理由</option><option>酒店入住</option><option>购买套餐</option><option>活动奖励</option><option>签到奖励</option><option>新手福利</option><option>补偿发放</option><option>其他</option></select></div>';
  h += '<div style="margin-top:6px;"><label class="form-label">补充说明 <span style="color:var(--muted);">选填</span></label><input class="input" id="giveReasonNote" type="text" placeholder="可选填写详细说明" maxlength="50"></div>';
  h += '<div class="flex-row" style="margin-top:10px;"><button class="btn btn-purple btn-sm" style="flex:1;" onclick="confirmGiveCoin()">确认发放</button></div>';
  ct.innerHTML = h;
}

function setGiveCoin(amt) {
  giveCoinAmt = amt;
  giveIsCustom = false;
  var cc = document.querySelectorAll('#giveCoinChips .bet-chip');
  for (var i = 0; i < cc.length; i++) cc[i].classList.remove('active');
  event.target.classList.add('active');
  var ca = document.getElementById('customGiveArea');
  if (ca) ca.classList.add('hidden');
  var ci = document.getElementById('customGiveAmt');
  if (ci) ci.value = '';
}

function useCustomGive() {
  giveIsCustom = true;
  giveCoinAmt = 0;
  var cc = document.querySelectorAll('#giveCoinChips .bet-chip');
  for (var i = 0; i < cc.length; i++) cc[i].classList.remove('active');
  event.target.classList.add('active');
  var ca = document.getElementById('customGiveArea');
  if (ca) ca.classList.remove('hidden');
  var ci = document.getElementById('customGiveAmt');
  if (ci) ci.focus();
}

function onCustomGive() {
  var v = parseInt(document.getElementById('customGiveAmt').value) || 0;
  var gh = document.getElementById('giveHint');
  if (gh) gh.textContent = (document.getElementById('customGiveAmt').value && v < 1) ? '请输入有效金额' : '';
  if (v >= 1) giveCoinAmt = v;
  else giveCoinAmt = 0;
}

function confirmGiveCoin() {
  if (giveIsCustom) {
    var v = parseInt(document.getElementById('customGiveAmt').value) || 0;
    if (v < 1) return toastMsg('请输入有效的游戏币数量');
    giveCoinAmt = v;
  }
  if (!giveCoinAmt) return toastMsg('请选择或输入发放金额');
  var reason = document.getElementById('giveReason').value;
  var note = document.getElementById('giveReasonNote').value.trim();
  var desc = reason ? (reason + (note ? '(' + note + ')' : '')) : '';
  toastMsg('已发放 ' + giveCoinAmt + ' 游戏币给 ' + scannedUser.name + (desc ? ' · ' + desc : ''));
  document.getElementById('scanAction').value = '';
  document.getElementById('scanActionContent').innerHTML = '';
  giveCoinAmt = 0;
  giveIsCustom = false;
  updateScanBalance();
}
