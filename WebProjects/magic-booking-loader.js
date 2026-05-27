// Auto-generated loader for magic-booking.html
(function() {
  var container = document.getElementById('content-area');
  if (!container) return;
  // --- magic-booking-entry.html ---
  (function() {
    var html = '<!-- 页面入口与两种模式（从 magic-booking.html 拆分） -->\n<div class="section-block">\n      <div class="section-title">\n        <div class="section-title-icon">\n          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n            <path d="M15 15l-2 5L9 9l11 4-5 2z"/><path d="M2 2l7.586 7.586"/>\n          </svg>\n        </div>\n        页面入口与两种模式\n      </div>\n\n      <div class="feature-card">\n        <h4>新建预约</h4>\n        <p>从首页点击「预约体验」进入，<code>orderId</code> 为 0。用户需完整选择日期、时间、人数和场次，然后跳转到确认页完成下单。</p>\n      </div>\n\n      <div class="feature-card">\n        <h4>修改场次</h4>\n        <p>从场次详情页点击修改场次进入，携带 <code>order</code>（订单ID）和 <code>orderDate</code> 参数。页面进入后自动加载原订单信息，用户重新选择场次后直接调用接口修改，无需二次确认。</p>\n        <ul class="detail-list" style="margin-top: 8px;">\n          <li>原场次信息自动回填（日期、时间、人数）</li>\n          <li>人数不可修改（保持原订单人数）</li>\n          <li>修改后调用 <code>/mz/changeGameRoundForOrder</code> 接口</li>\n          <li>若新场次与原场次一致，提示「场次未变化」</li>\n          <li>修改成功后 2 秒自动返回上一页</li>\n          <li>有剩余修改次数限制（显示在页面上）</li>\n        </ul>\n      </div>\n    </div>';
    var div = document.createElement('div');
    div.innerHTML = html;
    var sections = div.querySelectorAll('.section-block');
    sections.forEach(function(sec) { container.appendChild(sec); });
  })();

  // --- magic-booking-date.html ---
  (function() {
    var html = '<!-- 日期选择（从 magic-booking.html 拆分） -->\n<div class="section-block">\n      <div class="section-title">\n        <div class="section-title-icon">\n          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>\n          </svg>\n        </div>\n        日期选择\n      </div>\n\n      <div class="feature-card">\n        <h4>可选日期范围</h4>\n        <p>使用微信原生 <code>picker</code> 组件（mode="date"）选择日期。日期范围限制为：</p>\n        <ul class="detail-list" style="margin-top: 8px;">\n          <li><strong>起始日期</strong>：当天</li>\n          <li><strong>结束日期</strong>：当天 + 3 天（共可选 4 天）</li>\n        </ul>\n      </div>\n\n      <div class="feature-card">\n        <h4>日期切换联动</h4>\n        <p>选择新日期后：</p>\n        <ul class="detail-list" style="margin-top: 8px;">\n          <li>调用 <code>/mz/getGameRoundList</code> 获取该日期的所有场次</li>\n          <li>清空已选时间、已选场次、推荐列表</li>\n          <li>重新生成时间段列表</li>\n          <li>页面显示对应的星期几</li>\n        </ul>\n      </div>\n\n      <div class="tip-box">\n        <div class="tip-box-title">\n          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>\n          打点记录\n        </div>\n        <p>新建预约进入此页面时，会记录页面日志「预约选择时间」（<code>pageRecordLogChange</code>），同时记录进入时间戳 <code>bookStartTime</code>，用于后续统计预约转化时长。</p>\n      </div>\n    </div>';
    var div = document.createElement('div');
    div.innerHTML = html;
    var sections = div.querySelectorAll('.section-block');
    sections.forEach(function(sec) { container.appendChild(sec); });
  })();

  // --- magic-booking-time.html ---
  (function() {
    var html = '<!-- 时间段选择（从 magic-booking.html 拆分） -->\n<div class="section-block">\n      <div class="section-title">\n        <div class="section-title-icon">\n          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>\n          </svg>\n        </div>\n        时间段选择\n      </div>\n\n      <div class="feature-card">\n        <h4>时间段生成规则</h4>\n        <p>根据当天场次的营业时间范围，以 30 分钟为间隔生成时间段列表：</p>\n        <ul class="detail-list" style="margin-top: 8px;">\n          <li>从当天第一场次的开始时间到最晚场次时间，按 00/30 分生成</li>\n          <li>如果选择的是今天，自动跳过已过去的时间段</li>\n          <li>使用微信原生 <code>picker</code>（mode="time"）选择时间</li>\n        </ul>\n      </div>\n\n      <div class="feature-card">\n        <h4>时间选择后联动</h4>\n        <p>选定时间后，系统根据时间点 + 人数，从所有场次中筛选并推荐最多 4 个最匹配的场次（详见下方推荐算法）。</p>\n      </div>\n    </div>';
    var div = document.createElement('div');
    div.innerHTML = html;
    var sections = div.querySelectorAll('.section-block');
    sections.forEach(function(sec) { container.appendChild(sec); });
  })();

  // --- magic-booking-people.html ---
  (function() {
    var html = '<!-- 人数选择（从 magic-booking.html 拆分） -->\n<div class="section-block">\n      <div class="section-title">\n        <div class="section-title-icon">\n          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>\n          </svg>\n        </div>\n        人数选择\n      </div>\n\n      <div class="feature-card">\n        <h4>可选人数</h4>\n        <p>人数选项固定为 <code>[1, 2, 3, 4]</code>，对应每个场次最多 4 名玩家。用户以按钮组的形式点选。</p>\n      </div>\n\n      <div class="feature-card">\n        <h4>人数与场次联动</h4>\n        <p>人数变化后，推荐场次会重新计算。只有剩余人数 ≥ 选择人数的场次才会出现在推荐列表中。</p>\n      </div>\n\n      <div class="tip-box">\n        <div class="tip-box-title">\n          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>\n          团购票入口\n        </div>\n        <p>从团购兑换进入时，URL 参数可携带 <code>num</code>（人数），会自动预设人数选项。团购票相关功能详见「票券系统」模块。</p>\n      </div>\n    </div>';
    var div = document.createElement('div');
    div.innerHTML = html;
    var sections = div.querySelectorAll('.section-block');
    sections.forEach(function(sec) { container.appendChild(sec); });
  })();

  // --- magic-booking-algorithm.html ---
  (function() {
    var html = '<!-- 场次推荐算法（从 magic-booking.html 拆分） -->\n<div class="section-block">\n      <div class="section-title">\n        <div class="section-title-icon">\n          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>\n          </svg>\n        </div>\n        场次推荐算法\n      </div>\n\n      <div class="feature-card">\n        <h4>推荐逻辑</h4>\n        <p>当用户选择了时间点和人数后，系统执行以下推荐算法，生成最多 4 个推荐场次：</p>\n      </div>\n\n      <div class="flow-steps" style="margin-top: 16px;">\n        <div class="flow-step">\n          <div class="flow-line">\n            <div class="flow-dot"></div>\n            <div class="flow-connector"></div>\n          </div>\n          <div class="flow-content">\n            <h4>筛选符合条件的场次</h4>\n            <p>从当天所有场次中筛选：剩余名额 ≥ 所需人数、不早于当前时间（如果是今天）、开始时间 ≥ 所选时间点。</p>\n          </div>\n        </div>\n        <div class="flow-step">\n          <div class="flow-line">\n            <div class="flow-dot"></div>\n            <div class="flow-connector"></div>\n          </div>\n          <div class="flow-content">\n            <h4>向后取 2 个场次</h4>\n            <p>从筛选后的场次中，取所选时间点之后的最近 2 个场次作为核心推荐。</p>\n          </div>\n        </div>\n        <div class="flow-step">\n          <div class="flow-line">\n            <div class="flow-dot"></div>\n            <div class="flow-connector"></div>\n          </div>\n          <div class="flow-content">\n            <h4>向前补齐</h4>\n            <p>如果向后场次不足 4 个，从所选时间点之前的场次中倒序取，补齐总数到 4。如果所选时间已超过最后一场，则总数减 1。</p>\n          </div>\n        </div>\n        <div class="flow-step">\n          <div class="flow-line">\n            <div class="flow-dot"></div>\n          </div>\n          <div class="flow-content">\n            <h4>去重输出</h4>\n            <p>最终去重后展示推荐列表。每个场次显示：时间范围、已预约/总人数、剩余名额。</p>\n          </div>\n        </div>\n      </div>\n    </div>';
    var div = document.createElement('div');
    div.innerHTML = html;
    var sections = div.querySelectorAll('.section-block');
    sections.forEach(function(sec) { container.appendChild(sec); });
  })();

  // --- magic-booking-select.html ---
  (function() {
    var html = '<!-- 场次选择交互（从 magic-booking.html 拆分） -->\n<div class="section-block">\n      <div class="section-title">\n        <div class="section-title-icon">\n          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n            <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>\n          </svg>\n        </div>\n        场次选择交互\n      </div>\n\n      <div class="feature-card">\n        <h4>推荐/全部切换</h4>\n        <p>默认展示推荐的 4 个场次。用户可点击「查看更多」展开当天所有场次列表（<code>showAllSlots</code>），再次点击收起。</p>\n      </div>\n\n      <div class="feature-card">\n        <h4>场次卡片信息</h4>\n        <p>每个场次卡片展示：</p>\n        <table class="info-table">\n          <thead>\n            <tr><th>字段</th><th>说明</th></tr>\n          </thead>\n          <tbody>\n            <tr><td>时间范围</td><td>场次开始 ~ 结束时间（如 14:00 - 14:30）</td></tr>\n            <tr><td>已预约 / 总人数</td><td>当前已预约人数与场容量上限</td></tr>\n            <tr><td>剩余名额</td><td>还可预约的人数（<code>player_num_remain</code>）</td></tr>\n            <tr><td>锁定人数</td><td>被团队预约锁定的名额（<code>player_num_lock</code>）</td></tr>\n          </tbody>\n        </table>\n      </div>\n\n      <div class="feature-card">\n        <h4>选择限制</h4>\n        <ul class="detail-list">\n          <li><strong>已售罄</strong>：剩余名额 &lt; 1 时，提示「当前场次已售罄」，无法选中</li>\n          <li><strong>已过期</strong>：选择今天时，开始时间已过的场次提示「无法选取之前的场次」</li>\n          <li>选中后高亮显示，底部「下一步」按钮激活</li>\n        </ul>\n      </div>\n    </div>';
    var div = document.createElement('div');
    div.innerHTML = html;
    var sections = div.querySelectorAll('.section-block');
    sections.forEach(function(sec) { container.appendChild(sec); });
  })();

  // --- magic-booking-submit.html ---
  (function() {
    var html = '<!-- 提交与跳转（从 magic-booking.html 拆分） -->\n<div class="section-block">\n      <div class="section-title">\n        <div class="section-title-icon">\n          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>\n          </svg>\n        </div>\n        提交与跳转\n      </div>\n\n      <div class="feature-card">\n        <h4>表单校验</h4>\n        <p>点击「下一步」前，系统校验以下条件：</p>\n        <ul class="detail-list" style="margin-top: 8px;">\n          <li>必须选择日期</li>\n          <li>必须选择时间点</li>\n          <li>必须选择场次</li>\n          <li>必须选择人数（新建预约时）</li>\n          <li>必须已登录（未登录弹出手机号授权）</li>\n        </ul>\n      </div>\n\n      <div class="feature-card">\n        <h4>跳转确认页（新建预约）</h4>\n        <p>校验通过后，携带以下参数跳转到 <code>/pages/confirm/confirm</code>：</p>\n        <table class="info-table">\n          <thead>\n            <tr><th>参数</th><th>说明</th></tr>\n          </thead>\n          <tbody>\n            <tr><td><code>place</code></td><td>门店 ID</td></tr>\n            <tr><td><code>date</code></td><td>选择的日期</td></tr>\n            <tr><td><code>num</code></td><td>预约人数</td></tr>\n            <tr><td><code>session</code></td><td>选中场次的完整 JSON 对象</td></tr>\n            <tr><td><code>bookStartTime</code></td><td>进入预约页的时间戳（用于统计）</td></tr>\n          </tbody>\n        </table>\n      </div>\n\n      <div class="feature-card">\n        <h4>直接修改场次（改签模式）</h4>\n        <p>如果是修改已有订单，选择新场次后直接调用 <code>/mz/changeGameRoundForOrder</code>，传入 <code>order_id</code> 和 <code>round_id</code>，成功后返回上一页。</p>\n      </div>\n    </div>';
    var div = document.createElement('div');
    div.innerHTML = html;
    var sections = div.querySelectorAll('.section-block');
    sections.forEach(function(sec) { container.appendChild(sec); });
  })();

})();
