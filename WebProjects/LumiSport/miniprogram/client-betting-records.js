/**
 * LumiSport 客户端 - 竞猜记录 / 预言家段位 / 兑换记录
 */

function getMyBet(mid, side) {
  var b = myBets[mid];
  return b && b[side] ? b[side] : 0;
}

function myBetTag(mid, side) {
  var amt = getMyBet(mid, side);
  return amt > 0 ? '<div class="my-bet-tag">已下注 ' + amt + ' 💰</div>' : '';
}

function renderBetHistory() {
  var listEl = document.getElementById('betHistoryList');
  if (listEl) {
    var html = '';
    betRecords.forEach(function (r) {
      var rs = r.result === 'win'
        ? '<span class="result-win">+' + r.ex + ' 💎</span>'
        : '<span class="result-lose">' + r.coin + ' 💰</span>';
      html += '<div class="history-item"><div class="hist-top"><span class="hist-match">' + r.game + ' · ' + r.zone + '</span>' + rs + '</div>';
      html += '<div class="hist-detail">📅 ' + r.date + ' &nbsp; 🕐 ' + r.time + ' &nbsp;|&nbsp; 🔴 <span class="player-nick-link" onclick="showPlayerStats(\'' + r.red + '\')">' + r.red + '</span> vs 🔵 <span class="player-nick-link" onclick="showPlayerStats(\'' + r.blue + '\')">' + r.blue + '</span></div></div>';
    });
    listEl.innerHTML = html;
  }
  var cardEl = document.getElementById('prophetCard');
  if (cardEl) {
    var total = betRecords.length;
    var wins = betRecords.filter(function (r) { return r.result === 'win'; }).length;
    var rate = total > 0 ? Math.round(wins / total * 100) : 0;
    var ti = 0;
    for (var i = 0; i < prophetTiers.length; i++) { if (total >= prophetTiers[i].min) ti = i; }
    var cur = prophetTiers[ti], next = prophetTiers[ti + 1];
    var pct, note;
    if (next) { pct = Math.min(100, Math.round(total / next.min * 100)); note = '距' + next.name + '还差 ' + (next.min - total) + ' 场'; }
    else { pct = 100; note = '🏆 已达最高段位'; }
    cardEl.innerHTML = '<div class="rank-icon">' + cur.icon + '</div><div class="rank-name">' + cur.name + '</div>'
      + '<div class="rank-note" style="margin-top:6px;">竞猜 ' + total + ' 场 · 猜中 ' + wins + ' 场 · 胜率 ' + rate + '%</div>'
      + '<div class="rank-bar"><div class="rank-fill" style="width:' + pct + '%;"></div></div>'
      + '<div class="rank-note">' + note + '</div>';
  }
}

function renderExchangeHistory() {
  var c = document.getElementById('exchangeHistoryList');
  if (!c) return;
  if (!exchangeRecords.length) {
    c.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--muted);font-size:0.85em;">📭 暂无兑换记录</div>';
    return;
  }
  var html = '';
  exchangeRecords.forEach(function (r) {
    html += '<div class="exh-item"><div class="exh-top"><span class="exh-name">' + r.item + '</span><span class="exh-cost">-' + r.cost + ' 💎</span></div><div class="exh-sub">🕐 ' + r.time + ' &nbsp;·&nbsp; 📍 ' + r.store + '</div></div>';
  });
  c.innerHTML = html;
}
