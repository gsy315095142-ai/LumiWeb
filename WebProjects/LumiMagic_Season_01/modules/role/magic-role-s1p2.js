window.__magic_role_s1p2 = `
<!-- 2. 角色创建页 -->
<div class="section-block">
  <div class="section-title">
    <div class="section-title-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    </div>
    角色创建页
  </div>

  <div class="ui-demo-row">
    <div class="ui-demo-item">
      <div class="phone-wireframe"><div class="phone-notch"></div><div class="phone-screen" style="min-height:540px">
        <div class="phone-bar"><span>9:41</span><div class="phone-bar-r"><i></i><i></i><i></i></div></div>
        <div style="min-height:506px;font-family:PingFang SC,sans-serif;background:linear-gradient(180deg,#E1F7FF,#F7FDFF);padding:10px">
          <!-- 标题 -->
          <div style="text-align:center;font-size:12px;color:#333;font-weight:700;padding:8px 0">创建角色</div>

          <!-- 角色图片 -->
          <div style="display:flex;justify-content:center;margin:8px 0">
            <div style="width:90px;height:90px;border-radius:50%;background:linear-gradient(135deg,#577BFE,#54FFF3);display:flex;align-items:center;justify-content:center;font-size:36px;color:#fff;box-shadow:0 4px 12px rgba(87,123,254,.3)">🧙</div>
          </div>

          <!-- 性别选择 -->
          <div style="text-align:center;margin:12px 0 8px">
            <span style="font-size:9px;color:#666">选择性别</span>
          </div>
          <div style="display:flex;justify-content:center;gap:16px;margin-bottom:12px">
            <div style="width:50px;height:50px;border-radius:12px;background:#fff;border:1px solid #ddd;display:flex;align-items:center;justify-content:center;font-size:24px">👦</div>
            <div style="width:50px;height:50px;border-radius:12px;background:#fff;border:2px solid #577BFE;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 2px 8px rgba(87,123,254,.2)">👧</div>
          </div>

          <!-- 角色名称 -->
          <div style="margin:10px 20px">
            <div style="font-size:9px;color:#666;margin-bottom:6px">角色名称</div>
            <div style="background:#fff;border:1px solid #ddd;border-radius:10px;padding:10px 14px;font-size:10px;color:#999;display:flex;justify-content:space-between;align-items:center">
              <span>请输入角色名称</span>
              <span style="font-size:8px;color:#ccc">0/10</span>
            </div>
          </div>

          <!-- 确认按钮 -->
          <div style="text-align:center;margin-top:16px">
            <div style="display:inline-block;background:linear-gradient(0deg,#577BFE,#54FFF3);color:#fff;border-radius:24px;padding:10px 50px;font-size:11px;font-weight:700">确认创建</div>
          </div>

          <!-- 底部提示 -->
          <div style="text-align:center;margin-top:12px;font-size:8px;color:#999">
            <div>创建后可在场次开始前修改角色信息</div>
            <div>每场最多创建 4 个角色</div>
          </div>
        </div>
      </div></div>
      <div class="ui-desc">
        <h5>🧙 角色创建页</h5>
        <p>激活码验证通过后进入角色创建页面，用户设置角色名称和性别：</p>
        <ul>
          <li><strong>角色图片</strong>：根据性别动态切换，圆形头像展示</li>
          <li><strong>性别选择</strong>：男女两个图标按钮，选中时蓝色边框 + 阴影高亮</li>
          <li><strong>角色名称</strong>：输入框，最多 10 个字符，右侧显示字数统计</li>
          <li><strong>确认创建</strong>：渐变色按钮，名称为空时不可点击</li>
          <li><strong>重复创建</strong>：已创建角色的用户再次进入时，可继续创建或修改已有角色</li>
          <li><strong>场次已开启</strong>：场次开始后提示「当前场次已经开启，无法编辑」</li>
        </ul>
        <div class="feature-card" style="margin-top:12px">
          <h4>角色数据字段</h4>
          <div class="feature-item">
            <span class="feature-item-title">角色编号</span>
            <span class="feature-item-desc">系统自动生成的唯一标识</span>
          </div>
          <div class="feature-item">
            <span class="feature-item-title">角色名称</span>
            <span class="feature-item-desc">用户自定义，最多 10 个字符，支持多次修改</span>
          </div>
          <div class="feature-item">
            <span class="feature-item-title">性别</span>
            <span class="feature-item-desc">男/女，影响角色图片展示</span>
          </div>
          <div class="feature-item">
            <span class="feature-item-title">关联订单</span>
            <span class="feature-item-desc">创建时绑定的订单编号</span>
          </div>
          <div class="feature-item">
            <span class="feature-item-title">关联场次</span>
            <span class="feature-item-desc">角色所属的体验场次</span>
          </div>
          <div class="feature-item">
            <span class="feature-item-title">创建者</span>
            <span class="feature-item-desc">订单的激活者</span>
          </div>
          <div class="feature-item">
            <span class="feature-item-title">激活者</span>
            <span class="feature-item-desc">编辑权限判断依据</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

`;
