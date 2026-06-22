/**
 * LumiSport 管理员端 - 热身控制（与场次流程并行，独立于 flowSteps）
 */
var warmupGameMap = {
  '疾速冰球': {
    label: '疾速冰球 · 新手教程',
    doc: '../warmup-docs/speed-hockey.html',
    steps: ['接球', '属性切换', '投球', '综合练习']
  },
  '烈焰拳王': {
    label: '烈焰拳王 · 握拳教学',
    doc: '../warmup-docs/blazing-boxer.html',
    steps: ['出拳', '格挡', '闪避', '侧步', '重拳', '连招', '反击', '综合考核']
  },
  '雷霆击剑': {
    label: '雷霆击剑 · 持剑教学',
    doc: '../warmup-docs/thunder-fencing.html',
    steps: ['刺击', '格挡', '位移', '综合练习']
  }
};

var headsetWarmupStep = {};
var warmupProgressTimer = null;

var zoneHeadsets = {
  '疾速冰球厅': [
    { id: 'h1', label: '1号位' },
    { id: 'h2', label: '2号位' }
  ],
  '雷霆击剑厅': [
    { id: 'h1', label: '1号位' },
    { id: 'h2', label: '2号位' }
  ],
  '烈焰拳王厅': [
    { id: 'h1', label: '1号位' },
    { id: 'h2', label: '2号位' }
  ]
};

var headsetStatus = {};

function hsKey(zone, id) { return zone + ':' + id; }

function getHeadsetStatus(zone, id) {
  return headsetStatus[hsKey(zone, id)] || 'offline';
}

function setHeadsetStatus(zone, id, status) {
  headsetStatus[hsKey(zone, id)] = status;
}

function initHeadsetStatusForZone(zone) {
  var list = zoneHeadsets[zone] || [];
  list.forEach(function (h) {
    var k = hsKey(zone, h.id);
    if (!headsetStatus[k]) headsetStatus[k] = 'offline';
  });
}

function ensureMatchWarmupFields(m) {
  if (!m) return;
  if (typeof m.warmupActive === 'undefined') m.warmupActive = false;
}

function getWarmupGameInfo(gameStr) {
  for (var key in warmupGameMap) {
    if (gameStr.indexOf(key) !== -1) return warmupGameMap[key];
  }
  return { label: '通用热身教程', doc: '../warmup-docs/common-rules.html', steps: ['准备', '基础操作', '进阶练习', '综合考核'] };
}

function getWarmupSteps(gameStr) {
  var info = getWarmupGameInfo(gameStr);
  return info.steps || [];
}

function getWarmupTotalSteps(gameStr) {
  var steps = getWarmupSteps(gameStr);
  return steps.length || 4;
}

function getWarmupStepName(gameStr, step) {
  var steps = getWarmupSteps(gameStr);
  var idx = (parseInt(step, 10) || 1) - 1;
  if (idx >= 0 && idx < steps.length) return steps[idx];
  return '步骤' + step;
}

function getWarmupStep(zone, id) {
  return headsetWarmupStep[hsKey(zone, id)] || 0;
}

function setWarmupStep(zone, id, step) {
  headsetWarmupStep[hsKey(zone, id)] = step;
}

function clearWarmupStep(zone, id) {
  delete headsetWarmupStep[hsKey(zone, id)];
}

/** 供将来头显上报接入：设置某头显当前热身步骤（1 ~ totalSteps） */
function updateHeadsetWarmupStep(zone, id, step) {
  if (getHeadsetStatus(zone, id) !== 'warmup') return;
  var zm = typeof getZoneMatch === 'function' ? getZoneMatch(zone) : null;
  var total = zm ? getWarmupTotalSteps(zm.game) : 4;
  var s = Math.max(1, Math.min(total, parseInt(step, 10) || 1));
  setWarmupStep(zone, id, s);
  if (typeof renderZones === 'function') renderZones();
}

function buildWarmupStepDotsHtml(zone, hid, gameStr) {
  var total = getWarmupTotalSteps(gameStr);
  var cur = getWarmupStep(zone, hid);
  if (cur < 1) cur = 1;
  var stepName = getWarmupStepName(gameStr, cur);
  var h = '<div class="warmup-step-row">';
  h += '<div class="warmup-step-meta">';
  h += '<span class="warmup-step-count">' + cur + '/' + total + '</span>';
  h += '<span class="warmup-step-name">' + stepName + '</span>';
  h += '</div>';
  h += '<div class="warmup-step-dots">';
  for (var i = 1; i <= total; i++) {
    var cls = 'warmup-dot';
    if (i < cur) cls += ' done';
    else if (i === cur) cls += ' current';
    h += '<span class="' + cls + '" title="' + getWarmupStepName(gameStr, i) + '"></span>';
  }
  h += '</div></div>';
  return h;
}

function startWarmupProgressDemo() {
  if (warmupProgressTimer) return;
  warmupProgressTimer = setInterval(function () {
    var changed = false;
    for (var zone in zoneHeadsets) {
      if (!zoneHeadsets.hasOwnProperty(zone)) continue;
      var zm = typeof getZoneMatch === 'function' ? getZoneMatch(zone) : null;
      if (!zm) continue;
      var total = getWarmupTotalSteps(zm.game);
      (zoneHeadsets[zone] || []).forEach(function (h) {
        if (getHeadsetStatus(zone, h.id) !== 'warmup') return;
        var cur = getWarmupStep(zone, h.id) || 1;
        setWarmupStep(zone, h.id, cur >= total ? 1 : cur + 1);
        changed = true;
      });
    }
    if (changed && typeof renderZones === 'function') renderZones();
  }, 4000);
}

function beginHeadsetWarmup(zone, hid, gameStr) {
  setHeadsetStatus(zone, hid, 'warmup');
  setWarmupStep(zone, hid, 1);
  startWarmupProgressDemo();
}

function endHeadsetWarmup(zone, hid, nextStatus) {
  setHeadsetStatus(zone, hid, nextStatus || 'waiting');
  clearWarmupStep(zone, hid);
}

function canShowWarmupPanel(m) {
  if (!m || !m.configDone) return false;
  if (m.phase === 'started' || m.phase === 'settled') return false;
  return true;
}

function getWaitingHeadsetCount(zone) {
  initHeadsetStatusForZone(zone);
  var list = zoneHeadsets[zone] || [];
  var n = 0;
  list.forEach(function (h) {
    if (getHeadsetStatus(zone, h.id) === 'waiting') n++;
  });
  return n;
}

function getWarmupHeadsetCount(zone) {
  var list = zoneHeadsets[zone] || [];
  var n = 0;
  list.forEach(function (h) {
    if (getHeadsetStatus(zone, h.id) === 'warmup') n++;
  });
  return n;
}

function isZoneWarmupActive(zone) {
  return getWarmupHeadsetCount(zone) > 0;
}

function isWarmupPhase(m) {
  return m && (m.phase === 'waiting' || m.phase === 'betting');
}

function warmupDisabledReason(m) {
  if (!m || !m.configDone) return '请先完成玩法配置';
  if (!isWarmupPhase(m)) return '';
  if (getWaitingHeadsetCount(m.zone) === 0) return '暂无头显就绪（0 人等候中）· 可点「模拟佩戴」';
  return '';
}

function canStartWarmup(m) {
  if (!canShowWarmupPanel(m) || !isWarmupPhase(m)) return false;
  return getWaitingHeadsetCount(m.zone) > 0;
}

function onConfigCompleteWarmupDemo(zone) {
  initHeadsetStatusForZone(zone);
  var list = zoneHeadsets[zone] || [];
  if (list[0]) setHeadsetStatus(zone, list[0].id, 'waiting');
}

function onOpenBettingWarmupDemo(zone) {
  initHeadsetStatusForZone(zone);
  var list = zoneHeadsets[zone] || [];
  if (list[0] && getHeadsetStatus(zone, list[0].id) === 'offline') setHeadsetStatus(zone, list[0].id, 'waiting');
  if (list[1] && getHeadsetStatus(zone, list[1].id) === 'offline') setHeadsetStatus(zone, list[1].id, 'waiting');
}

function simulateHeadsetOnline(zone, hid) {
  initHeadsetStatusForZone(zone);
  var cur = getHeadsetStatus(zone, hid);
  if (cur === 'playing' || cur === 'warmup') return toastMsg('该头显当前不可模拟佩戴');
  setHeadsetStatus(zone, hid, 'waiting');
  renderZones();
  var label = hid;
  (zoneHeadsets[zone] || []).forEach(function (h) { if (h.id === hid) label = h.label; });
  toastMsg('已模拟：' + label + ' 佩戴头显 · 等候中');
}

function syncWarmupActiveFlag(m) {
  if (!m) return;
  m.warmupActive = getWarmupHeadsetCount(m.zone) > 0;
}

function stepStopWarmupOne(mid, hid) {
  var m = getMatch(mid);
  if (!m) return;
  if (getHeadsetStatus(m.zone, hid) !== 'warmup') return toastMsg('该头显未在热身中');
  endHeadsetWarmup(m.zone, hid, 'waiting');
  syncWarmupActiveFlag(m);
  renderZones();
  toastMsg('已取消热身 · 返回等候空间');
}

function stepStopWarmupAll(mid) {
  var m = getMatch(mid);
  if (!m) return;
  var warmN = getWarmupHeadsetCount(m.zone);
  if (warmN === 0) return toastMsg('当前没有进行中的热身');
  var list = zoneHeadsets[m.zone] || [];
  list.forEach(function (h) {
    if (getHeadsetStatus(m.zone, h.id) === 'warmup') endHeadsetWarmup(m.zone, h.id, 'waiting');
  });
  syncWarmupActiveFlag(m);
  renderZones();
  toastMsg('已取消全部热身');
}

function stepStartWarmupOne(mid, hid) {
  var m = getMatch(mid);
  if (!m) return;
  if (!isWarmupPhase(m)) return toastMsg('当前阶段不可开启热身');
  if (getHeadsetStatus(m.zone, hid) !== 'waiting') return toastMsg('该头显未处于等候中');
  beginHeadsetWarmup(m.zone, hid, m.game);
  syncWarmupActiveFlag(m);
  renderZones();
  toastMsg('🔥 已开启热身');
}

function stepStartWarmupAll(mid) {
  var m = getMatch(mid);
  if (!m) return;
  if (!canStartWarmup(m)) return toastMsg(warmupDisabledReason(m) || '暂不可开启热身');
  var list = zoneHeadsets[m.zone] || [];
  var n = 0;
  list.forEach(function (h) {
    if (getHeadsetStatus(m.zone, h.id) === 'waiting') {
      beginHeadsetWarmup(m.zone, h.id, m.game);
      n++;
    }
  });
  if (n === 0) return toastMsg('暂无等候中的头显');
  syncWarmupActiveFlag(m);
  renderZones();
  toastMsg('🔥 已为 ' + n + ' 名玩家开启热身');
}

function resetWarmupForZone(zone) {
  var list = zoneHeadsets[zone] || [];
  list.forEach(function (h) {
    setHeadsetStatus(zone, h.id, 'offline');
    clearWarmupStep(zone, h.id);
  });
}

function resetWarmupForMatch(m) {
  if (!m) return;
  m.warmupActive = false;
  resetWarmupForZone(m.zone);
}

function exitWarmupOnMatchStart(m) {
  if (!m) return 0;
  var list = zoneHeadsets[m.zone] || [];
  var n = 0;
  list.forEach(function (h) {
    if (getHeadsetStatus(m.zone, h.id) === 'warmup') {
      endHeadsetWarmup(m.zone, h.id, 'playing');
      n++;
    }
  });
  m.warmupActive = false;
  return n;
}

function statusLabel(s) {
  if (s === 'waiting') return { text: '等候中', cls: 'hs-wait' };
  if (s === 'warmup') return { text: '热身中', cls: 'hs-warm' };
  if (s === 'playing') return { text: '比赛中', cls: 'hs-play' };
  return { text: '离线', cls: 'hs-off' };
}

function buildWarmupPanelHtml(mid) {
  var m = getMatch(mid);
  if (!m || !canShowWarmupPanel(m)) return '';
  ensureMatchWarmupFields(m);
  initHeadsetStatusForZone(m.zone);
  var midEsc = escName(mid);
  var zoneEsc = escName(m.zone);
  var info = getWarmupGameInfo(m.game);
  var waitN = getWaitingHeadsetCount(m.zone);
  var warmN = getWarmupHeadsetCount(m.zone);
  var reason = warmupDisabledReason(m);
  var canAll = canStartWarmup(m);

  var h = '<div class="warmup-panel">';
  h += '<div class="warmup-panel-head"><span class="warmup-panel-title">🔥 热身控制</span><span class="warmup-panel-badge">与场次流程并行</span></div>';
  h += '<div class="warmup-scene">将加载：<strong>' + info.label + '</strong>';
  h += ' · <a class="warmup-doc-link" href="' + info.doc + '" target="_blank">查看规则</a></div>';
  h += '<div class="warmup-stats"><span class="warmup-stat stat-wait">🟢 等候中 ' + waitN + '</span><span class="warmup-stat stat-warm">🔥 热身中 ' + warmN + '</span></div>';

  var list = zoneHeadsets[m.zone] || [];
  h += '<div class="warmup-headset-list">';
  list.forEach(function (head) {
    var st = getHeadsetStatus(m.zone, head.id);
    var sl = statusLabel(st);
    var hidEsc = escName(head.id);
    h += '<div class="warmup-headset-item">';
    h += '<div class="warmup-headset-row">';
    h += '<span class="warmup-hs-label">🥽 ' + head.label + '</span>';
    h += '<span class="warmup-hs-status ' + sl.cls + '">' + sl.text + '</span>';
    h += '<span class="warmup-hs-actions">';
    if (st === 'offline' && isWarmupPhase(m)) {
      h += '<button class="btn btn-outline btn-sm warmup-sim-btn" onclick="simulateHeadsetOnline(\'' + zoneEsc + '\',\'' + hidEsc + '\')">模拟佩戴</button>';
    } else if (st === 'waiting') {
      h += '<button class="btn btn-sm warmup-go-btn" onclick="stepStartWarmupOne(\'' + midEsc + '\',\'' + hidEsc + '\')">开启热身</button>';
    } else if (st === 'warmup') {
      h += '<button class="btn btn-sm warmup-stop-btn" onclick="stepStopWarmupOne(\'' + midEsc + '\',\'' + hidEsc + '\')">取消热身</button>';
    } else {
      h += '<span class="warmup-muted">—</span>';
    }
    h += '</span></div>';
    if (st === 'warmup') h += buildWarmupStepDotsHtml(m.zone, head.id, m.game);
    h += '</div>';
  });
  h += '</div>';

  if (warmN > 0) {
    h += '<p class="warmup-note warmup-note-active">🔥 热身进行中 · 取消后返回等候空间 · 开始比赛将自动退出</p>';
    h += '<div class="warmup-btn-row">';
    if (canAll) {
      h += '<button class="btn btn-block warmup-all-btn warmup-all-ready" onclick="stepStartWarmupAll(\'' + midEsc + '\')">🔥 全部开启</button>';
    }
    h += '<button class="btn btn-outline btn-block warmup-stop-all-btn" onclick="stepStopWarmupAll(\'' + midEsc + '\')">✕ 全部取消热身</button>';
    h += '</div>';
  } else {
    if (m.phase === 'waiting') h += '<p class="warmup-note">报名未开放 · 玩家佩戴头显后可直接开启热身</p>';
    if (reason && !canAll) h += '<p class="warmup-note">' + reason + '</p>';
    h += '<button class="btn btn-block warmup-all-btn' + (canAll ? ' warmup-all-ready' : '') + '"';
    if (!canAll) h += ' disabled style="opacity:0.45;cursor:not-allowed;"';
    h += ' onclick="stepStartWarmupAll(\'' + midEsc + '\')">🔥 全部开启热身</button>';
  }
  h += '</div>';
  return h;
}

function doStartMatch(mid) {
  var m = getMatch(mid);
  if (!m) return;
  var exited = exitWarmupOnMatchStart(m);
  m.phase = 'started';
  m.guessing_open = false;
  renderZones();
  if (exited > 0) toastMsg('🔴 比赛开始 · 已退出 ' + exited + ' 人热身');
  else toastMsg('🔴 比赛开始');
}

function stepStartMatch(mid) {
  var m = getMatch(mid);
  if (!m) return;
  var warmN = getWarmupHeadsetCount(m.zone);
  if (warmN > 0 || m.warmupActive) {
    showConfirm('仍有 ' + warmN + ' 名玩家热身中，开始比赛将强制退出热身，是否继续？', function () {
      doStartMatch(mid);
    });
  } else {
    doStartMatch(mid);
  }
}

(function initWarmupDemoState() {
  if (typeof matches === 'undefined') return;
  matches.forEach(function (m) {
    ensureMatchWarmupFields(m);
    if (!m.configDone || !isWarmupPhase(m)) return;
    if (getWaitingHeadsetCount(m.zone) === 0 && getWarmupHeadsetCount(m.zone) === 0) {
      if (m.phase === 'waiting') onConfigCompleteWarmupDemo(m.zone);
      else if (m.phase === 'betting') onOpenBettingWarmupDemo(m.zone);
    }
  });
  if (typeof renderZones === 'function') renderZones();
})();
