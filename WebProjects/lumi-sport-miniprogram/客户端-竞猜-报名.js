/**
 * LumiSport 客户端 - 报名队列与报名流程
 */

function signupNowTime() {
  var d = new Date();
  function p(n) { return n < 10 ? '0' + n : '' + n; }
  return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}

function updateMyCoinDisplay() {
  var el = document.getElementById('myGameCoinVal');
  if (el) el.textContent = myGameCoin.toLocaleString();
}

function getZoneSignupInfo(zone) {
  var info = signupInfo[zone] || { game: '', fee: 0 };
  var q = signupQueues[zone] || [];
  return { game: info.game, fee: info.fee, queueCount: q.length };
}

function getMyQueuePos(zone) {
  if (!mySignup || mySignup.zone !== zone) return -1;
  var q = signupQueues[zone] || [];
  for (var i = 0; i < q.length; i++) { if (q[i].name === '本人') return i + 1; }
  return q.length;
}

function updateSignupBar() {
  var bar = document.getElementById('signupBar');
  if (!bar) return;
  var zone = selectedZone;
  bar.classList.remove('hidden');
  var info = getZoneSignupInfo(zone);
  var emojiMap = { '疾速冰球厅': '🏒', '雷霆击剑厅': '⚔️', '烈焰拳王厅': '🔥' };
  var emoji = emojiMap[zone] || '🏟️';
  var elZone = document.getElementById('signupBarZone');
  var elCount = document.getElementById('signupQueueCount');
  var elMeta = document.getElementById('signupBarMeta');
  var btn = document.getElementById('signupBarBtn');
  if (elZone) elZone.textContent = emoji + ' ' + zone;
  if (elCount) elCount.textContent = info.queueCount;
  if (!btn) return;
  if (mySignup && mySignup.zone === zone) {
    var pos = getMyQueuePos(zone);
    btn.textContent = '取消报名';
    btn.classList.add('done');
    if (elMeta) elMeta.innerHTML = '报名费 <span>' + info.fee + ' 💰</span> · 排队 <strong>' + info.queueCount + '</strong> 人<span class="signup-my-pos">排名 <strong>' + pos + '/' + info.queueCount + '</strong></span>';
  } else {
    btn.textContent = '✋ 一键报名';
    btn.classList.remove('done');
    if (elMeta) elMeta.innerHTML = '报名费 <span>' + info.fee + ' 💰</span> · 排队 <strong id="signupQueueCount">' + info.queueCount + '</strong> 人';
  }
}

function renderSignupView() {
  var panel = document.getElementById('signupPanel');
  if (!panel) return;
  var zone = selectedZone;
  var info = getZoneSignupInfo(zone);
  var emojiMap = { '疾速冰球厅': '🏒', '雷霆击剑厅': '⚔️', '烈焰拳王厅': '🔥' };
  var emoji = emojiMap[zone] || '🏟️';
  var q = signupQueues[zone] || [];
  var signedUp = mySignup && mySignup.zone === zone;
  var pos = signedUp ? getMyQueuePos(zone) : 0;
  var h = '<div class="signup-panel-card">';
  h += '<div class="sp-head"><div class="sp-zone">' + emoji + ' ' + zone + '</div><div class="sp-game">' + info.game + '</div></div>';
  h += '<div class="sp-stats"><div class="sp-stat"><div class="sp-val">' + info.fee + ' 💰</div><div class="sp-lbl">报名费</div></div><div class="sp-stat"><div class="sp-val">' + info.queueCount + '</div><div class="sp-lbl">排队人数</div></div>';
  if (signedUp) h += '<div class="sp-stat"><div class="sp-val" style="color:#fbbf24;">' + pos + '/' + info.queueCount + '</div><div class="sp-lbl">我的排名</div></div>';
  h += '</div>';
  if (signedUp) h += '<button class="signup-bar-btn done" style="width:100%;" onclick="toggleSignup()">取消报名</button>';
  else h += '<button class="signup-bar-btn" style="width:100%;" onclick="toggleSignup()">✋ 一键报名</button>';
  h += '</div>';
  h += '<div class="section-title" style="margin-top:14px;">📋 当前排队（' + q.length + '人）</div>';
  if (q.length > 0) {
    h += '<div class="sp-queue">';
    q.forEach(function (p, idx) {
      var sb = p.side === 'red' ? '🔴' : (p.side === 'blue' ? '🔵' : '⚪');
      var me = p.name === '本人' ? ' sp-q-me' : '';
      var nameHtml = (p.name !== '本人' && playerStats[p.name])
        ? '<span class="player-nick-link" onclick="showPlayerStats(\'' + p.name + '\')">' + p.name + '</span>'
        : p.name;
      h += '<div class="sp-q-item' + me + '"><div class="sp-q-pos">' + (idx + 1) + '</div><div class="sp-q-name">' + sb + ' ' + nameHtml + '</div><div class="sp-q-time">' + p.time + '</div></div>';
    });
    h += '</div>';
  } else {
    h += '<div class="queue-empty" style="text-align:center;padding:16px;color:var(--muted);font-size:0.8em;">暂无排队选手</div>';
  }
  panel.innerHTML = h;
}

function toggleSignup() {
  if (!isLoggedIn) { toastMsg('请先登录后再报名'); showLogin(); return; }
  if (mySignup && mySignup.zone === selectedZone) {
    cancelSignup();
  } else {
    var info = signupInfo[selectedZone];
    if (!info) { toastMsg('当前大厅暂无可报名场次'); return; }
    var fee = info.fee || 0;
    if (fee > 0 && myGameCoin < fee) { toastMsg('游戏币余额不足，报名需 ' + fee + ' 💰'); return; }
    if (fee > 0 && typeof showConfirm === 'function') {
      showConfirm('报名「' + info.game + '」需支付报名费 ' + fee + ' 💰（当前余额 ' + myGameCoin.toLocaleString() + ' 💰），确认报名？', doSignup);
    } else {
      doSignup();
    }
  }
}

function doSignup() {
  var zone = selectedZone;
  var info = signupInfo[zone];
  if (!info) { toastMsg('当前大厅暂无可报名场次'); return; }
  var fee = info.fee || 0;
  if (myGameCoin < fee) { toastMsg('游戏币余额不足，报名需 ' + fee + ' 💰'); return; }
  if (!signupQueues[zone]) signupQueues[zone] = [];
  var q = signupQueues[zone];
  var exists = q.some(function (p) { return p.name === '本人'; });
  if (!exists) q.push({ name: '本人', time: signupNowTime(), side: null });
  if (fee > 0) { myGameCoin -= fee; updateMyCoinDisplay(); }
  mySignup = { game: info.game, zone: zone, fee: fee };
  updateSignupBar();
  renderSignupView();
  if (typeof refreshQueueViews === 'function') refreshQueueViews();
  toastMsg(fee > 0 ? ('✅ 报名成功，已扣除报名费 ' + fee + ' 💰') : '✅ 报名成功，等待管理员安排上场');
}

function confirmCancelSignup() {
  if (!mySignup) return;
  var fee = mySignup.fee || 0;
  var msg = '取消报名将退还报名费 ' + fee + ' 💰，确认取消？';
  if (typeof showConfirm === 'function') showConfirm(msg, cancelSignup);
  else cancelSignup();
}

function cancelSignup() {
  if (!mySignup) return;
  var zone = mySignup.zone;
  var fee = mySignup.fee || 0;
  var q = signupQueues[zone];
  if (q) {
    for (var i = 0; i < q.length; i++) {
      if (q[i].name === '本人') { q.splice(i, 1); break; }
    }
  }
  var game = mySignup.game;
  if (fee > 0) { myGameCoin += fee; updateMyCoinDisplay(); }
  mySignup = null;
  updateSignupBar();
  renderSignupView();
  if (typeof refreshQueueViews === 'function') refreshQueueViews();
  toastMsg(fee > 0 ? ('已取消「' + game + '」报名，退还 ' + fee + ' 💰') : ('已取消「' + game + '」报名'));
}
