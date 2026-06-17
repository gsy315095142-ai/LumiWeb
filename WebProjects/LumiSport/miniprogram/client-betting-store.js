/**
 * LumiSport 客户端 - 门店切换与 Banner 广告
 */

function updateBannerAd() {
  var s = storeAds[clientStore] || storeAds['🏡 兰陵酒吧'];
  if (!s) return;
  var hotels = document.querySelectorAll('.hotel-ad');
  for (var i = 0; i < hotels.length; i++) {
    hotels[i].innerHTML = '<div class="hotel-ad-badge">' + s.hotel.badge + '</div><div class="hotel-ad-title">' + s.hotel.title + '</div><div class="hotel-ad-desc">' + s.hotel.desc + '</div>';
  }
  var tagTxt = (s.zones && s.zones[selectedZone]) ? s.zones[selectedZone] : s.tag;
  var tags = document.querySelectorAll('.ad-tag');
  for (var j = 0; j < tags.length; j++) tags[j].textContent = tagTxt;
}

function updateProfileStoreDisplay() {
  var el = document.getElementById('profileStoreName');
  if (el && typeof clientStore !== 'undefined') el.textContent = clientStore;
}

// 同步所有「门店名/大厅下拉」副本（首页 + 竞猜页共用）
function syncStoreChrome() {
  var vns = document.querySelectorAll('.venue-name');
  for (var i = 0; i < vns.length; i++) vns[i].textContent = clientStore;
  var zs = document.querySelectorAll('.zone-select');
  for (var k = 0; k < zs.length; k++) zs[k].value = selectedZone;
  var items = document.querySelectorAll('.store-menu-item');
  for (var n = 0; n < items.length; n++) items[n].classList.toggle('active', items[n].textContent.trim() === clientStore);
  updateProfileStoreDisplay();
}

function toggleStoreMenu(e, el) {
  if (e && e.stopPropagation) e.stopPropagation();
  var menus = document.querySelectorAll('.store-menu');
  var own = el ? el.parentNode.querySelector('.store-menu') : document.getElementById('storeMenu');
  for (var i = 0; i < menus.length; i++) {
    if (menus[i] === own) menus[i].classList.toggle('hidden');
    else menus[i].classList.add('hidden');
  }
}

function syncAdminStoreViews() {
  if (typeof updateVenueLabels === 'function') updateVenueLabels();
  if (typeof pageStack === 'undefined' || !pageStack.length) return;
  var cur = pageStack[pageStack.length - 1];
  if (cur === 'admin' && typeof renderAdminHub === 'function') renderAdminHub();
  if (cur === 'adminStore' && typeof renderStore === 'function') renderStore();
  if (cur === 'adminBills' && typeof renderBills === 'function') renderBills();
}

function selectClientStore(name) {
  clientStore = name;
  var menus = document.querySelectorAll('.store-menu');
  for (var i = 0; i < menus.length; i++) menus[i].classList.add('hidden');
  syncStoreChrome();
  updateBannerAd();
  renderBettingMatches();
  updateSignupBar();
  renderSignupView();
  syncAdminStoreViews();
  toastMsg('已切换到 ' + name);
}
