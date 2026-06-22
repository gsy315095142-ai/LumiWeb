/**
 * 管理员端扫码 - 发放游戏币专属页（adminGiveCoin Tab）
 */

function renderAdminGiveCoin() {
  var el = document.getElementById('adminGiveBody');
  if (!el) return;
  var h = '';
  if (!givePageUser) {
    h += '<div class="card give-scan-card"><div class="give-scan-frame"><div class="give-scan-icon">📲</div><p style="color:var(--muted);font-size:0.82em;margin:10px 0 16px;text-align:center;">扫描用户「我的」页身份码<br>确认后发放游戏币</p><button class="btn btn-purple btn-block" onclick="scanGivePageUser()">📲 扫描用户身份码</button></div></div>';
  } else {
    h += '<div class="card"><h3>👤 用户信息</h3><div class="scan-user-info" style="margin:0;"><div class="avatar">👁</div><div class="name">' + givePageUser.name + '</div><div class="scan-user-coins"><span style="color:#fbbf24;">💰 游戏币 <strong>' + givePageUser.gameCoin + '</strong></span><span style="color:#c4b5fd;">💎 兑换值 <strong>' + givePageUser.exCoin + '</strong></span></div></div><button class="btn btn-outline btn-sm btn-block" style="margin-top:10px;color:#fff;" onclick="rescanGivePageUser()">🔄 重新扫描</button></div>';
    h += '<div class="card"><h3>💰 发放金额</h3><div class="bet-chips" id="givePageChips"><span class="bet-chip" onclick="setGivePageCoin(100)">100</span><span class="bet-chip" onclick="setGivePageCoin(200)">200</span><span class="bet-chip" onclick="setGivePageCoin(500)">500</span><span class="bet-chip" onclick="setGivePageCoin(1000)">1000</span><span class="bet-chip" onclick="useCustomGivePage()">自定义</span></div>';
    h += '<div id="givePageCustomArea" class="hidden" style="margin-top:8px;"><input class="input" id="givePageCustomAmt" type="number" placeholder="手动输入金额" min="1" step="1" oninput="onCustomGivePage()"><div class="bet-hint" id="givePageHint"></div></div>';
    h += '<div style="margin-top:12px;"><label class="form-label">发放理由 <span style="color:var(--muted);">选填</span></label><select class="select" id="givePageReason"><option value="">请选择理由</option><option>酒店入住</option><option>购买套餐</option><option>活动奖励</option><option>签到奖励</option><option>新手福利</option><option>补偿发放</option><option>其他</option></select></div>';
    h += '<div style="margin-top:8px;"><label class="form-label">补充说明 <span style="color:var(--muted);">选填</span></label><input class="input" id="givePageReasonNote" type="text" placeholder="可选填写详细说明" maxlength="50"></div>';
    h += '<button class="btn btn-purple btn-block" style="margin-top:14px;" onclick="confirmGivePageCoin()">✅ 确认发放</button></div>';
  }
  el.innerHTML = h;
}

function scanGivePageUser() {
  var name = randomNames[Math.floor(Math.random() * randomNames.length)];
  var coin = Math.floor(Math.random() * 2000) + 100;
  var ex = Math.floor(Math.random() * 500) + 50;
  givePageUser = { name: name, gameCoin: String(coin), exCoin: String(ex) };
  givePageAmt = 0;
  givePageIsCustom = false;
  renderAdminGiveCoin();
}

function rescanGivePageUser() {
  givePageUser = null;
  givePageAmt = 0;
  givePageIsCustom = false;
  renderAdminGiveCoin();
}

function setGivePageCoin(amt) {
  givePageAmt = amt;
  givePageIsCustom = false;
  var chips = document.querySelectorAll('#givePageChips .bet-chip');
  for (var i = 0; i < chips.length; i++) chips[i].classList.remove('active');
  event.target.classList.add('active');
  var ca = document.getElementById('givePageCustomArea');
  if (ca) ca.classList.add('hidden');
  var ci = document.getElementById('givePageCustomAmt');
  if (ci) ci.value = '';
  var gh = document.getElementById('givePageHint');
  if (gh) gh.textContent = '';
}

function useCustomGivePage() {
  givePageIsCustom = true;
  givePageAmt = 0;
  var chips = document.querySelectorAll('#givePageChips .bet-chip');
  for (var i = 0; i < chips.length; i++) chips[i].classList.remove('active');
  event.target.classList.add('active');
  var ca = document.getElementById('givePageCustomArea');
  if (ca) ca.classList.remove('hidden');
  var ci = document.getElementById('givePageCustomAmt');
  if (ci) ci.focus();
}

function onCustomGivePage() {
  var v = parseInt(document.getElementById('givePageCustomAmt').value) || 0;
  var gh = document.getElementById('givePageHint');
  if (gh) gh.textContent = (document.getElementById('givePageCustomAmt').value && v < 1) ? '请输入有效金额' : '';
  if (v >= 1) givePageAmt = v;
  else givePageAmt = 0;
}

function confirmGivePageCoin() {
  if (!givePageUser) return toastMsg('请先扫描用户身份码');
  if (givePageIsCustom) {
    var v = parseInt(document.getElementById('givePageCustomAmt').value) || 0;
    if (v < 1) return toastMsg('请输入有效的游戏币数量');
    givePageAmt = v;
  }
  if (!givePageAmt) return toastMsg('请选择或输入发放金额');
  var reasonEl = document.getElementById('givePageReason');
  var noteEl = document.getElementById('givePageReasonNote');
  var reason = reasonEl ? reasonEl.value : '';
  var note = noteEl ? noteEl.value.trim() : '';
  var userName = givePageUser.name;
  var amt = givePageAmt;
  showConfirm('确定向 ' + userName + ' 发放 ' + amt + ' 💰 游戏币吗？', function () {
    var desc = reason ? (reason + (note ? '(' + note + ')' : '')) : '管理员发放';
    toastMsg('✅ 已发放 ' + amt + ' 游戏币给 ' + userName + (reason ? ' · ' + desc : ''));
    givePageUser = null;
    givePageAmt = 0;
    givePageIsCustom = false;
    renderAdminGiveCoin();
  });
}
