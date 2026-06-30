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
grantedPlayerPool.push({ name: '雷鹰',     points: 420,  coin: 90 });
grantedPlayerPool.push({ name: '冰狼',     points: 400,  coin: 80 });
grantedPlayerPool.push({ name: '风隼',     points: 380,  coin: 70 });
grantedPlayerPool.push({ name: '毒蛇',     points: 350,  coin: 60 });
grantedPlayerPool.push({ name: '狂鲨',     points: 330,  coin: 50 });
grantedPlayerPool.push({ name: '猛虎',     points: 310,  coin: 50 });
grantedPlayerPool.push({ name: '金刚',     points: 290,  coin: 40 });
grantedPlayerPool.push({ name: '暴熊',     points: 270,  coin: 40 });
grantedPlayerPool.push({ name: '野狼',     points: 250,  coin: 30 });
grantedPlayerPool.push({ name: '灵鹿',     points: 230,  coin: 30 });
grantedPlayerPool.push({ name: '蛮猪',     points: 210,  coin: 20 });
grantedPlayerPool.push({ name: '飞兔',     points: 190,  coin: 20 });
grantedPlayerPool.push({ name: '狐影',     points: 170,  coin: 10 });
grantedPlayerPool.push({ name: '灵猫',     points: 150,  coin: 10 });
grantedPlayerPool.push({ name: '钻地鼠',   points: 130,  coin: 5 });

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
