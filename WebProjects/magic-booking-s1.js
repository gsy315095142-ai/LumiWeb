window.__magic_booking_s1 = `
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

  <!-- 状态B：已选择后的完整界面 -->
  <div class="ui-demo-row">
    <div class="ui-demo-item">
      <div class="phone-wireframe"><div class="phone-notch"></div><div class="phone-screen" style="min-height:540px">
        <div class="phone-bar"><span>9:41</span><div class="phone-bar-r"><i></i><i></i><i></i></div></div>
        <div style="padding:12px 10px;background:linear-gradient(160deg,#1a0a3e 0%,#0d1b4a 40%,#0a2540 100%)">
          <div style="text-align:center;padding:6px 0 4px;font-size:9px;color:rgba(255,255,255,.7)">魔法学院·朝阳店</div>

          <div style="border-radius:12px;margin-bottom:6px;background:rgba(255,255,255,.95);padding:8px 12px;display:flex;align-items:center">
            <span style="font-size:9px;font-weight:500;color:#323232;min-width:42px">日期</span>
            <div style="flex:1;display:flex;align-items:center;justify-content:space-between;background:#f8f8f8;border-radius:8px;padding:6px 10px">
              <span style="font-size:9px;color:#666">2026-07-15 星期三</span>
              <span style="font-size:8px;color:#999">📅</span>
            </div>
          </div>

          <div style="border-radius:12px;margin-bottom:6px;background:rgba(255,255,255,.95);padding:8px 12px;display:flex;align-items:center">
            <span style="font-size:9px;font-weight:500;color:#323232;min-width:52px">想玩时间</span>
            <div style="flex:1;display:flex;align-items:center;justify-content:space-between;background:#f8f8f8;border-radius:8px;padding:6px 10px">
              <span style="font-size:9px;color:#333">14:30</span>
              <span style="font-size:8px;color:#999">🕐</span>
            </div>
          </div>

          <div style="border-radius:12px;margin-bottom:8px;background:rgba(255,255,255,.95);padding:8px 12px;display:flex;align-items:center">
            <span style="font-size:9px;font-weight:500;color:#323232;min-width:52px">预约人数</span>
            <div style="flex:1;display:flex;justify-content:space-around;gap:4px">
              <span style="font-size:8px;padding:4px 10px;border:1px solid #57B2FD;color:#57B2FD;border-radius:6px">1人</span>
              <span style="font-size:8px;padding:4px 10px;border:1px solid #57B2FD;background:#57B2FD;color:#fff;border-radius:6px;font-weight:600">2人</span>
              <span style="font-size:8px;padding:4px 10px;border:1px solid #57B2FD;color:#57B2FD;border-radius:6px">3人</span>
              <span style="font-size:8px;padding:4px 10px;border:1px solid #57B2FD;color:#57B2FD;border-radius:6px">4人</span>
            </div>
          </div>

          <div style="padding:6px 14px">
            <span style="font-size:9px;color:rgba(255,255,255,.6);font-weight:500">最接近的场次推荐</span>
          </div>
          <div style="margin:0 4px">
            <div style="margin-bottom:4px;padding:8px 12px;background:#fff;border-radius:10px;border:1.5px solid #00aeff;display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:9px;color:#333;font-weight:500">14:00-14:30</span>
              <div style="display:flex;align-items:center;gap:4px;padding:2px 8px;background:#EEFBEE;border-radius:6px">
                <span style="width:4px;height:4px;background:#6ECBB9;border-radius:50%"></span>
                <span style="font-size:8px;color:#6ECBB9;font-weight:700">可约</span>
              </div>
            </div>
            <div style="margin-bottom:4px;padding:8px 12px;background:#fff;border-radius:10px;display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:9px;color:#333;font-weight:500">14:30-15:00</span>
              <div style="display:flex;align-items:center;gap:4px;padding:2px 8px;background:#EEFBEE;border-radius:6px">
                <span style="width:4px;height:4px;background:#6ECBB9;border-radius:50%"></span>
                <span style="font-size:8px;color:#6ECBB9;font-weight:700">可约</span>
              </div>
            </div>
            <div style="margin-bottom:4px;padding:8px 12px;background:#fff;border-radius:10px;display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:9px;color:#333;font-weight:500">15:00-15:30</span>
              <div style="display:flex;align-items:center;gap:4px;padding:2px 8px;background:#EEFBEE;border-radius:6px">
                <span style="width:4px;height:4px;background:#6ECBB9;border-radius:50%"></span>
                <span style="font-size:8px;color:#6ECBB9;font-weight:700">可约</span>
              </div>
            </div>
            <div style="margin-bottom:4px;padding:8px 12px;background:#fff;border-radius:10px;display:flex;align-items:center;justify-content:space-between;opacity:0.5">
              <span style="font-size:9px;color:#333;font-weight:500">15:30-16:00</span>
              <div style="display:flex;align-items:center;gap:4px;padding:2px 8px;background:#FFF0F0;border-radius:6px">
                <span style="width:4px;height:4px;background:#ff4d4f;border-radius:50%"></span>
                <span style="font-size:8px;color:#ff4d4f;font-weight:700">已满</span>
              </div>
            </div>
          </div>
        </div>
        <div style="background:linear-gradient(160deg,#1a0a3e,#0a2540);padding:0 12px 10px">
          <div style="background:linear-gradient(90deg,#577BFE,#54FFF3);color:#fff;border-radius:20px;padding:8px 0;text-align:center;font-size:10px;font-weight:600">下一步</div>
        </div>
      </div></div>
      <div class="ui-desc">
        <h5>✅ 新建预约 — 已选择状态</h5>
        <ul>
          <li><strong>人数选中</strong>：蓝色填充背景 + 白字高亮</li>
          <li><strong>场次卡片</strong>：左侧时间范围 + 右侧绿色「可约」标签</li>
          <li><strong>已选场次</strong>：蓝色边框高亮</li>
          <li><strong>已满场次</strong>：红色标签 + 整张卡片降低透明度，不可点击</li>
          <li><strong>入场动画</strong>：场次卡片 3D 翻转依次入场，每张间隔 0.2 秒</li>
          <li><strong>「下一步」</strong>：选择完毕后变为不透明可点击状态</li>
        </ul>
        <div class="feature-card" style="margin-top:12px">
          <h4>场次卡片样式说明</h4>
          <div class="feature-item">
            <span class="feature-item-title">时间范围</span>
            <span class="feature-item-desc">左侧显示场次起止时间，如 14:00-14:30</span>
          </div>
          <div class="feature-item">
            <span class="feature-item-title">可约标签</span>
            <span class="feature-item-desc">右侧绿色背景标签，绿色圆点 +「可约」文字</span>
          </div>
          <div class="feature-item">
            <span class="feature-item-title">已满标签</span>
            <span class="feature-item-desc">红色背景标签，整张卡片降低透明度，不可点击</span>
          </div>
          <div class="feature-item">
            <span class="feature-item-title">选中状态</span>
            <span class="feature-item-desc">蓝色边框高亮</span>
          </div>
        </div>
        <div class="feature-card" style="margin-top:12px">
          <h4>选择限制与提示</h4>
          <div class="feature-item">
            <span class="feature-item-title">已售罄</span>
            <span class="feature-item-desc">剩余名额为 0，点击提示「当前场次已售罄」</span>
          </div>
          <div class="feature-item">
            <span class="feature-item-title">已过期</span>
            <span class="feature-item-desc">今天且开始时间已过，提示「无法选取之前的场次」</span>
          </div>
          <div class="feature-item">
            <span class="feature-item-title">未选人数</span>
            <span class="feature-item-desc">已选时间但未选人数，列表显示「选择预约人数」</span>
          </div>
          <div class="feature-item">
            <span class="feature-item-title">无合适场次</span>
            <span class="feature-item-desc">筛选后为空，列表显示「暂无合适的场次」</span>
          </div>
          <div class="feature-item">
            <span class="feature-item-title">无场次数据</span>
            <span class="feature-item-desc">该日期无任何场次，列表显示「该日期暂无场次」</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 状态C：修改场次模式 -->
  <div class="ui-demo-row">
    <div class="ui-demo-item">
      <div class="phone-wireframe"><div class="phone-notch"></div><div class="phone-screen" style="min-height:540px">
        <div class="phone-bar"><span>9:41</span><div class="phone-bar-r"><i></i><i></i><i></i></div></div>
        <div style="padding:12px 10px;background:linear-gradient(160deg,#1a0a3e 0%,#0d1b4a 40%,#0a2540 100%)">
          <div style="width:65%;margin:0 auto 8px;padding:8px 12px;background:#fff;border-radius:12px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.06)">
            <div style="font-size:8px;color:#666">您当前的场次时间：</div>
            <div style="font-size:9px;color:#333;font-weight:600;margin-top:2px">2026-07-15 14:00-14:30</div>
          </div>

          <div style="border-radius:12px;margin-bottom:6px;background:rgba(255,255,255,.95);padding:8px 12px;display:flex;align-items:center">
            <span style="font-size:9px;font-weight:500;color:#323232;min-width:42px">日期</span>
            <div style="flex:1;display:flex;align-items:center;justify-content:space-between;background:#f8f8f8;border-radius:8px;padding:6px 10px">
              <span style="font-size:9px;color:#666">2026-07-15 星期三</span>
              <span style="font-size:8px;color:#999">📅</span>
            </div>
          </div>

          <div style="border-radius:12px;margin-bottom:8px;background:rgba(255,255,255,.95);padding:8px 12px;display:flex;align-items:center">
            <span style="font-size:9px;font-weight:500;color:#323232;min-width:52px">想玩时间</span>
            <div style="flex:1;display:flex;align-items:center;justify-content:space-between;background:#f8f8f8;border-radius:8px;padding:6px 10px">
              <span style="font-size:9px;color:#333">14:00</span>
              <span style="font-size:8px;color:#999">🕐</span>
            </div>
          </div>

          <div style="padding:4px 14px 8px;font-size:8px;color:rgba(255,255,255,.4)">预约人数：2 人（不可修改）</div>

          <div style="padding:0 14px">
            <span style="font-size:9px;color:rgba(255,255,255,.6);font-weight:500">最接近的场次推荐</span>
          </div>
          <div style="margin:6px 4px">
            <div style="margin-bottom:4px;padding:8px 12px;background:#fff;border-radius:10px;display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:9px;color:#333;font-weight:500">14:00-14:30</span>
              <div style="display:flex;align-items:center;gap:4px;padding:2px 8px;background:#EEFBEE;border-radius:6px">
                <span style="width:4px;height:4px;background:#6ECBB9;border-radius:50%"></span>
                <span style="font-size:8px;color:#6ECBB9;font-weight:700">可约</span>
              </div>
            </div>
            <div style="margin-bottom:4px;padding:8px 12px;background:#fff;border-radius:10px;border:1.5px solid #00aeff;display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:9px;color:#333;font-weight:500">15:00-15:30</span>
              <div style="display:flex;align-items:center;gap:4px;padding:2px 8px;background:#EEFBEE;border-radius:6px">
                <span style="width:4px;height:4px;background:#6ECBB9;border-radius:50%"></span>
                <span style="font-size:8px;color:#6ECBB9;font-weight:700">可约</span>
              </div>
            </div>
            <div style="margin-bottom:4px;padding:8px 12px;background:#fff;border-radius:10px;display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:9px;color:#333;font-weight:500">15:30-16:00</span>
              <div style="display:flex;align-items:center;gap:4px;padding:2px 8px;background:#EEFBEE;border-radius:6px">
                <span style="width:4px;height:4px;background:#6ECBB9;border-radius:50%"></span>
                <span style="font-size:8px;color:#6ECBB9;font-weight:700">可约</span>
              </div>
            </div>
          </div>
        </div>
        <div style="background:linear-gradient(160deg,#1a0a3e,#0a2540);padding:0 12px 6px">
          <div style="background:linear-gradient(90deg,#577BFE,#54FFF3);color:#fff;border-radius:20px;padding:8px 0;text-align:center;font-size:10px;font-weight:600">确定修改</div>
          <div style="text-align:center;font-size:8px;color:rgba(255,255,255,.5);margin-top:4px">剩余修改次数：2 次</div>
        </div>
      </div></div>
      <div class="ui-desc">
        <h5>✏️ 修改场次模式</h5>
        <ul>
          <li><strong>入口</strong>：从订单详情页「修改场次」进入</li>
          <li><strong>当前场次</strong>：顶部白色卡片显示原场次时间</li>
          <li><strong>日期/时间</strong>：自动回填原订单信息</li>
          <li><strong>人数</strong>：隐藏选择器，显示灰色文字「不可修改」</li>
          <li><strong>按钮</strong>：文案改为「确定修改」</li>
          <li><strong>修改次数</strong>：底部显示剩余修改次数</li>
          <li><strong>场次未变化</strong>：提示「场次未变化」</li>
          <li><strong>修改成功</strong>：2 秒后自动返回上一页</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- 相关接口 -->
  <div class="feature-card">
    <h4>相关接口</h4>
    <div class="feature-item">
      <span class="feature-item-title">获取场次列表</span>
      <span class="feature-item-desc">传入日期和营业时间，返回当天所有场次</span>
    </div>
    <div class="feature-item">
      <span class="feature-item-title">修改订单场次</span>
      <span class="feature-item-desc">传入订单 ID 和新场次 ID，完成场次变更</span>
    </div>
    <div class="feature-item">
      <span class="feature-item-title">获取订单详情</span>
      <span class="feature-item-desc">传入订单 ID，返回订单及关联场次信息</span>
    </div>
  </div>
</div>
`;
