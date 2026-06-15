window.__magic_mine_s2p4 = `
<!-- 4. 左滑退票交互 -->
<div class="section-block">
  <div class="section-title">
    <div class="section-title-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    </div>
    左滑退票交互（仅散客票）
  </div>

  <div class="ui-demo-row">
    <div class="ui-demo-item">
      <div class="phone-wireframe"><div class="phone-notch"></div><div class="phone-screen" style="min-height:360px">
        <div class="phone-bar"><span>9:41</span><div class="phone-bar-r"><i></i><i></i><i></i></div></div>
        <div style="min-height:320px;font-family:PingFang SC,sans-serif;background:#f5f5f5;padding:10px">
          <!-- 正常状态 -->
          <div style="font-size:8px;color:#999;margin-bottom:6px">← 正常状态</div>
          <div style="background:#fff;border-radius:10px;padding:10px 12px;margin-bottom:14px;box-shadow:0 1px 4px rgba(0,0,0,.06)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <span style="font-size:9px;color:#333;font-weight:700">双人体验券 (2人)</span>
              <span style="font-size:7px;padding:2px 8px;background:#E6F7FF;color:#1890FF;border-radius:10px">待使用</span>
            </div>
            <div style="font-size:8px;color:#666">有效期至：2026-08-14</div>
          </div>

          <!-- 左滑状态 -->
          <div style="font-size:8px;color:#999;margin-bottom:6px">← 左滑后露出退票按钮</div>
          <div style="position:relative;border-radius:10px;overflow:hidden;margin-bottom:14px">
            <div style="position:absolute;right:0;top:0;bottom:0;width:70px;background:#F55853;display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:700;border-radius:0 10px 10px 0">
              退票
            </div>
            <div style="background:#fff;border-radius:10px;padding:10px 12px;margin-right:30px;box-shadow:0 1px 4px rgba(0,0,0,.06);position:relative;z-index:1;transform:translateX(-40px)">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                <span style="font-size:9px;color:#333;font-weight:700">双人体验券 (2人)</span>
                <span style="font-size:7px;padding:2px 8px;background:#E6F7FF;color:#1890FF;border-radius:10px">待使用</span>
              </div>
              <div style="font-size:8px;color:#666">有效期至：2026-08-14</div>
            </div>
          </div>

          <!-- 退票确认弹窗 -->
          <div style="font-size:8px;color:#999;margin-bottom:6px">← 点击退票后弹出确认</div>
          <div style="background:rgba(0,0,0,.7);border-radius:10px;padding:30px 16px;text-align:center">
            <div style="background:#fff;border-radius:12px;padding:16px">
              <div style="font-size:10px;font-weight:700;color:#333;margin-bottom:8px">确认退票？</div>
              <div style="font-size:8px;color:#666;margin-bottom:12px;line-height:1.5">退票后将释放名额<br>票券将不可恢复</div>
              <div style="display:flex;gap:8px">
                <div style="flex:1;background:#f5f5f5;color:#666;border-radius:8px;padding:6px;font-size:8px;text-align:center">取消</div>
                <div style="flex:1;background:#F55853;color:#fff;border-radius:8px;padding:6px;font-size:8px;text-align:center">确认退票</div>
              </div>
            </div>
          </div>
        </div>
      </div></div>
      <div class="ui-desc">
        <h5>🎫 左滑退票交互</h5>
        <p>在票券列表中，散客票支持左滑露出「退票」按钮：</p>
        <ul>
          <li><strong>左滑触发</strong>：向左滑动超过一定距离后，右侧露出红色「退票」按钮</li>
          <li><strong>确认弹窗</strong>：点击退票后弹出二次确认，防止误操作</li>
          <li><strong>退票成功</strong>：自动刷新票券列表，票券状态变为已退票</li>
          <li><strong>退票限制</strong>：仅散客票支持小程序端退票，团购票不支持</li>
        </ul>
      </div>
    </div>
  </div>
</div>

`;
