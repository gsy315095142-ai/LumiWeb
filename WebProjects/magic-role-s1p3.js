window.__magic_role_s1p3 = `
<!-- 3. 倒计时与结果弹窗 -->
<div class="section-block">
  <div class="section-title">
    <div class="section-title-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    </div>
    倒计时与结果弹窗
  </div>

  <div class="ui-demo-row">
    <div class="ui-demo-item">
      <div class="phone-wireframe"><div class="phone-notch"></div><div class="phone-screen" style="min-height:540px">
        <div class="phone-bar"><span>9:41</span><div class="phone-bar-r"><i></i><i></i><i></i></div></div>
        <!-- 遮罩 + 倒计时弹窗 -->
        <div style="min-height:506px;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;padding:0 8%">
          <div style="width:100%;background:#fff;border-radius:16px;padding:20px;text-align:center;position:relative">
            <!-- 场次信息 -->
            <div style="font-size:9px;color:#666;margin-bottom:8px">您的场次：14:00 - 14:30</div>

            <!-- 倒计时环 -->
            <div style="width:100px;height:100px;margin:0 auto 12px;border-radius:50%;border:4px solid #E8F4FD;display:flex;align-items:center;justify-content:center;position:relative">
              <div style="position:absolute;top:-4px;left:50%;width:4px;height:50px;background:linear-gradient(180deg,#577BFE,transparent);transform-origin:bottom center;transform:rotate(-30deg);border-radius:2px"></div>
              <div>
                <div style="font-size:20px;color:#333;font-weight:700;font-family:monospace">12:34</div>
                <div style="font-size:7px;color:#999;margin-top:2px">后开始</div>
              </div>
            </div>

            <div style="font-size:10px;color:#333;font-weight:700;margin-bottom:4px">准备进入魔法世界</div>
            <div style="font-size:8px;color:#999;margin-bottom:16px">请耐心等待场次开启</div>

            <!-- 提示 -->
            <div style="background:#FFF7E6;border-radius:8px;padding:8px;font-size:8px;color:#8C6D1F;text-align:left">
              <div>🔔 温馨提示：</div>
              <div style="margin-top:4px">· 场次开启前可以修改角色信息</div>
              <div>· 请确保所有队员已到齐</div>
            </div>

            <!-- 关闭按钮 -->
            <div style="margin-top:14px;font-size:8px;color:#1890ff">关闭</div>
          </div>
        </div>
      </div></div>
      <div class="ui-desc">
        <h5>⏱️ 倒计时弹窗</h5>
        <p>角色创建成功后，自动弹出倒计时弹窗：</p>
        <ul>
          <li><strong>场次信息</strong>：显示用户所属的场次时间段</li>
          <li><strong>倒计时</strong>：环形进度 + 数字倒计时（时:分:秒），倒计至场次开始时间</li>
          <li><strong>温馨提示</strong>：黄色提示框，提醒可修改角色、确保队员到齐</li>
          <li><strong>关闭</strong>：点击关闭按钮返回角色创建页，弹窗不会再次自动弹出</li>
        </ul>
        <div class="feature-card" style="margin-top:12px">
          <h4>场次开启后</h4>
          <div class="feature-item">
            <span class="feature-item-title">自动跳转</span>
            <span class="feature-item-desc">场次开启后提示用户，点击确认跳转首页</span>
          </div>
          <div class="feature-item">
            <span class="feature-item-title">禁止编辑</span>
            <span class="feature-item-desc">场次已开启时进入页面提示「当前场次已经开启，无法编辑」</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

`;
