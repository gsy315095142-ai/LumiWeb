/**
 * LumiSport 客户端 - 选手数据弹窗
 */

function playerNickLink(name) {
  if (name === '本人' || !playerStats[name]) return name;
  return '<span class="player-nick-link" onclick="showPlayerStats(\'' + name + '\')">' + name + '</span>';
}

function showPlayerStats(name) {
  var ps = playerStats[name];
  if (!ps) return;
  var total = ps.wins + ps.losses;
  var rate = total > 0 ? Math.round(ps.wins / total * 100) : 0;
  document.getElementById('psAvatar').textContent = ps.side === 'red' ? '🔴' : '🔵';
  document.getElementById('psAvatar').className = 'player-stats-avatar ' + (ps.side === 'red' ? 'red' : 'blue');
  document.getElementById('psName').textContent = name;
  document.getElementById('psZone').textContent = '主厅：' + ps.zone;
  document.getElementById('psPoints').textContent = ps.points.toLocaleString();
  document.getElementById('psWinRate').textContent = rate + '%';
  document.getElementById('psWins').textContent = ps.wins + '胜';
  document.getElementById('psLosses').textContent = ps.losses + '负';
  var dots = '';
  ps.recent.forEach(function (r) {
    dots += '<div class="ps-dot ' + (r === 'win' ? 'win' : 'lose') + '">' + (r === 'win' ? '✓' : '✗') + '</div>';
  });
  document.getElementById('psRecent').innerHTML = dots;
  document.getElementById('playerStatsModal').classList.remove('hidden');
}
