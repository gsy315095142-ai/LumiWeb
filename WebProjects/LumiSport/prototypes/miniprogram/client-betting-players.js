/**
 * LumiSport 客户端 - 选手数据弹窗
 */

function escPlayerName(n) {
  return String(n).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function seedFromName(name) {
  var h = 0;
  for (var i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return h >>> 0;
}

function seededRand(seed) {
  seed = (seed * 9301 + 49297) % 233280;
  return { value: seed / 233280, seed: seed };
}

function generatePlayerStats(name, hint) {
  hint = hint || {};
  var r = seededRand(seedFromName(name));
  function next() {
    r = seededRand(r.seed);
    return r.value;
  }
  var wins = Math.floor(next() * 38) + 10;
  var losses = Math.floor(next() * 22) + 6;
  var points = Math.floor(next() * 1400) + 450;
  var recent = [];
  for (var i = 0; i < 5; i++) recent.push(next() > 0.42 ? 'win' : 'lose');
  var zones = ['疾速冰球厅', '雷霆击剑厅', '烈焰拳王厅'];
  var zone = hint.zone || zones[Math.floor(next() * zones.length)];
  var side = hint.side === 'red' || hint.side === 'blue' ? hint.side : (next() > 0.5 ? 'red' : 'blue');
  return { points: points, wins: wins, losses: losses, recent: recent, zone: zone, side: side };
}

function findPlayerQueueHint(name) {
  if (typeof signupQueues !== 'undefined') {
    for (var zone in signupQueues) {
      if (!signupQueues[zone]) continue;
      for (var i = 0; i < signupQueues[zone].length; i++) {
        if (signupQueues[zone][i].name === name) {
          return { zone: zone, side: signupQueues[zone][i].side };
        }
      }
    }
  }
  if (name === '本人' && typeof selectedZone !== 'undefined') {
    return { zone: selectedZone, side: null };
  }
  return {};
}

function getPlayerStats(name) {
  if (playerStats[name]) return playerStats[name];
  var ps = generatePlayerStats(name, findPlayerQueueHint(name));
  playerStats[name] = ps;
  return ps;
}

function showPlayerStats(name) {
  var ps = getPlayerStats(name);
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

function playerNickLink(name) {
  if (name === '本人') return name;
  return '<span class="player-nick-link" onclick="showPlayerStats(\'' + escPlayerName(name) + '\')">' + name + '</span>';
}
