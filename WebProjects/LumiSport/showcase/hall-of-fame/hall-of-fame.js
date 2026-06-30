(function () {
  const track = document.getElementById('track');
  const viewport = document.getElementById('viewport');
  const dotsEl = document.getElementById('dots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  if (!track || typeof EDITIONS === 'undefined' || typeof GAME_TYPES === 'undefined') return;

  const ROMAN = { 1: 'Ⅰ', 2: 'Ⅱ', 3: 'Ⅲ', 4: 'Ⅳ', 5: 'Ⅴ', 6: 'Ⅵ', 7: 'Ⅶ', 8: 'Ⅷ', 9: 'Ⅸ', 10: 'Ⅹ' };
  const GAME_KEYS = Object.keys(GAME_TYPES);

  function hexToRgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  }

  /* ===== 生成每届幻灯片 ===== */
  function editionHtml(ed, isLatest) {
    const projectsLabel = ed.games.length === 1 ? '单项目' : `${ed.games.length} 大项目`;

    const cardsHtml = ed.games.map(function (gameId) {
      const game = GAME_TYPES[gameId];
      if (!game) return '';
      const champion = (ed.champions && ed.champions[gameId]) || '待补充';
      const runner = ed.runners && ed.runners[gameId];
      const runnerLabel = ed.runnerLabel || '亚军';

      /* 玩法在 GAME_TYPES 中的顺序即左→中→右的列位 */
      const col = GAME_KEYS.indexOf(gameId) + 1;

      const vars = [
        `--game-accent:${game.accent}`,
        `--game-bg:${hexToRgba(game.accent, 0.16)}`,
        `--game-glow:${hexToRgba(game.accent, 0.7)}`,
        `--game-glow-soft:${hexToRgba(game.accent, 0.35)}`,
        `grid-column:${col}`,
      ].join(';');

      const runnerHtml = runner
        ? `<div class="cc-runner"><span class="silver">🥈</span><div class="cc-runner-text"><span class="rk">${runnerLabel}</span><span class="nm">${runner}</span></div></div>`
        : '';

      return `
        <div class="champion-card" style="${vars}">
          <div class="cc-medal">${game.icon}</div>
          <div class="cc-main">
            <span class="cc-tag">${game.name}</span>
            <div class="cc-name-row">
              <span class="cc-rank">🥇 冠军</span>
              <span class="cc-name">${champion}</span>
            </div>
          </div>
          ${runnerHtml}
        </div>`;
    }).join('');

    const latestPill = isLatest ? '<span class="edition-pill pill-latest">最新</span>' : '';

    return `
      <div class="edition">
        <div class="edition-header">
          <div class="edition-no">${ROMAN[ed.edition] || ed.edition}</div>
          <div class="edition-meta">
            <h2 class="edition-title">第 ${ed.edition} 届 · ${ed.title}</h2>
            <div class="edition-info">
              <span class="dot">${ed.date}</span>
              <span class="edition-pill">${ed.format}</span>
              <span class="edition-pill">${projectsLabel}</span>
              ${latestPill}
            </div>
          </div>
        </div>
        <div class="champion-cards${ed.games.length === 1 ? ' is-single' : ''}">${cardsHtml}</div>
      </div>`;
  }

  /* 数据约定数组首位为最新一届；展示按时间线从左到右（旧 → 新） */
  const ordered = EDITIONS.slice().reverse();
  const latestEd = EDITIONS[0];

  track.innerHTML = ordered.map(function (ed) {
    return `<div class="slide">${editionHtml(ed, ed === latestEd)}</div>`;
  }).join('');

  dotsEl.innerHTML = ordered.map(function (ed, i) {
    return `<button class="dot-btn" type="button" data-index="${i}" aria-label="第 ${ed.edition} 届"></button>`;
  }).join('');
  const dotBtns = Array.prototype.slice.call(dotsEl.querySelectorAll('.dot-btn'));

  /* ===== 轮播逻辑（默认展示最新一届，位于最右） ===== */
  const last = ordered.length - 1;
  let current = last;
  let dragging = false;
  let startX = 0;
  let dragDx = 0;

  function width() { return viewport.clientWidth; }

  function render(animate) {
    track.style.transition = animate ? 'transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
    track.style.transform = `translateX(${-current * width() + dragDx}px)`;
  }

  function update() {
    render(true);
    dotBtns.forEach(function (b, i) { b.classList.toggle('is-active', i === current); });
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === last;
  }

  function goTo(i) {
    current = Math.max(0, Math.min(last, i));
    update();
  }

  prevBtn.addEventListener('click', function () { goTo(current - 1); });
  nextBtn.addEventListener('click', function () { goTo(current + 1); });
  dotBtns.forEach(function (b) {
    b.addEventListener('click', function () { goTo(parseInt(b.dataset.index, 10)); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    else if (e.key === 'ArrowRight') goTo(current + 1);
  });

  /* ===== 指针拖动 / 触摸滑动 ===== */
  viewport.addEventListener('pointerdown', function (e) {
    dragging = true;
    startX = e.clientX;
    dragDx = 0;
    viewport.setPointerCapture(e.pointerId);
    viewport.classList.add('is-dragging');
  });
  viewport.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    dragDx = e.clientX - startX;
    render(false);
  });
  function endDrag() {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove('is-dragging');
    const threshold = Math.min(120, width() * 0.18);
    if (dragDx <= -threshold) current = Math.min(last, current + 1);
    else if (dragDx >= threshold) current = Math.max(0, current - 1);
    dragDx = 0;
    update();
  }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);

  window.addEventListener('resize', function () { render(false); });

  render(false);
  update();
})();
