window.__magic_booking_s1p1 = `
<!-- 1. 预约页面界面 -->
<div class="section-block">
  <div class="section-title">
    <div class="section-title-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    </div>
    预约页面界面
  </div>

  <!-- 状态A：新建预约 - 初始状态（未选择） -->
  <div class="ui-demo-row">
    <div class="ui-demo-item">
      <div class="phone-wireframe"><div class="phone-notch"></div><div class="phone-screen" style="min-height:540px">
        <div class="phone-bar"><span>9:41</span><div class="phone-bar-r"><i></i><i></i><i></i></div></div>
        <div style="padding:12px 10px;min-height:480px;background:linear-gradient(160deg,#1a0a3e 0%,#0d1b4a 40%,#0a2540 100%)">
          <div style="text-align:center;padding:6px 0 4px;font-size:9px;color:rgba(255,255,255,.7)">魔法学院·朝阳店</div>

          <div style="border:2px solid #EF4444;border-radius:12px;margin-bottom:6px;position:relative;background:rgba(255,255,255,.95);padding:8px 12px;display:flex;align-items:center">
            <span style="position:absolute;top:-8px;left:8px;background:#EF4444;color:#fff;font-size:7px;padding:1px 5px;border-radius:3px;font-weight:600">日期选择</span>
            <span style="font-size:9px;font-weight:500;color:#323232;min-width:42px">日期</span>
            <div style="flex:1;display:flex;align-items:center;justify-content:space-between;background:#f8f8f8;border-radius:8px;padding:6px 10px">
              <span style="font-size:9px;color:#666">2026-07-15 星期三</span>
              <span style="font-size:8px;color:#999">📅</span>
            </div>
          </div>

          <div style="border:2px solid #EF4444;border-radius:12px;margin-bottom:6px;position:relative;background:rgba(255,255,255,.95);padding:8px 12px;display:flex;align-items:center">
            <span style="position:absolute;top:-8px;left:8px;background:#EF4444;color:#fff;font-size:7px;padding:1px 5px;border-radius:3px;font-weight:600">时间选择</span>
            <span style="font-size:9px;font-weight:500;color:#323232;min-width:52px">想玩时间</span>
            <div style="flex:1;display:flex;align-items:center;justify-content:space-between;background:#f8f8f8;border-radius:8px;padding:6px 10px">
              <span style="font-size:9px;color:#999">请选择时间</span>
              <span style="font-size:8px;color:#999">🕐</span>
            </div>
          </div>

          <div style="border:2px solid #EF4444;border-radius:12px;margin-bottom:8px;position:relative;background:rgba(255,255,255,.95);padding:8px 12px;display:flex;align-items:center">
            <span style="position:absolute;top:-8px;left:8px;background:#EF4444;color:#fff;font-size:7px;padding:1px 5px;border-radius:3px;font-weight:600">人数选择</span>
            <span style="font-size:9px;font-weight:500;color:#323232;min-width:52px">预约人数</span>
            <div style="flex:1;display:flex;justify-content:space-around;gap:4px">
              <span style="font-size:8px;padding:4px 10px;border:1px solid #57B2FD;color:#57B2FD;border-radius:6px">1人</span>
              <span style="font-size:8px;padding:4px 10px;border:1px solid #57B2FD;color:#57B2FD;border-radius:6px">2人</span>
              <span style="font-size:8px;padding:4px 10px;border:1px solid #57B2FD;color:#57B2FD;border-radius:6px">3人</span>
              <span style="font-size:8px;padding:4px 10px;border:1px solid #57B2FD;color:#57B2FD;border-radius:6px">4人</span>
            </div>
          </div>

          <div style="padding:6px 14px">
            <span style="font-size:9px;color:rgba(255,255,255,.6);font-weight:500">最接近的场次推荐</span>
          </div>
          <div style="margin:0 8px;padding:12px;background:rgba(255,255,255,.95);border-radius:10px;text-align:center;font-size:8px;color:#999">请选择想玩时间</div>
        </div>
        <div style="background:linear-gradient(160deg,#1a0a3e,#0a2540);padding:0 12px 10px">
          <div style="background:linear-gradient(90deg,#577BFE,#54FFF3);color:#fff;border-radius:20px;padding:8px 0;text-align:center;font-size:10px;font-weight:600;opacity:0.4">下一步</div>
        </div>
      </div></div>
      <div class="ui-desc">
        <h5>📝 新建预约 — 初始状态</h5>
        <ul>
          <li><strong>门店名称</strong>：顶部居中显示当前门店</li>
          <li><strong>日期选择</strong>：日期选择器，可选今天起 4 天（含今天）</li>
          <li><strong>想玩时间</strong>：时间选择器，从营业时间按 30 分钟间隔生成</li>
          <li><strong>预约人数</strong>：按钮组 [1/2/3/4人]，未选时全部蓝色描边</li>
          <li><strong>场次列表</strong>：初始提示「请选择想玩时间」</li>
          <li><strong>按钮</strong>：「下一步」，未完成选择时半透明不可点击</li>
        </ul>
        <div class="feature-card" style="margin-top:12px">
          <h4>表单校验与跳转</h4>
          <div class="feature-item">
            <span class="feature-item-title">登录校验</span>
            <span class="feature-item-desc">未登录时弹出手机号授权组件</span>
          </div>
          <div class="feature-item">
            <span class="feature-item-title">表单完整性</span>
            <span class="feature-item-desc">日期 + 时间 + 人数 + 场次缺一不可</span>
          </div>
          <div class="feature-item">
            <span class="feature-item-title">场次有效性</span>
            <span class="feature-item-desc">场次无效时提示「场次错误，请重新选择」</span>
          </div>
          <div class="feature-item">
            <span class="feature-item-title">新建跳转</span>
            <span class="feature-item-desc">校验通过后跳转确认页，携带门店、日期、人数、场次信息</span>
          </div>
        </div>
      </div>
    </div>
  </div>
`;
