/**
 * 管理员端扫码 - 双扫码兑换流程
 */

function renderExchangeContentNew(ct) {
  ct.innerHTML = '<div class="divider"></div><div style="text-align:center;padding:16px 0;"><p style="color:var(--muted);font-size:0.82em;margin-bottom:12px;">兑换需两步扫码</p><div class="two-scan-steps"><div class="scan-step-num">1</div><span style="color:#ccc;font-size:0.78em;">扫商品条形码</span></div><div class="two-scan-steps" style="margin-top:6px;"><div class="scan-step-num">2</div><span style="color:#ccc;font-size:0.78em;">扫用户身份码</span></div><button class="btn btn-purple btn-sm" style="width:100%;margin-top:14px;" onclick="startExchangeFlow()">🛅 开始兑换流程</button></div>';
}

function startExchangeFlow() {
  document.getElementById('scanModal').classList.add('hidden');
  exScanStep = 1;
  exScannedProduct = null;
  exScannedUser = null;
  document.getElementById('exchangeScanTitle').textContent = '🛅 兑换 · 步骤 1/2';
  document.getElementById('exchangeScanStep').innerHTML = '<div style="text-align:center;padding:20px 0;"><div class="scan-step-icon">📦</div><p style="color:#ccc;margin:10px 0;font-size:0.85em;">请扫描<span style="color:#fbbf24;">商品条形码</span></p><button class="btn btn-purple" style="width:auto;display:inline-block;padding:10px 28px;" onclick="simulateProductScan()">📲 模拟扫商品码</button></div>';
  document.getElementById('exchangeScanModal').classList.remove('hidden');
}

function simulateProductScan() {
  if (exScanStep !== 1) return;
  var p = products[Math.floor(Math.random() * products.length)];
  exScannedProduct = { icon: p.icon, name: p.name, price: p.price, origPrice: p.origPrice, desc: p.desc };
  exScanStep = 2;
  document.getElementById('exchangeScanTitle').textContent = '🛅 兑换 · 步骤 2/2';
  document.getElementById('exchangeScanStep').innerHTML = '<div style="text-align:center;padding:12px 0;"><div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:14px;margin-bottom:16px;border:1px solid var(--accent2);"><div style="font-size:1.5em;">' + exScannedProduct.icon + '</div><div style="color:#fff;font-weight:600;font-size:0.85em;">' + exScannedProduct.name + '</div><div style="color:var(--muted);font-size:0.68em;margin-top:2px;">' + exScannedProduct.desc + '</div><div style="margin-top:4px;"><span style="color:var(--accent2);font-weight:700;">' + exScannedProduct.price + ' 💎</span><span style="text-decoration:line-through;color:var(--muted);font-size:0.65em;margin-left:4px;">￥' + exScannedProduct.origPrice + '</span></div></div><div class="scan-step-icon">👤</div><p style="color:#ccc;margin:10px 0;font-size:0.85em;">请扫描<span style="color:#c4b5fd;">用户身份码</span></p><button class="btn btn-purple" style="width:auto;display:inline-block;padding:10px 28px;" onclick="simulateUserScan()">📲 模拟扫用户码</button></div>';
}

function simulateUserScan() {
  if (exScanStep !== 2 || !exScannedProduct) return;
  var name = randomNames[Math.floor(Math.random() * randomNames.length)];
  var coin = Math.floor(Math.random() * 2000) + 100;
  var ex = Math.floor(Math.random() * 500) + 50;
  exScannedUser = { name: name, gameCoin: String(coin), exCoin: String(ex) };
  exScanStep = 3;
  document.getElementById('exchangeScanTitle').textContent = '🛅 兑换 · 确认核销';
  document.getElementById('exchangeScanStep').innerHTML = '<div style="text-align:center;padding:12px 0;"><div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:14px;margin-bottom:10px;border:1px solid var(--accent2);"><div style="font-size:1.5em;">' + exScannedProduct.icon + '</div><div style="color:#fff;font-weight:600;font-size:0.85em;">' + exScannedProduct.name + '</div><div style="margin-top:4px;"><span style="color:var(--accent2);font-weight:700;">' + exScannedProduct.price + ' 💎</span><span style="text-decoration:line-through;color:var(--muted);font-size:0.65em;margin-left:4px;">￥' + exScannedProduct.origPrice + '</span></div></div><div class="divider"></div><div style="color:#ccc;font-size:0.85em;"><strong>' + exScannedUser.name + '</strong></div><div style="color:var(--muted);font-size:0.7em;">💰 游戏币: ' + exScannedUser.gameCoin + ' | 💎 兑换值: ' + exScannedUser.exCoin + '</div><div class="divider"></div><button class="btn btn-purple btn-block" onclick="confirmExchange2()">✅ 确认核销 · 扣除 ' + exScannedProduct.price + ' 💎</button></div>';
}

function confirmExchange2() {
  if (!exScannedProduct || !exScannedUser) return;
  toastMsg('🎁 核销成功！' + exScannedUser.name + ' 兑换 ' + exScannedProduct.name + ' · 扣除 ' + exScannedProduct.price + ' 💎');
  document.getElementById('exchangeScanModal').classList.add('hidden');
  exScanStep = 0;
  exScannedProduct = null;
  exScannedUser = null;
}

function renderExchangeContent(ct) {} // 旧版已废弃
function confirmExchangeModal() {} // 旧版已废弃
