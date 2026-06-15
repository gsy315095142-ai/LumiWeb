/**
 * 管理员端扫码 - 扫码弹窗入口与操作分发
 */

function simulateScan() {
  var name = randomNames[Math.floor(Math.random() * randomNames.length)];
  var coin = Math.floor(Math.random() * 2000) + 100;
  var ex = Math.floor(Math.random() * 500) + 50;
  scannedUser = { name: name, gameCoin: String(coin), exCoin: String(ex) };
  giveCoinAmt = 0;
  giveIsCustom = false;
  var cc = document.querySelectorAll('#giveCoinChips .bet-chip');
  for (var i = 0; i < cc.length; i++) cc[i].classList.remove('active');
  var ca = document.getElementById('customGiveArea');
  if (ca) ca.classList.add('hidden');
  var ci = document.getElementById('customGiveAmt');
  if (ci) ci.value = '';
  var gh = document.getElementById('giveHint');
  if (gh) gh.textContent = '';
  document.getElementById('scanAction').value = '';
  document.getElementById('scanActionContent').innerHTML = '';
  document.getElementById('scanModal').classList.remove('hidden');
  updateScanBalance();
  var nameEls = document.querySelectorAll('#scanModal .name');
  for (var j = 0; j < nameEls.length; j++) nameEls[j].textContent = name;
}

function onScanAction() {
  var v = document.getElementById('scanAction').value;
  var ct = document.getElementById('scanActionContent');
  if (v === 'signup') renderSignupContent(ct);
  else if (v === 'give') renderGiveContent(ct);
  else if (v === 'exchange') renderExchangeContentNew(ct);
  else ct.innerHTML = '';
}

function updateScanBalance() {
  if (!scannedUser) return;
  var el = document.querySelector('#scanModal .scan-user-coins');
  if (el) {
    el.innerHTML = '<span style="color:#fbbf24;">游戏币 <strong>' + scannedUser.gameCoin + '</strong></span><span style="color:#c4b5fd;">兑换币 <strong>' + scannedUser.exCoin + '</strong></span>';
  }
}
