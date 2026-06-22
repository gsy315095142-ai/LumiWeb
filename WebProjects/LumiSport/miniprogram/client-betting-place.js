/**
 * LumiSport 客户端 - 竞猜下注 UI 与逻辑
 */

function initMatchState() {
  matchState = {};
  matchData.forEach(function (m) {
    if (m.phase == 'betting') {
      matchState[m.id] = { side: null, amt: 0, isCustom: false, placed: false };
    }
  });
}

function onZoneChange(el) {
  selectedZone = (el && el.value) ? el.value : document.getElementById('zoneSelect').value;
  syncStoreChrome();
  updateBannerAd();
  renderBettingMatches();
  updateSignupBar();
  renderSignupView();
}

function updateBetButton(mid) {
  var st = matchState[mid];
  if (!st) return;
  var btn = document.getElementById('betBtn-' + mid);
  if (!btn) return;
  if (st.side && st.amt > 0) {
    btn.disabled = false;
    btn.style.background = '#7c3aed';
    btn.style.color = '#fff';
    btn.style.border = 'none';
  } else {
    btn.disabled = true;
    btn.style.background = 'rgba(255,255,255,0.06)';
    btn.style.color = '#999';
    btn.style.border = '1px solid var(--border)';
  }
}

function renderBettingMatches() {
  var container = document.getElementById('bettingMatchesList');
  if (!container) return;
  var filtered = matchData.filter(function (m) {
    if (m.phase !== 'betting') return false;
    if (selectedZone !== m.zone) return false;
    return true;
  });
  if (filtered.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--muted);font-size:0.85em;">📭 当前区域暂无竞猜中的比赛</div>';
    return;
  }
  var html = '';
  filtered.forEach(function (m) {
    var st = matchState[m.id] || { side: null, amt: 0, isCustom: false, placed: false };
    html += '<div class="match-card" data-match="' + m.id + '"><div class="match-header"><span class="match-label">⚡ 当前场次</span><span class="countdown cd-bet">🟡 竞猜中</span></div><div class="match-game">' + m.game + '</div><div class="match-meta">🕐 <span>' + m.time + '</span> &nbsp;·&nbsp; 📷 <span>' + m.zone + '</span></div><div class="vs-row">';
    html += '<div class="player-box red" onclick="selectBet(this,\'red\',\'' + m.id + '\')"><div class="player-avatar red-av">🔴</div><div class="player-nick player-nick-link" onclick="event.stopPropagation();showPlayerStats(\'' + m.red + '\')">' + m.red + '</div><div class="odds-tag odds-red">赔率 ' + m.redOdds.toFixed(2) + '</div></div><div class="vs-divider">VS</div>';
    html += '<div class="player-box blue" onclick="selectBet(this,\'blue\',\'' + m.id + '\')"><div class="player-avatar blue-av">🔵</div><div class="player-nick player-nick-link" onclick="event.stopPropagation();showPlayerStats(\'' + m.blue + '\')">' + m.blue + '</div><div class="odds-tag odds-blue">赔率 ' + m.blueOdds.toFixed(2) + '</div></div></div>';
    if (st.placed) {
      var pOdds = st.side === 'red' ? m.redOdds : m.blueOdds;
      var pWho = st.side === 'red' ? ('🔴 ' + m.red) : ('🔵 ' + m.blue);
      var pTotal = Math.floor(st.amt * pOdds);
      html += '<div class="bet-placed"><div class="bet-placed-row">✅ 已下注 ' + pWho + '</div>';
      html += '<div class="bet-placed-amt">下注 ' + st.amt + ' 💰 · 赔率 ' + pOdds.toFixed(2) + 'x</div>';
      html += '<div class="bet-placed-profit">猜中可获得：' + pTotal + ' 💎</div>';
      html += '<button class="btn bet-cancel-btn" onclick="cancelBet(\'' + m.id + '\')">取消下注</button></div></div>';
      return;
    }
    html += '<div class="bet-section"><label>💰 下注（游戏币）<span style="font-size:0.78em;color:var(--muted);"> · 单次上限 ' + MAX_BET + '</span></label>';
    html += '<div class="bet-chips" id="chips-' + m.id + '"><span class="bet-chip" onclick="setChipBet(\'' + m.id + '\',10)">10</span><span class="bet-chip" onclick="setChipBet(\'' + m.id + '\',50)">50</span><span class="bet-chip" onclick="setChipBet(\'' + m.id + '\',100)">100</span><span class="bet-chip" onclick="setChipBet(\'' + m.id + '\',' + MAX_BET + ')">' + MAX_BET + '</span><span class="bet-chip" onclick="useCustom(\'' + m.id + '\')">自定义</span></div>';
    html += '<div id="customArea-' + m.id + '" class="hidden"><input class="bet-input" id="customInput-' + m.id + '" type="number" placeholder="手动输入金额（10~' + MAX_BET + '）" min="10" max="' + MAX_BET + '" step="1" oninput="onCustomInput(\'' + m.id + '\')"><div class="bet-hint" id="hint-' + m.id + '"></div></div>';
    html += '<button class="btn" style="margin-top:8px;width:100%;background:rgba(255,255,255,0.06);color:#999;border:1px solid var(--border);" id="betBtn-' + m.id + '" disabled onclick="placeBet(\'' + m.id + '\')">🎉 确认下注</button></div></div>';
  });
  container.innerHTML = html;
  Object.keys(matchState).forEach(function (mid) {
    var st = matchState[mid];
    if (st.placed) return;
    if (st.side) {
      var card = document.querySelector('[data-match="' + mid + '"]');
      if (card) {
        var box = card.querySelector('.player-box.' + st.side);
        if (box) box.classList.add('selected');
      }
    }
    if (st.amt > 0 && !st.isCustom) {
      var chips = document.querySelectorAll('#chips-' + mid + ' .bet-chip');
      chips.forEach(function (c) { if (parseInt(c.textContent) === st.amt) c.classList.add('active'); });
    }
    if (st.isCustom) {
      var customChip = document.querySelector('#chips-' + mid + ' .bet-chip:last-child');
      if (customChip) customChip.classList.add('active');
      document.getElementById('customArea-' + mid).classList.remove('hidden');
      if (st.amt > 0) document.getElementById('customInput-' + mid).value = st.amt;
    }
    updateBetButton(mid);
  });
}

function selectBet(el, side, mid) {
  if (!matchState[mid]) matchState[mid] = { side: null, amt: 0, isCustom: false };
  if (el.classList.contains('selected')) {
    el.classList.remove('selected');
    matchState[mid].side = null;
  } else {
    el.closest('.match-card').querySelectorAll('.player-box').forEach(function (b) { b.classList.remove('selected'); });
    el.classList.add('selected');
    matchState[mid].side = side;
  }
  updateBetButton(mid);
}

function setChipBet(mid, amt) {
  if (!matchState[mid]) matchState[mid] = { side: null, amt: 0, isCustom: false };
  var s = matchState[mid];
  if (event.target.classList.contains('active') && s.amt === amt && !s.isCustom) {
    event.target.classList.remove('active');
    s.amt = 0;
    updateBetButton(mid);
    return;
  }
  s.amt = amt;
  s.isCustom = false;
  document.querySelectorAll('#chips-' + mid + ' .bet-chip').forEach(function (c) { c.classList.remove('active'); });
  event.target.classList.add('active');
  document.getElementById('customArea-' + mid).classList.add('hidden');
  document.getElementById('customInput-' + mid).value = '';
  document.getElementById('hint-' + mid).textContent = '';
  updateBetButton(mid);
}

function useCustom(mid) {
  if (!matchState[mid]) matchState[mid] = { side: null, amt: 0, isCustom: false };
  var s = matchState[mid];
  if (s.isCustom && event.target.classList.contains('active')) {
    event.target.classList.remove('active');
    s.isCustom = false;
    s.amt = 0;
    document.getElementById('customArea-' + mid).classList.add('hidden');
    document.getElementById('customInput-' + mid).value = '';
    document.getElementById('hint-' + mid).textContent = '';
    updateBetButton(mid);
    return;
  }
  s.amt = 0;
  s.isCustom = true;
  document.querySelectorAll('#chips-' + mid + ' .bet-chip').forEach(function (c) { c.classList.remove('active'); });
  event.target.classList.add('active');
  document.getElementById('customArea-' + mid).classList.remove('hidden');
  document.getElementById('customInput-' + mid).focus();
  updateBetButton(mid);
}

function onCustomInput(mid) {
  var inp = document.getElementById('customInput-' + mid);
  var hint = document.getElementById('hint-' + mid);
  var v = parseFloat(inp.value);
  if (inp.value && !Number.isInteger(v)) inp.value = Math.floor(v) || '';
  var iv = parseInt(inp.value) || 0;
  if (iv > MAX_BET) {
    inp.value = MAX_BET;
    iv = MAX_BET;
    hint.textContent = '单次最高下注 ' + MAX_BET + ' 游戏币，已自动调整';
  } else if (iv < 10 && inp.value) {
    hint.textContent = '最低下注 10 游戏币';
  } else {
    hint.textContent = '';
  }
  if (!matchState[mid]) matchState[mid] = { side: null, amt: 0, isCustom: false };
  if (iv >= 10) matchState[mid].amt = iv;
  else matchState[mid].amt = 0;
  updateBetButton(mid);
}

function placeBet(mid) {
  if (!isLoggedIn) { window._pendingBet = mid; showLogin(); return; }
  doPlaceBet(mid);
}

function doPlaceBet(mid) {
  var m = matchData.find(function (x) { return x.id === mid; });
  if (!m) return toastMsg('比赛数据异常');
  if (!matchState[mid]) matchState[mid] = { side: null, amt: 0, isCustom: false };
  var s = matchState[mid];
  if (!s.side) return toastMsg('请先选择一方选手');
  if (s.isCustom) {
    var v = parseInt(document.getElementById('customInput-' + mid).value) || 0;
    if (v < 10) return toastMsg('最低下注 10 游戏币');
    if (v > MAX_BET) return toastMsg('单次最高下注 ' + MAX_BET + ' 游戏币');
    s.amt = v;
  }
  if (!s.amt) return toastMsg('请选择或输入下注金额');
  if (s.amt > MAX_BET) return toastMsg('单次最高下注 ' + MAX_BET + ' 游戏币');
  if (typeof myGameCoin !== 'undefined' && myGameCoin < s.amt) return toastMsg('游戏币余额不足');
  if (typeof myGameCoin !== 'undefined') {
    myGameCoin -= s.amt;
    if (typeof updateAllCoinDisplays === 'function') updateAllCoinDisplays();
    else if (typeof updateMyCoinDisplay === 'function') updateMyCoinDisplay();
  }
  if (!myBets[mid]) myBets[mid] = { red: 0, blue: 0 };
  myBets[mid][s.side] += s.amt;
  s.placed = true;
  renderBettingMatches();
  toastMsg('✅ 下注成功');
}

function cancelBet(mid) {
  var st = matchState[mid];
  if (st && st.placed && st.amt > 0 && typeof myGameCoin !== 'undefined') {
    myGameCoin += st.amt;
    if (typeof updateAllCoinDisplays === 'function') updateAllCoinDisplays();
    else if (typeof updateMyCoinDisplay === 'function') updateMyCoinDisplay();
  }
  matchState[mid] = { side: null, amt: 0, isCustom: false, placed: false };
  if (myBets[mid]) myBets[mid] = { red: 0, blue: 0 };
  renderBettingMatches();
  toastMsg('已取消下注');
}
