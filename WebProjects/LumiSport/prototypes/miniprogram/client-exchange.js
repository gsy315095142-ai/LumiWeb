/**
 * LumiSport 客户端 - 自助兑换（纯扫码版，双端通用）
 * 扫码 → 随机出商品 → 二次确认弹窗 → 扣礼品点数 → 记录
 */

// 商品数据（客户端与管理端共享，客户端没有 admin-products.js 时以此为后备）
if (typeof products === 'undefined') {
  var products = [
    { id:'p1', icon:'🍸', name:'特调鸡尾酒', cat:'酒水饮料', price:80, origPrice:128, stock:25, desc:'精选伏特加搭配青柠汁与蔓越莓' },
    { id:'p2', icon:'🥃', name:'威士忌 Shot', cat:'酒水饮料', price:50, origPrice:88, stock:15, desc:'苏格兰单一麦芽 12 年陈酿' },
    { id:'p3', icon:'🍺', name:'精酿啤酒', cat:'酒水饮料', price:30, origPrice:58, stock:48, desc:'比利时修道院风格精酿' },
    { id:'p4', icon:'🍷', name:'红酒一杯', cat:'酒水饮料', price:60, origPrice:98, stock:8, desc:'智利赤霞珠，单宁柔和' },
    { id:'p5', icon:'🥤', name:'冰镇可乐', cat:'酒水饮料', price:10, origPrice:20, stock:60, desc:'经典冰爽可乐' },
    { id:'p6', icon:'🍿', name:'爆米花', cat:'零食小吃', price:20, origPrice:38, stock:50, desc:'现爆焦糖爆米花' },
    { id:'p7', icon:'🧸', name:'限量手办', cat:'周边手办', price:200, origPrice:398, stock:3, desc:'LumiSport 联名限定款' },
    { id:'p8', icon:'🧦', name:'纪念毛巾', cat:'周边手办', price:40, origPrice:88, stock:20, desc:'赛事纪念运动毛巾' }
  ];
}

var exScannedProduct = null;

var EX_SCAN_PAGE = { scanBtnId:'exScanBtn', scannedInfoId:'exScannedInfo', coinBalanceId:'exCoinBalance' };
var EX_SCAN_MODAL = { scanBtnId:'exScanBtnModal', scannedInfoId:'exScannedInfoModal', coinBalanceId:'exCoinBalanceModal' };
var exScanUI = EX_SCAN_PAGE;

function bindExchangeScanUI(ids) {
  exScanUI = ids;
}

function exEl(key) {
  return document.getElementById(exScanUI[key + 'Id']);
}

function buildExchangeScanInnerHtml(opts) {
  opts = opts || {};
  var coin = typeof myExchangeCoin !== 'undefined' ? myExchangeCoin : 340;
  var h = '';
  h += '<div class="ex-balance-card">';
  h += '<div class="ex-balance-label" style="color:#888;">💎 我的礼品点数</div>';
  h += '<div class="ex-balance-val" id="' + exScanUI.coinBalanceId + '" style="color:#c4b5fd;">' + coin + '</div>';
  h += '</div>';
  if (opts.includeScanArea) {
    h += '<div class="ex-scan-area" id="' + exScanUI.scanBtnId + '" onclick="startClientProductScan()">';
    h += '<div class="ex-scan-icon">📲</div>';
    h += '<div class="ex-scan-text" style="color:#fff;">点击扫描商品条形码</div>';
    h += '<div class="ex-scan-sub" style="color:#888;">对准商品条形码，自动识别</div>';
    h += '</div>';
  }
  h += '<div id="' + exScanUI.scannedInfoId + '"></div>';
  return h;
}

function pickRandomExchangeProduct() {
  if (typeof products === 'undefined' || !products.length) {
    if (typeof toastMsg === 'function') toastMsg('暂无商品可兑换');
    return;
  }
  var p = products[Math.floor(Math.random() * products.length)];
  exScannedProduct = { icon: p.icon, name: p.name, price: p.price, origPrice: p.origPrice, desc: p.desc || '' };
  renderScannedProduct();
}

function renderExchangeScanInto(containerId, ids, opts) {
  opts = opts || {};
  bindExchangeScanUI(ids);
  var el = document.getElementById(containerId);
  if (!el) return;
  exScannedProduct = null;
  if (opts.includeScanArea === undefined) opts.includeScanArea = true;
  el.innerHTML = buildExchangeScanInnerHtml(opts);
  if (opts.autoPick) pickRandomExchangeProduct();
}

function renderClientExchange() {
  renderExchangeScanInto('clientExchangeBody', EX_SCAN_PAGE, { includeScanArea: true });
}

function openExchangeScanModal() {
  if (typeof isLoggedIn !== 'undefined' && !isLoggedIn) {
    if (typeof toastMsg === 'function') toastMsg('请先登录后再兑换');
    if (typeof showLogin === 'function') showLogin();
    return;
  }
  renderExchangeScanInto('exchangeScanBody', EX_SCAN_MODAL, { includeScanArea: false, autoPick: true });
  var m = document.getElementById('exchangeScanModal');
  if (m) m.classList.remove('hidden');
}

function closeExchangeScanModal() {
  exScannedProduct = null;
  var m = document.getElementById('exchangeScanModal');
  if (m) m.classList.add('hidden');
}

function refreshActiveExchangeScanUI() {
  var modal = document.getElementById('exchangeScanModal');
  if (modal && !modal.classList.contains('hidden')) {
    renderExchangeScanInto('exchangeScanBody', EX_SCAN_MODAL, { includeScanArea: false, autoPick: true });
    return;
  }
  if (document.getElementById('clientExchangeBody')) renderClientExchange();
}

function startClientProductScan() {
  var btn = exEl('scanBtn');
  if (!btn) return;
  if (typeof products === 'undefined' || !products.length) {
    toastMsg('暂无商品可兑换');
    return;
  }
  btn.innerHTML = '<div class="ex-scan-icon" style="animation:pulse 0.5s ease infinite alternate;">🔍</div><div class="ex-scan-text" style="color:#fff;">正在扫描...</div><div class="ex-scan-sub" style="color:#888;">请保持条码对准镜头</div>';
  btn.style.borderColor = 'rgba(7,193,96,0.5)';
  btn.style.background = 'linear-gradient(135deg,rgba(7,193,96,0.08),rgba(16,185,129,0.04))';
  btn.onclick = null;
  setTimeout(function () {
    var p = products[Math.floor(Math.random() * products.length)];
    exScannedProduct = { icon: p.icon, name: p.name, price: p.price, origPrice: p.origPrice, desc: p.desc || '' };
    renderScannedProduct();
    btn.innerHTML = '<div class="ex-scan-icon">✅</div><div class="ex-scan-text" style="color:#10b981;">已识别商品</div><div class="ex-scan-sub" style="color:#888;">点击重新扫描</div>';
    btn.style.borderColor = 'rgba(16,185,129,0.5)';
    btn.style.background = 'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(7,193,96,0.04))';
    btn.onclick = function () {
      exScannedProduct = null;
      var info = exEl('scannedInfo');
      if (info) info.innerHTML = '';
      resetScanBtn(btn);
    };
  }, 800);
}

function resetScanBtn(btn) {
  btn.innerHTML = '<div class="ex-scan-icon">📲</div><div class="ex-scan-text" style="color:#fff;">点击扫描商品条形码</div><div class="ex-scan-sub" style="color:#888;">对准商品条形码，自动识别</div>';
  btn.style.borderColor = 'rgba(167,139,250,0.35)';
  btn.style.background = 'linear-gradient(135deg,#0f162e,#1a0a1e)';
  btn.onclick = startClientProductScan;
}

function renderScannedProduct() {
  var el = exEl('scannedInfo');
  if (!el || !exScannedProduct) return;
  var coin = typeof myExchangeCoin !== 'undefined' ? myExchangeCoin : 340;
  var enough = coin >= exScannedProduct.price;
  var h = '<div class="ex-scanned-card" style="margin-top:12px;">';
  h += '<div class="ex-scanned-top">';
  h += '<div class="ex-scanned-icon">' + exScannedProduct.icon + '</div>';
  h += '<div class="ex-scanned-details">';
  h += '<div class="ex-scanned-name" style="color:#fff;">' + exScannedProduct.name + '</div>';
  h += '<div class="ex-scanned-desc" style="color:#999;">' + (exScannedProduct.desc || '') + '</div>';
  h += '<div class="ex-scanned-prices"><span class="esp-cost" style="color:#fbbf24;">' + exScannedProduct.price + ' 💎</span><span class="esp-orig" style="color:#777;">原价 ￥' + exScannedProduct.origPrice + '</span></div>';
  h += '</div></div>';
  if (enough) {
    h += '<button class="btn btn-purple btn-block" style="margin-top:12px;" onclick="askConfirmExchange()">✅ 确认兑换 · 扣除 ' + exScannedProduct.price + ' 💎</button>';
  } else {
    h += '<div style="text-align:center;padding:8px;font-size:0.78em;color:#f87171;">💎 礼品点数不足，当前余额 ' + coin + '，还需 ' + (exScannedProduct.price - coin) + ' 💎</div>';
    h += '<button class="btn btn-outline btn-block" disabled style="margin-top:4px;opacity:0.4;cursor:not-allowed;color:#999;">余额不足</button>';
  }
  h += '<button class="btn btn-outline btn-sm btn-block" style="margin-top:8px;color:#aaa;" onclick="cancelScannedProduct()">🔄 重新选择</button></div>';
  el.innerHTML = h;
}

function cancelScannedProduct() {
  var info = exEl('scannedInfo');
  if (info) info.innerHTML = '';
  var btn = exEl('scanBtn');
  if (btn) {
    exScannedProduct = null;
    resetScanBtn(btn);
  } else {
    pickRandomExchangeProduct();
  }
}

function askConfirmExchange() {
  if (!exScannedProduct) return;
  var icon = document.getElementById('confirmIcon');
  var msg = document.getElementById('confirmMsg');
  var okBtn = document.getElementById('confirmOk');
  if (icon) icon.textContent = '💎';
  if (msg) msg.innerHTML = '确认花费 <b style="color:#c4b5fd;">' + exScannedProduct.price + ' 💎</b> 兑换「<b style="color:#fbbf24;">' + exScannedProduct.icon + ' ' + exScannedProduct.name + '</b>」吗？';
  if (okBtn) {
    okBtn.textContent = '确认兑换';
    okBtn.style.background = 'linear-gradient(135deg,#7c3aed,#a855f7)';
  }
  pendingConfirm = confirmClientExchange;
  document.getElementById('confirmModal').classList.remove('hidden');
  document.getElementById('confirmModal').style.zIndex = '1000';
}

function confirmClientExchange() {
  document.getElementById('confirmModal').style.zIndex = '';
  if (!exScannedProduct) return;
  var coin = typeof myExchangeCoin !== 'undefined' ? myExchangeCoin : 340;
  if (coin < exScannedProduct.price) { toastMsg('礼品点数余额不足'); return; }
  var item = { icon: exScannedProduct.icon, name: exScannedProduct.name, price: exScannedProduct.price };
  if (typeof myExchangeCoin !== 'undefined') myExchangeCoin -= item.price;
  var now = new Date();
  function p(n) { return n < 10 ? '0' + n : '' + n; }
  var timeStr = now.getFullYear() + '-' + p(now.getMonth() + 1) + '-' + p(now.getDate()) + ' ' + p(now.getHours()) + ':' + p(now.getMinutes());
  if (typeof exchangeRecords !== 'undefined') {
    exchangeRecords.unshift({ time: timeStr, item: item.icon + ' ' + item.name, store: clientStore || '兰陵酒吧', cost: item.price });
  }
  exScannedProduct = null;
  updateClientExchangeCoinDisplay();
  if (typeof closeExchangeScanModal === 'function') closeExchangeScanModal();
  showExchangeSuccessModal(item);
}

function showExchangeSuccessModal(item) {
  var body = document.getElementById('exchangeSuccessBody');
  if (body) {
    body.innerHTML = '<div class="es-product">' + item.icon + ' ' + item.name + '</div>' +
      '<div class="es-cost">已扣除 <b style="color:#c4b5fd;">' + item.price + ' 💎</b> 礼品点数</div>' +
      '<div class="es-hint">商品将尽快为您准备，请留意门店通知</div>';
  }
  var m = document.getElementById('exchangeSuccessModal');
  if (m) {
    m.classList.remove('hidden');
    m.style.zIndex = '1100';
  }
}

function closeExchangeSuccessModal() {
  var m = document.getElementById('exchangeSuccessModal');
  if (m) {
    m.classList.add('hidden');
    m.style.zIndex = '';
  }
}

function updateClientExchangeCoinDisplay() {
  if (typeof updateAllCoinDisplays === 'function') updateAllCoinDisplays();
}
