# 个人中心 PRD

> **版本**：v1.0（代码逆向梳理）
> **最后更新**：2026-05-11
> **模块范围**：小程序「我的」页面及其 4 个子页面 + 后端对应服务
> **代码来源**：`uniapp/src/pages/player/mine.vue`、`components/mine/*`、`composables/useMinePage.ts`、`betting-my.vue`、`betting-history.vue`、`betting-coin-log.vue`、`betting-rank.vue`、`backend/modules/betting/betting-wallet.service.ts`、`betting-query.service.ts`、`betting-coin-log.service.ts`、`betting-tier.util.ts`

---

## 1. 模块定位

个人中心是小程序用户查看个人信息、管理竞猜资产、回顾参赛/竞猜历史的入口页面。作为 TabBar 的「我的」Tab，承载以下核心职责：

1. **个人资料展示与编辑** — 昵称修改
2. **竞猜资产管理** — 竞猜币余额、每日签到
3. **竞猜数据总览** — 预言家段位、派奖统计
4. **竞猜明细导航** — 过往竞猜、竞猜币流水、竞猜排行
5. **参赛历史** — 过往战绩
6. **退出登录**

---

## 2. 页面结构总览

### 2.1 页面导航图
```
TabBar「我的」── mine.vue（个人中心首页）
       ├── MineProfileCard         → 修改昵称（弹窗）
       ├── MineBettingSection      → 竞猜区域
       │   ├── 签到按钮
       │   ├── 「我的竞猜数据」 → betting-my.vue
       │   ├── 「过往竞猜」     → betting-history.vue
       │   ├── 「竞猜币流水」   → betting-coin-log.vue
       │   └── 「竞猜排行」     → betting-rank.vue
       ├── MineLinksSection「参赛」
       │   └── 「过往战绩」     → JoinMatchHistoryModal（弹窗）
       └── 退出登录按钮
```

### 2.2 页面清单

| 页面 | 路由 | 类型 | 说明 |
|------|------|------|------|
| 个人中心 | `mine.vue`（TabBar） | Tab 页 | 聚合入口 |
| 我的竞猜数据 | `/pages/player/betting-my` | 子页面 | 段位 + 统计 |
| 过往竞猜 | `/pages/player/betting-history` | 子页面 | 逐局竞猜明细 |
| 竞猜币流水 | `/pages/player/betting-coin-log` | 子页面 | 收支明细 |
| 竞猜排行 | `/pages/player/betting-rank` | 子页面 | 全服排行 |
| 过往战绩 | 弹窗（`JoinMatchHistoryModal`） | Modal | 参赛记录 |

---

## 3. 个人中心首页（mine.vue）

### 3.1 页面布局

```
┌──────────────────────────────────┐
│ ← 返回         我的              │ 自定义导航栏
├──────────────────────────────────┤
│                                  │
│        [昵称/未设置昵称]          │ MineProfileCard
│         用户 / 管理员            │
│        [ 修改昵称 ]              │
│                                  │
├──────────────────────────────────┤
│ 竞猜                             │ MineBettingSection
│ 竞猜币         1,200             │
│ [ 签到 +100 ]                    │
│ ─────────────────────────────    │
│ 我的竞猜数据                 ›   │
│ 过往竞猜                     ›   │
│ 竞猜币流水                   ›   │
│ 竞猜排行                     ›   │
├──────────────────────────────────┤
│ 参赛                             │ MineLinksSection
│ ─────────────────────────────    │
│ 过往战绩                     ›   │
├──────────────────────────────────┤
│ [      退出登录      ]           │ 登出按钮
└──────────────────────────────────┘
```

### 3.2 数据加载策略

| 时机 | 操作 |
|------|------|
| `onMounted` | `initNavBar()` + `updateScrollHeight()` + `fetchProfile()` + `loadWallet()` |
| `onShow`（页面再次可见） | `loadWallet()` + `fetchProfile()` |

说明：每次页面显示都刷新钱包和用户资料，确保余额和昵称是最 new 状态。

### 3.3 个人资料区（MineProfileCard）

| 元素 | 数据来源 | 展示规则 |
|------|---------|---------|
| 昵称 | `userStore.userInfo.nickname` | `null` 或空字符串时显示「未设置昵称」 |
| 角色 | `userStore.userInfo.role` | `admin` →「管理员」，`user` →「用户」 |
| 修改昵称按钮 | — | 点击打开 `MineNicknameModal` |

### 3.4 竞猜区（MineBettingSection）

| 元素 | 数据来源 | 展示规则 |
|------|---------|---------|
| 竞猜币余额 | `wallet.coins` | 数字直显 |
| 签到按钮 | `wallet.canCheckInToday` | `true` → 显示按钮（含奖励金额）；`false` → 显示「今日已签到」 |
| 签到奖励金额 | `wallet.dailyCheckInReward` | 固定 100，显示为「签到 +100」 |
| 导航链接 ×4 | 硬编码路由 | 我的竞猜数据 / 过往竞猜 / 竞猜币流水 / 竞猜排行 |

### 3.5 参赛区（MineLinksSection）

通用列表组件，接收 `title` 和 `rows` 数组。

当前配置：
- **标题**：「参赛」
- **行**：`[{ key: 'history', label: '过往战绩' }]`

点击「过往战绩」→ 打开 `JoinMatchHistoryModal` 弹窗，调用 `getMatchHistoryApi(50)` 加载最近 50 条参赛记录。

### 3.6 退出登录

- 调用 `userStore.logout()`
- 清除 token + userInfo
- 跳转至登录页（`reLaunchSafe('/pages/login/index')`）

---

## 4. 修改昵称弹窗（MineNicknameModal）

### 4.1 交互流程

```
点击「修改昵称」
  → 弹窗打开，输入框预填当前昵称（trimmed）
  → 用户编辑
  → 点击「保存」
    → 调用 userStore.updateProfile({ nickname })
    → 成功：Toast「已保存」→ 关闭弹窗
    → 失败：Toast 错误信息
```

### 4.2 校验规则

| 字段 | 规则 |
|------|------|
| 昵称 | `maxlength=100`，前后 trim 后若为空字符串则会传 `""`（清空昵称） |
| 空值处理 | 允许清空昵称，传 `{ nickname: "" }` |

### 4.3 弹窗交互

- 点击蒙层（mask）→ 关闭弹窗（等同于取消）
- 保存中（`nickSaving=true`）→ 保存按钮 disabled

---

## 5. 我的竞猜数据（betting-my.vue）

### 5.1 接口

`GET /api/betting/my-summary` → `BettingMySummaryPayload`

### 5.2 页面内容

| 区域 | 字段 | 说明 |
|------|------|------|
| 段位卡 | `tier.icon` | 大号图标（如 🔮 🥉 🥈 🥇 💎 👑 🏆） |
| | `tier.name` | 段位名称（如「黄金预言家」） |
| | `tier.threshold` | 当前段位的累计派奖门槛 |
| 数据行 | `coins` | 竞猜币余额 |
| | `totalBettingWinnings` | 累计竞猜派奖 |
| | `settledRoundsCount` | 已结算局数 |
| 脚注 | 硬编码文档 | 「累计竞猜派奖」仅统计猜中项的派奖，平局退还不计入段位 |

### 5.3 段位体系

| 段位 | 门槛（累计派奖 ≥） | 图标 |
|------|-------------------|------|
| 新手预言家 | 0 | 🔮 |
| 青铜预言家 | 2,500 | 🥉 |
| 白银预言家 | 5,000 | 🥈 |
| 黄金预言家 | 10,000 | 🥇 |
| 钻石预言家 | 20,000 | 💎 |
| 铂金预言家 | 50,000 | 👑 |
| 王者预言家 | 100,000 | 🏆 |

**规则**：只升不降，按 `totalBettingWinnings` 降序匹配最大满足阈值。

---

## 6. 过往竞猜（betting-history.vue）

### 6.1 接口

`GET /api/betting/my-history?limit=50` → `BettingHistoryItemPayload[]`

### 6.2 列表项展示

每条记录为一个卡片，包含以下信息层：

| 层级 | 字段 | 展示 |
|------|------|------|
| 头行 | `createdAt` | 时间（M/D HH:MM） |
| | `netResult` | 净收益（正数绿色带 `+`，负数红色） |
| 赛事行 | `round` + `gameType` + `matchName` | 「第 X 局 · 疾速冰球 · 赛事名」 |
| 对阵行 | `redPlayer` vs `bluePlayer` + 比分 | 「🟥选手名 5 : 3 选手名🟦」 |
| 汇总行 | `totalBetted` / `totalPayout` / `totalWonStat` | 「本金 X · 发放 Y · 猜中派奖累计 Z」 |
| 明细行 | `details[]` | 按竞猜类型逐项展示（见下） |

### 6.3 明细行（details）展示

每条明细行包含以下字段组合：

| 字段 | 说明 | 展示条件 |
|------|------|---------|
| `type` | 竞猜类型名 | 始终显示 |
| `myBet` | 我的选择 | 非空时显示 |
| `result` | 结果描述 | 始终显示 |
| `won` | 猜中派奖 | 非空时显示（绿色背景） |
| `refund` | 退还金额 | 非空时显示（橙色背景） |
| `lost` | 输掉金额 | 非空时显示（红色背景） |

**颜色编码**：
- `hit`（猜中）：绿色背景 + `#95de64` 文字
- `miss`（未中）：红色背景 + `#ff9c9c` 文字
- `draw`（平局退还）：橙色背景 + `#ffc069` 文字

### 6.4 数据限制

- 默认拉取最近 **50** 条（`limit=50`）
- 后端限制上限 **100** 条

---

## 7. 竞猜币流水（betting-coin-log.vue）

### 7.1 接口

`GET /api/betting/coin-log?limit=80` → `CoinLogItemPayload[]`

### 7.2 列表项展示

每条流水记录包含：

| 元素 | 字段 | 说明 |
|------|------|------|
| 时间 | `createdAt` | `YYYY-M-D HH:MM` |
| 金额 | `kind` + `amount` | `gain` → 绿色 `+N`，`spend` → 红色 `−N` |
| 原因 | `reason` | 文字描述（如「每日签到」「下注 - 胜负竞猜」） |
| 余额 | `balanceAfter` | 交易后余额 |

### 7.3 流水类型

| kind | 含义 | reason 示例 |
|------|------|------------|
| `gain` | 收入 | 「每日签到」「结算派奖 - 胜负竞猜」「退还 - 本局流局」 |
| `spend` | 支出 | 「下注 - 胜负竞猜」「下注 - 元素之王」 |

### 7.4 数据限制

- 默认拉取最近 **80** 条
- 后端限制上限 **100** 条

---

## 8. 竞猜排行（betting-rank.vue）

### 8.1 接口

`GET /api/betting/leaderboard?take=50` → `BettingLeaderboardRowPayload[]`

### 8.2 排序规则

按 `totalBettingWinnings DESC, coins DESC, id ASC` 排序（后端 SQL）。

页面顶部提示文案：「按『累计竞猜派奖』排序（与参考项 totalWinnings 一致）」

### 8.3 列表项展示

每行排行包含：

| 元素 | 字段 | 说明 |
|------|------|------|
| 排名 | `rank` | 前 3 名用金色高亮 |
| 段位图标 | `tier.icon` | 如 🥇 💎 👑 |
| 用户名 | `displayName` | 超长省略 |
| 段位名 | `tier.name` | 如「黄金预言家」 |
| 派奖总额 | `totalBettingWinnings` | 竞猜币 |
| 币余额 | `coins` | 竞猜币 |

### 8.4 刷新策略

- `onMounted`：首次加载
- `onShow`：每次页面可见时重新加载

### 8.5 数据限制

- 默认拉取前 **50** 名
- 后端限制上限 **100** 名
- 仅查询 `status=ACTIVE` 的用户

---

## 9. 过往战绩弹窗（JoinMatchHistoryModal）

### 9.1 接口

`GET /api/player/match-history?limit=50` → `MatchHistoryItemPayload[]`

### 9.2 弹窗规格

| 属性 | 值 |
|------|------|
| 最大高度 | 70vh |
| 滚动区域高度 | 56vh |
| 宽度 | 100%（max-width 640rpx） |
| 点击蒙层 | 关闭弹窗 |

### 9.3 列表项展示

每条参赛记录包含：

| 元素 | 字段 | 说明 |
|------|------|------|
| 时间 + 结果 | `settledAt` / `result` | `YYYY-MM-DD HH:MM` + 「红方胜/蓝方胜/平局」 |
| 玩法 | `gameType` + `matchName` | emoji + 赛事名 |
| 对阵 | `redPlayer` vs `bluePlayer` | 缺席显示「机器人」 |
| 比分 | `redScore : blueScore` | |
| 积分变化 | `redRatingBefore → redRatingAfter` | 红蓝双行 |
| 积分差值 | `redRatingChange` / `blueRatingChange` | `+N.NN` 或 `-N.NN` |

### 9.4 玩法 emoji 映射

| gameType | emoji | 中文名 |
|----------|-------|--------|
| hockey | 🏒 | 疾速冰球 |
| boxing | 🥊 | 烈焰拳王 |
| fencing | 🤺 | 雷霆击剑 |

---

## 10. 每日签到

### 10.1 接口

`POST /api/betting/daily-check-in` → `DailyCheckInResultPayload`

### 10.2 签到流程

```
用户点击「签到 +100」
  → 按钮防重复（checkBusy 锁）
  → POST /api/betting/daily-check-in
    → 后端在事务内：
      1. 悲观锁 SELECT user FOR UPDATE
      2. 判断 lastCheckInYmd === today（Asia/Shanghai）
      3. 已签到 → 返回 { alreadyClaimedToday: true }
      4. 未签到 → coins += 100, lastCheckInYmd = today, 写 coin_log
    → 前端：
      - alreadyClaimedToday → Toast「今日已签到」
      - 成功 → Toast「+100 竞猜币」
      - 重新加载 wallet（刷新余额 + 按钮状态）
```

### 10.3 签到规则

| 规则 | 说明 |
|------|------|
| 奖励金额 | **100** 竞猜币/次（常量 `DAILY_CHECK_IN_COINS`） |
| 频率 | 每日一次，按 Asia/Shanghai 时区判断 |
| 判断字段 | `users.last_check_in_ymd`（YYYY-MM-DD 格式） |
| 流水记录 | 写入 `user_coin_logs`，kind=`gain`，reason=`每日签到`，sessionId=null |

---

## 11. 数据模型

### 11.1 users 表（竞猜相关字段）

| 字段 | 类型 | 说明 |
|------|------|------|
| `coins` | int, default 0 | 竞猜币余额 |
| `total_betting_winnings` | double, default 0 | 累计竞猜派奖（猜中项合计，不含平局退还） |
| `last_check_in_ymd` | varchar(10), nullable | 上次签到日期（YYYY-MM-DD） |

### 11.2 user_coin_logs 表

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | int, PK | 自增主键 |
| `user_id` | int, FK → users | 所属用户（CASCADE 删除） |
| `kind` | varchar(16) | `spend` / `gain` |
| `amount` | int | 金额（四舍五入取整） |
| `reason` | varchar(500) | 原因描述 |
| `balance_after` | int | 操作后余额 |
| `session_id` | int, nullable, FK → game_sessions | 关联赛次（SET NULL） |
| `created_at` | datetime | 自动生成 |

**索引**：`[user_id, created_at]`（复合索引，加速用户流水查询）

### 11.3 bet_settlement_records 表（查询关联）

| 字段 | 说明 |
|------|------|
| `user_id` | 所属用户 |
| `session_id` | 关联赛次 |
| `total_betted` | 本局总投入 |
| `total_won_stat` | 猜中派奖累计 |
| `total_payout` | 实际发放 |
| `net_result` | 净收益 = total_payout - total_betted |
| `details_json` | 明细 JSON |

---

## 12. 接口清单

### 12.1 个人中心相关

| 端点 | 方法 | 鉴权 | 说明 |
|------|------|------|------|
| `/api/auth/profile` | GET | ✔ | 获取用户资料（昵称、角色） |
| `/api/auth/profile` | PUT | ✔ | 更新用户资料（昵称） |
| `/api/betting/wallet` | GET | ✔ | 获取竞猜币钱包（余额 + 签到状态） |
| `/api/betting/daily-check-in` | POST | ✔ | 每日签到 |
| `/api/player/match-history?limit=N` | GET | ✔ | 参赛历史记录 |

### 12.2 竞猜数据相关

| 端点 | 方法 | 鉴权 | 说明 |
|------|------|------|------|
| `/api/betting/my-summary` | GET | ✔ | 我的竞猜汇总（段位 + 派奖 + 局数） |
| `/api/betting/my-history?limit=N` | GET | ✔ | 过往竞猜明细 |
| `/api/betting/coin-log?limit=N` | GET | ✔ | 竞猜币流水 |
| `/api/betting/leaderboard?take=N` | GET | ✔ | 竞猜排行榜 |

### 12.3 请求/响应摘要

#### GET /api/betting/wallet

```
Response: {
  coins: number            // 竞猜币余额
  canCheckInToday: boolean // 今日是否可签到
  dailyCheckInReward: number // 签到奖励金额（100）
}
```

#### POST /api/betting/daily-check-in

```
Request: {}
Response: {
  coins: number              // 签到后余额
  awarded: number            // 本次获得（0 = 已签到过）
  alreadyClaimedToday: boolean // 是否今日已签到
}
```

#### GET /api/betting/my-summary

```
Response: {
  coins: number
  totalBettingWinnings: number
  tier: { name: string, threshold: number, icon: string }
  settledRoundsCount: number
}
```

#### GET /api/betting/leaderboard?take=50

```
Response: [{
  userId: number
  rank: number
  displayName: string
  coins: number
  totalBettingWinnings: number
  tier: { name, threshold, icon }
}]
```

#### GET /api/betting/my-history?limit=50

```
Response: [{
  id: number
  sessionId: number
  createdAt: string (ISO)
  matchName: string | null
  round: number
  gameType: GameType
  redPlayer: { id, displayName } | null
  bluePlayer: { id, displayName } | null
  redScore: number | null
  blueScore: number | null
  totalBetted: number
  totalWonStat: number
  totalPayout: number
  netResult: number
  details: [{
    type: string        // 竞猜类型名
    myBet?: string      // 我的选择
    amount: number
    actual?: string     // 实际结果
    result: string      // 结果描述
    won?: number        // 猜中派奖
    lost?: number       // 输掉
    refund?: number     // 退还
  }]
}]
```

#### GET /api/betting/coin-log?limit=80

```
Response: [{
  id: number
  kind: 'spend' | 'gain'
  amount: number
  reason: string
  balanceAfter: number
  sessionId: number | null
  createdAt: string (ISO)
}]
```

---

## 13. 关键业务常量

| 常量 | 值 | 来源 | 说明 |
|------|---|------|------|
| 签到奖励 | 100 | `DAILY_CHECK_IN_COINS` | 每日签到获得竞猜币 |
| 参赛历史拉取数 | 50 | 前端 `getMatchHistoryApi(50)` | 个人中心→过往战绩 |
| 竞猜历史拉取数 | 50 | 前端 `getBettingMyHistoryApi(50)` | 过往竞猜页 |
| 流水拉取数 | 80 | 前端 `getBettingCoinLogApi(80)` | 竞猜币流水页 |
| 排行榜拉取数 | 50 | 前端 `getBettingLeaderboardApi(50)` | 竞猜排行页 |
| 后端列表上限 | 100 | `Math.min(100, ...)` | 所有分页接口 |
| 昵称最大长度 | 100 | `maxlength="100"` | 前端 input 限制 |
| 流水原因最大长度 | 500 | `reason.slice(0, 500)` | 后端截断 |

---

## 14. 端到端流程

### 14.1 用户打开个人中心

```
进入「我的」Tab
  → fetchProfile()           → 更新昵称/角色
  → loadWallet()             → 更新竞猜币余额 + 签到按钮状态
  → 渲染：
     - 昵称卡片
     - 竞猜区（余额 + 签到 + 4 个导航）
     - 参赛区（过往战绩）
     - 退出登录
```

### 14.2 签到流程

```
点击「签到 +100」
  → checkBusy = true
  → POST /api/betting/daily-check-in
  → 成功：
     - Toast「+100 竞猜币」
     - loadWallet() → 刷新余额 + 按钮变「今日已签到」
  → 重复签到：
     - Toast「今日已签到」
     - loadWallet()（幂等）
  → 失败：
     - Toast 错误信息
  → checkBusy = false
```

### 14.3 修改昵称流程

```
点击「修改昵称」
  → 弹窗打开，预填当前昵称
  → 编辑 + 保存
  → PUT /api/auth/profile { nickname }
  → 成功：Toast「已保存」 + 关闭弹窗 + userInfo 已更新
  → 失败：Toast 错误信息（弹窗保持打开）
```

### 14.4 退出登录流程

```
点击「退出登录」
  → userStore.logout()
     - 清空 token + userInfo（内存 + localStorage）
     - reLaunchSafe('/pages/login/index')
```

---

## 15. 并发安全

| 场景 | 保护机制 |
|------|---------|
| 每日签到 | 悲观写锁 `FOR UPDATE` + 事务 + `lastCheckInYmd` 幂等判断 |
| 修改昵称 | 无并发保护（覆盖写，无冲突风险） |
| 钱包查询 | 无锁，读一致性由数据库保证 |
| 排行榜查询 | 无锁，基于快照排序 |

---

## 16. 异常处理

| 场景 | 处理方式 |
|------|---------|
| 钱包加载失败 | `wallet = null`，竞猜区不显示余额（不阻塞页面） |
| 签到接口失败 | Toast 展示错误信息 |
| 昵称保存失败 | Toast 展示错误信息，弹窗保持打开 |
| 子页面加载失败 | 显示错误卡片 + 重试按钮 |
| 子页面无数据 | 显示空状态文案（「暂无历史记录」「暂无流水」「暂无排行数据」） |
| 用户资料获取失败 | 自动登出（`logout()`） |
| navigateBack 失败 | 降级为 `switchTab` 到赛事页 |

---

## 17. 局限性与待改进

| 项 | 现状 | 建议 |
|----|------|------|
| 管理员视图 | 管理员可看到个人中心，但签到/竞猜功能对其无意义 | 建议对 admin 角色隐藏竞猜区或显示管理员专属内容 |
| 分页加载 | 所有列表仅做一次全量加载（limit=50/80） | 数据量大时建议改为滚动分页加载 |
| 下拉刷新 | 页面无下拉刷新支持 | 建议增加 `onPullDownRefresh` 支持 |
| 头像 | 无头像功能，仅显示昵称 | 可扩展微信头像展示 |
| 手机号绑定 | 后端支持 `phone` 字段但前端未展示绑定入口 | 可在个人中心增加手机号绑定/换绑功能 |
| 积分展示 | 个人中心不直接展示三项玩法积分 | 建议增加积分概览卡片 |
| 竞猜币充值 | 无充值渠道，仅签到获取 | 可考虑扩展充值/购买功能 |
