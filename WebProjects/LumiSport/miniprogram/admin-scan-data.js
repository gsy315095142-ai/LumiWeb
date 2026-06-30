/**
 * 管理员端扫码 - 演示数据与状态
 */

var randomNames = ['小明','阿强','大飞','老王','杰哥','阿豪','小胖','KK','老周','铁拳陈','剑圣','刀锋','火神','岩魔','闪电赵'];

var exScanStep = 0;
var exScannedProduct = null;
var exScannedUser = null;

var givePageUser = null;
var givePageAmt = 0;
var givePageIsCustom = false;

/* ============================================
   匹配报名 - 发放玩家池
   每天凌晨 0 点自动刷新（原型中手动重置模拟）
   ============================================ */

/** 发放玩家池：管理员扫码发放预测币后自动入池 */
var grantedPlayerPool = [];

// 预置演示数据
grantedPlayerPool.push({ name: '铁拳陈',   points: 1420, coin: 1000 });
grantedPlayerPool.push({ name: '剑圣',     points: 1350, coin: 800 });
grantedPlayerPool.push({ name: '火神',     points: 1180, coin: 600 });
grantedPlayerPool.push({ name: '岩魔',     points: 860,  coin: 500 });
grantedPlayerPool.push({ name: '闪电赵',   points: 790,  coin: 500 });
grantedPlayerPool.push({ name: '刀锋',     points: 720,  coin: 400 });
grantedPlayerPool.push({ name: 'KK',       points: 650,  coin: 300 });
grantedPlayerPool.push({ name: '阿豪',     points: 580,  coin: 200 });
grantedPlayerPool.push({ name: '杰哥',     points: 510,  coin: 200 });
grantedPlayerPool.push({ name: '大飞',     points: 440,  coin: 100 });

/**
 * 发放成功后入池
 * @param {string} name   玩家昵称
 * @param {number} points 积分（原型中用发放金额模拟）
 * @param {number} coin   发放的预测币数额
 */
function addToGrantedPool(name, points, coin) {
  var existing = grantedPlayerPool.find(function(p) { return p.name === name; });
  if (existing) {
    existing.points += points;
    existing.coin += coin;
  } else {
    grantedPlayerPool.push({
      name: name,
      points: points,
      coin: coin
    });
  }
}

/**
 * 按厅/区域过滤玩家池
 * （原型中按 zone 参数预留，当前不实际过滤）
 * @param {string} zone 区域名
 * @returns {Array} 过滤后的玩家列表
 */
function getPoolForZone(zone) {
  return grantedPlayerPool.slice();
}

/**
 * 手动清空玩家池（模拟每日凌晨 0 点刷新）
 */
function resetGrantedPool() {
  grantedPlayerPool = [];
}

/**
 * 移除池中指定玩家
 * @param {string} name 玩家昵称
 */
function removeFromGrantedPool(name) {
  grantedPlayerPool = grantedPlayerPool.filter(function(p) { return p.name !== name; });
}

/** 获取池中人数 */
function getPoolSize() {
  return grantedPlayerPool.length;
}
