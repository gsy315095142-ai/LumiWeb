window.__magic_ticket_s3 = `
<!-- 退票流程（管理端） -->
<div class="section-block">
  <div class="section-title">
    <div class="section-title-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
      </svg>
    </div>
    退票流程（管理端）
  </div>

  <div class="feature-card">
    <h4>退票入口</h4>
    <p>退票功能在管理端的票券详情页，工作人员可对散客票和团购票进行退票操作。</p>
  </div>

  <div class="feature-card" style="margin-top:16px">
    <h4>散客票退票流程</h4>
    <p>票券状态流转：</p>
    <div class="status-tags" style="margin-bottom: 12px;">
      <span class="status-tag red">顾客未领取 (0)</span>
      <span class="status-tag blue">待结算 (1)</span>
      <span class="status-tag green">已结算 (2)</span>
      <span class="status-tag orange">退票审核中 (3)</span>
      <span class="status-tag grey">已退票 (4)</span>
      <span class="status-tag blue">已驳回 (5)</span>
    </div>
    <div class="flow-steps" style="margin-top:12px">
      <div class="flow-step">
        <div class="flow-line"><div class="flow-dot"></div><div class="flow-connector"></div></div>
        <div class="flow-content">
          <h4>申请退票</h4>
          <p>选择退票类别、填写退票原因（必填，限 100 字）、可选上传图片附件</p>
        </div>
      </div>
      <div class="flow-step">
        <div class="flow-line"><div class="flow-dot"></div><div class="flow-connector"></div></div>
        <div class="flow-content">
          <h4>提交审核</h4>
          <p>散客票传票券码，团购票传团购码</p>
        </div>
      </div>
      <div class="flow-step">
        <div class="flow-line"><div class="flow-dot"></div><div class="flow-connector"></div></div>
        <div class="flow-content">
          <h4>退票审核</h4>
          <p>其他工作人员可同意或拒绝退票申请</p>
        </div>
      </div>
      <div class="flow-step">
        <div class="flow-line"><div class="flow-dot"></div></div>
        <div class="flow-content">
          <h4>审核结果</h4>
          <p>同意则释放场次名额，拒绝则标记为已驳回</p>
        </div>
      </div>
    </div>
  </div>

  <div class="feature-card" style="margin-top:16px">
    <h4>团购票退票</h4>
    <p>团购票退票逻辑与散客票类似，使用团购码参数，状态流转：待使用 → 待核销 → 已核销 → 已失效。</p>
  </div>

  <div class="feature-card" style="margin-top:16px">
    <h4>退票记录与评论</h4>
    <div class="feature-item">
      <span class="feature-item-title">操作人</span>
      <span class="feature-item-desc">记录操作人手机号（后四位）</span>
    </div>
    <div class="feature-item">
      <span class="feature-item-title">评论内容</span>
      <span class="feature-item-desc">每次操作附带的文字说明</span>
    </div>
    <div class="feature-item">
      <span class="feature-item-title">操作时间</span>
      <span class="feature-item-desc">精确到秒的时间戳</span>
    </div>
    <div class="feature-item">
      <span class="feature-item-title">附件图片</span>
      <span class="feature-item-desc">可点击查看大图</span>
    </div>
  </div>
</div>`;
