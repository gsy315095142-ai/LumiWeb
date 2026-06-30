# 选手参赛 PRD

> **版本**：v1.0（代码逆向梳理）
> **最后更新**：2026-05-11
> **模块范围**：选手端报名/撤销、管理员审核、积分系统、战绩排行等完整参赛流程
> **代码来源**：`backend/src/modules/player/player-join.service.ts`、`player-session-view.service.ts`、`player-rating.service.ts`、`player-rating.util.ts`、`uniapp/src/pages/player/composables/usePlayerJoinPage.ts`、`JoinSessionCard.vue`、`JoinRankingsSection.vue`、`JoinMatchHistoryModal.vue`、`EventJoinInfoStrip.vue`

---

## 1. 模块定位

选手参赛模块是连接「线下比赛现场」与「小程序用户」的核心桥梁。用户通过小程序选择阵营（红/蓝方）报名参赛，由管理员审核后正式成为选手，比赛结束后按规则结算积分。

**核心设计原则**：
- 单场次：全局只有「最新一场」可操作，避免多场次并发混乱
- 审核制：选手报名需管理员通过，防止恶意占位
- 积分独立：三种玩法（冰球/拳王/击剑）各自维护独立积分体系

---

## 2. 角色与权限

### 2.1 角色

| 角色 | 说明 |
|------|------|
| **选手** | `role = 'user'` 的已登录用户，可报名参赛、查看积分排名与历史战绩 |
| **管理员** | `role = 'admin'`，可审核报名、移出选手、控制场次流程 |

### 2.2 权限矩阵

| 操作 | 选手 | 管理员 | 前置条件 |
|------|:----:|:------:|----------|
| 查看当前场次状态 | ✔ | ✔ | 已登录 |
| 报名红/蓝方 | ✔ | ✖ | 场次状态 = `betting`、目标阵营名额空间、未在对方阵营 |
| 撤销参赛 | ✔ | ✖ | 场次状态 = `betting`、已报名（正式或待审核） |
| 查看个人三项积分 | ✔ | ✔ | 已登录 |
| 查看积分排行榜 | ✔ | ✔ | 无 |
| 查看历史战绩 | ✔ | ✔ | 已登录 |
| 审核通过报名 | ✖ | ✔ | 场次状态 = `betting`、该选手在待审列表中、目标阵营无正式选手 |
| 移出某方选手 | ✖ | ✔ | 场次状态 = `betting`、该方有选手 |

> **身份互斥**：管理员不能作为选手报名参赛（管理员无报名入口）。

---

## 3. 报名流程

### 3.1 报名（register）

**接口**：`POST /api/player/register`

**入参**：
```json
{ "side": "red" | "blue" }
```

**完整处理流程**（10 步）：
```
选手选择阵营 → 提交报名请求
         →  ① 开启数据库事务 + 悲观锁（SELECT ... FOR UPDATE）
         →  ② 查询最新场次（status ≠ SETTLED，按 id DESC 取第一条）
         →  ③ 校验：场次不存在 → 404「当前没有进行中的场次」
         →  ④ 校验：status ≠ BETTING → 400「当前不在报名阶段，无法选择阵营」
         →  ⑤ 查找该用户本场次的已有报名请求（registration_requests 表）
         →  ⑥ 若已存在报名请求：
     - 与当前选择的阵营不同 → 400「请先撤销当前报名，再申请另一阵营」
     - 与当前选择的阵营相同 → 幂等返回（不重复创建）
         →  ⑦ 校验阵营占用（仅当 side = red 时展示，blue 对称）：
     - 已是该方正式选手 → 幂等返回
     - 已是对方正式选手 → 400「您已在对方阵营报名，请先撤销」
     - 该方名额已被他人占用 → 409「红方/蓝方名额已被占用」
         →  ⑧ 创建 registration_requests 记录（sessionId + side + userId）
         →  ⑨ 提交事务
         →  ⑩ 返回最新 PlayerSessionView
```

**关键业务规则**：
- 同一场次同一用户只能有一条报名请求（`UQ_registration_session_user` 唯一约束）
- 报名**不直接成为正式选手**，仅创建待审核记录
- 阵营名额按「先到先得」原则，管理员通过后该方名额锁定

### 3.2 撤销参赛（cancel）

**接口**：`POST /api/player/cancel`

**入参**：无（从 JWT token 中取 userId）

**处理逻辑**：
```
① 开启事务 + 悲观锁，查询最新场次
② 校验：status ≠ BETTING → 400「比赛已开始或已结束，无法撤销参赛」
③ 尝试删除 registration_requests 记录（待审核状态）
   - 删除成功 → 直接返回
   - 删除失败（无待审核记录）→ 继续下一步
④ 检查是否为正式选手：
   - session.redUserId === userId → 清空 redUserId
   - session.blueUserId === userId → 清空 blueUserId
   - 均不匹配 → 400「您未在本场次报名」
⑤ 保存场次并返回
```

**特殊说明**：
- 正式选手撤销时**直接清空** redUserId/blueUserId，无需管理员确认
- 撤销后该阵营名额重新释放，其他用户可报名
- 前端在撤销后会同步刷新竞猜状态（`refreshBettingUi`），因为参赛身份变化会影响竞猜开放状态

### 3.3 管理员审核通过（adminApproveRegistration）

**接口**：`POST /api/player/admin/approve-registration`

**入参**：
```json
{ "side": "red" | "blue", "userId": number }
```

**处理逻辑**：
```
① 开启事务 + 悲观锁，查询最新场次
② 校验：status ≠ BETTING → 400「仅在报名中阶段可通过审核」
③ 查找该用户在该阵营的 registration_requests 记录
   - 不存在 → 400「该选手不在该侧待审列表中」
④ 检查目标阵营是否已有正式选手
   - 已有 → 400「红方/蓝方已有正式选手」
⑤ 将 session.redUserId/blueUserId 设为该用户 ID
⑥ 删除该阵营全部 registration_requests 记录
   （通过一人后同阵营其余申请自动清理）
⑦ 保存场次并返回
```

**关键规则**：通过审核后，该阵营所有待审申请（含非当前用户）全部删除。

### 3.4 管理员移出选手（adminKickPlayer）

**接口**：`POST /api/player/admin/kick-player`

**入参**：
```json
{ "side": "red" | "blue" }
```

**处理逻辑**：
```
① 开启事务 + 悲观锁
② 校验：status ≠ BETTING → 400
③ 检查该方是否有选手（正式 + 待审核）
   - 无 → 400「红方/蓝方暂无选手」
④ 清空该方正式选手（redUserId/blueUserId = null）
⑤ 关闭竞猜（guessingOpen = false）
⑥ 删除该方全部 registration_requests
⑦ 检查是否有已下注记录：
   - 有 → 全额退款（refundAllBetsKeepBettingPhase），保持 BETTING 状态
   - 无 → 直接保存
```

---

## 4. 场次视图（PlayerSessionView）

### 4.1 数据结构

选手查看场次状态时返回的完整视图：

| 字段 | 类型 | 说明 |
|------|------|------|
| `sessionId` | number | 场次 ID（**0 = 无场次占位**，前端据此展示创建提示） |
| `round` | number | 轮次号（从 1 开始） |
| `gameType` | `'hockey' \| 'boxing' \| 'fencing'` | 当前玩法 |
| `status` | `'waiting' \| 'betting' \| 'started' \| 'settled'` | 场次状态 |
| `matchName` | string \| null | 场次名称（如「第3局」） |
| `isMasterMode` | boolean | 是否冰球大师模式 |
| `redPlayer` | `{id, displayName}` \| null | 红方正式选手 |
| `bluePlayer` | `{id, displayName}` \| null | 蓝方正式选手 |
| `redPendingPlayers` | `{id, displayName}[]` | 红方待审核选手列表 |
| `bluePendingPlayers` | `{id, displayName}[]` | 蓝方待审核选手列表 |
| `redRating` | number | 红方当前玩法积分（无选手时为默认 100） |
| `blueRating` | number | 蓝方当前玩法积分 |
| `redAvailable` | boolean | 红方名额是否空闲 |
| `blueAvailable` | boolean | 蓝方名额是否空闲 |
| `mySide` | `'red' \| 'blue' \| null` | 当前用户的正式阵营（优先级高于 myPendingSide） |
| `myPendingSide` | `'red' \| 'blue' \| null` | 当前用户待审核的阵营 |
| `redScore` | number \| null | 红方得分（settled 后有值） |
| `blueScore` | number \| null | 蓝方得分 |
| `iceBalls` / `fireBalls` / `windBalls` | number \| null | 冰球大师模式：冰/火/风球出现次数 |
| `totalKnockdowns` | number \| null | 拳王模式：倒地次数总和 |
| `elementWinner` | `'ice' \| 'fire' \| 'wind' \| null` | 冰球大师模式：元素之王胜者 |
| `guessingOpen` | boolean | 竞猜是否已开放（仅 betting 状态下有效） |
| `lastSettledMatch` | LastSettledMatchView \| null | 上一局已结算场次摘要（仅 waiting/betting 时返回） |

### 4.2 无场次占位

当数据库无记录或全部场次已被「收起」时，返回 `sessionId = 0` 的占位结构：
- 前端据此展示「暂无场次：请管理员创建场次」提示
- 状态默认 `waiting`，阵营全部不可用（`redAvailable: false`）

### 4.3 用户名展示规则（playerDisplayName）
```
nickname 有值且非空 → 使用 nickname
nickname 为空但 phone 有值 → 使用「用户 + 手机尾号4位」
以上均无 → 使用「用户 + 用户ID」
```

---

## 5. 积分系统

### 5.1 概述

- 三种玩法（冰球/拳王/击剑）各自独立维护积分
- 初始积分 100 分
- 仅在**双方选手均存在且非平局**时更新积分
- 每场比赛记录积分变化前后快照

### 5.2 积分计算公式

```
胜方加分 = REF_SCORE_RATE × (对手积分 / 双方积分之和)
         = 20 × (opponentRating / (redRating + blueRating))

败方扣分 = REF_SCORE_RATE × (己方原积分 / 双方积分之和)
```

**设计含义**：击败高分选手获得更多分数（以弱胜强收益高），击败低分选手获得较少分数。
**保底规则**：积分最低不低于 `REF_MIN_RATING = 1`。

### 5.3 关键常量

| 常量 | 值 | 说明 |
|------|----|------|
| `REF_DEFAULT_RATING` | 100 | 默认/初始积分 |
| `REF_MIN_RATING` | 1 | 积分下限 |
| `REF_SCORE_RATE` | 20 | 单场积分变化基数 |
| `REF_ODDS_FEE_RATE` | 0.1 | 赔率手续费（10%） |
| `REF_MIN_WIN_ODDS` | 1.1 | 最低赔率 |
| `REF_MAX_WIN_ODDS` | 2.0 | 最高赔率 |

### 5.4 积分与赔率的关系

比赛开始时锁定赔率，赔率由双方积分计算得出：
```
预期胜率 = myRating / (myRating + enemyRating)
原始赔率 = 1 / 预期胜率
实际赔率 = 原始赔率 × (1 - 0.1)    // 扣 10% 手续费
锁定赔率 = clamp(实际赔率, 1.1, 2.0)  // 限制在 [1.1, 2.0] 区间
```

### 5.5 积分快照

每场比赛结算时，在 `game_sessions` 表记录以下字段：

| 字段 | 说明 |
|------|------|
| `redRatingBefore` | 红方赛前积分 |
| `blueRatingBefore` | 蓝方赛前积分 |
| `redRatingAfter` | 红方赛后积分 |
| `blueRatingAfter` | 蓝方赛后积分 |
| `redRatingChange` | 红方积分变化量（可正可负） |
| `blueRatingChange` | 蓝方积分变化量 |

**平局处理**：双方积分不变，`*Change = 0`，`*Before = *After`。

### 5.6 查看个人积分

**接口**：`GET /api/player/my-ratings`

**返回**：
```json
{
  "hockey": 120.50,
  "boxing": 95.30,
  "fencing": 100.00
}
```

前端在「参赛信息条」`EventJoinInfoStrip` 中展示三项积分。

---

## 6. 积分排行榜

### 6.1 查看排行

**接口**：`GET /api/player/rating-rankings?gameType=hockey`

**入参**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `gameType` | string | 否 | 玩法类型，默认 `hockey` |

**返回**：
```json
{
  "gameType": "hockey",
  "rankings": [
    { "userId": 5, "displayName": "张三", "rating": 150.20 },
    { "userId": 3, "displayName": "李四", "rating": 130.80 }
  ]
}
```

**排序规则**：
- 按 `rating DESC` 降序
- 无积分记录的用户视为默认 100 分
- 积分 ≤ 0 的用户不展示
- 已软删除的用户（`deleted_at IS NOT NULL`）不展示

### 6.2 前端排行组件

- 三个 Tab 切换玩法（疾速冰球 / 烈焰拳王 / 雷霆击剑）
- 前三名显示奖牌 emoji：🥇🥈🥉，其余显示序号
- 当前用户所在行高亮（`is-me` 样式，青色背景 + 边框）
- 积分保留两位小数显示

---

## 7. 历史战绩

### 7.1 查看战绩

**接口**：`GET /api/player/match-history?limit=50`

**入参**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `limit` | number | 否 | 返回条数，默认 50，上限 100，下限 1 |

**筛选条件**：
- 仅返回 `status = settled` 的场次
- 仅返回当前用户作为红方或蓝方参与的场次（`red_user_id = uid OR blue_user_id = uid`）
- 按 `id DESC` 降序（最新的在前）

**返回结构**：
| 字段 | 类型 | 说明 |
|------|------|------|
| `sessionId` | number | 场次 ID |
| `settledAt` | string | 结算时间（ISO 8601） |
| `round` | number | 轮次 |
| `matchName` | string \| null | 场次名称 |
| `gameType` | GameType | 玩法 |
| `ratingGameType` | GameType | 积分结算玩法（与 gameType 一致） |
| `redPlayer` / `bluePlayer` | PlayerSlot \| null | 对阵双方 |
| `redScore` / `blueScore` | number \| null | 比分 |
| `result` | `'红方胜' \| '蓝方胜' \| '平局'` | 胜负结果 |
| `redRatingBefore` / `blueRatingBefore` | number \| null | 赛前积分 |
| `redRatingAfter` / `blueRatingAfter` | number \| null | 赛后积分 |
| `redRatingChange` / `blueRatingChange` | number \| null | 积分变化量 |

### 7.2 前端展示

- 在「我的」页面点击「过往战绩」弹出 `JoinMatchHistoryModal`
- 每条记录展示：对手信息、比分、积分变化（如 `+12.50` / `-8.30`）
- 积分变化格式化：正数带 `+` 前缀，保留两位小数

---

## 8. 状态与文案映射

前端根据场次状态和用户身份，展示不同的提示文案：

| 条件 | 提示文案 |
|------|---------|
| `sessionId === 0` | 「暂无场次：请管理员在「场次管理」中创建场次，或确认数据库已有 game_sessions 记录」 |
| `status = unknown` | 「场次状态暂无法识别（{raw}），请下拉刷新」 |
| `status = waiting` | 「新一轮流报名尚未开始（待管理员开放报名）」 |
| `status = betting` + 有 myPendingSide | 「已提交报名，请等待管理员审核」 |
| `status = betting` + 无 myPendingSide | 「报名进行中，请选择阵营并提交（需管理员通过后方可为正式选手）」 |
| `status = started` | 「比赛进行中」 |
| `status = settled` + 有比分 | 「本场已结束 · 比分 X : Y」 |
| `status = settled` + 无比分 | 「本场已结束」 |

**操作可用性**：仅在 `status = betting` 时允许报名/撤销操作（`canOperate = true`）。

---

## 9. 前端页面结构

### 9.1 页面路由

| 路由 | 说明 |
|------|------|
| `/pages/player/event` | **赛事主页面**（TabBar 页），整合参赛 + 竞猜 + 弹幕 |
| `/pages/player/join` | 旧参赛页面（已废弃，重定向到 event + 切换子 Tab） |
| `/pages/player/mine` | 「我的」页面，含过往战绩入口 |

### 9.2 赛事页（event.vue）结构
```
EventNavBar               → 顶部导航栏（返回/管理后台入口）
  → EventMatchModule          → 对阵展示区（VS 红蓝双方 + 状态）
SessionDanmakuLayer       → 弹幕飘屏层
  → EventJoinInfoStrip        → 参赛信息条（昵称 + 三项积分）
EventBetInfoStrip         → 竞猜信息条（昵称 + 竞猜币余额）
  → EventSubTabs              → 子 Tab 切换：「竞猜」「参赛」
  → [竞猜 Tab]
  QuizBettingPanel        → 竞猜下注面板
  QuizRankPreview         → 竞猜排行预览
[参赛 Tab]
  JoinSessionCard         → 参赛操作卡片（选阵营 + 确认/撤销）
  JoinRankingsSection     → 积分排行榜
```

### 9.3 JoinSessionCard 组件状态

| 子组件 | 展示条件 |
|--------|---------|
| `JoinSessionCardLoading` | 加载中且无缓存数据 |
| `JoinSessionCardError` | 接口报错 |
| `JoinSessionCardEmpty` | 无数据 |
| `JoinSessionMeta` | 场次元信息（玩法名称 + emoji） |
| `JoinLastSettledCard` | 上一局结算卡片（waiting/betting 时展示） |
| `JoinSessionVsRow` | 对阵行（betting/started/settled 时展示） |
| `JoinSettleExtras` | 结算扩展信息（冰球元素/拳王倒地等） |
| `JoinSessionPickActions` | 阵营选择 + 确认/撤销按钮（canOperate 时展示） |

### 9.4 参赛操作交互流程

```
用户进入赛事页 → 切换到「参赛」Tab
      → 加载场次状态（getPlayerSessionApi）
      → [sessionId = 0] → 显示「暂无场次」
      → [betting] + 名额空闲 → 显示「选择红方」「选择蓝方」按钮
      → 用户点击选择阵营 → selectedSide 状态更新（前端本地）
      → 用户点击确认 → 调用 registerPlayerSideApi({ side })
      → 成功 → 检查返回的 myPendingSide：
  - 有值 → Toast「已提交，请等待审核」
  - 无值 → Toast「报名成功」（罕见，理论上走审核流程）
      → 同步刷新竞猜 UI（refreshBettingUi）
```

---

## 10. 数据模型

### 10.1 game_session_registration_requests（报名请求表）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INT PK | 自增主键 |
| `session_id` | INT FK | 关联场次（级联删除） |
| `side` | ENUM('red','blue') | 申请的阵营 |
| `user_id` | INT FK | 关联用户（级联删除） |
| `created_at` | DATETIME | 创建时间 |

**索引**：
- `UQ_registration_session_user`（session_id, user_id）→ 同一场次同一用户唯一
- `IDX_registration_session_side`（session_id, side）→ 按场次+阵营查询待审列表

### 10.2 user_game_ratings（用户积分表）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INT PK | 自增主键 |
| `user_id` | INT FK | 关联用户（级联删除） |
| `game_type` | ENUM('hockey','boxing','fencing') | 玩法类型 |
| `rating` | DECIMAL(10,2) | 积分值，默认 100 |
| `created_at` | DATETIME | 创建时间 |
| `updated_at` | DATETIME | 更新时间 |

**索引**：
- `UQ_user_game_ratings_user_game`（user_id, game_type）→ 每个用户每个玩法仅一条

### 10.3 game_sessions（场次表，选手相关字段）

| 字段 | 类型 | 说明 |
|------|------|------|
| `red_user_id` | INT FK \| null | 红方正式选手 |
| `blue_user_id` | INT FK \| null | 蓝方正式选手 |
| `red_rating_before` | DECIMAL \| null | 红方赛前积分 |
| `blue_rating_before` | DECIMAL \| null | 蓝方赛前积分 |
| `red_rating_after` | DECIMAL \| null | 红方赛后积分 |
| `blue_rating_after` | DECIMAL \| null | 蓝方赛后积分 |
| `red_rating_change` | DECIMAL \| null | 红方积分变化 |
| `blue_rating_change` | DECIMAL \| null | 蓝方积分变化 |
| `locked_red_odds` | DECIMAL \| null | 锁定的红方赔率 |
| `locked_blue_odds` | DECIMAL \| null | 锁定的蓝方赔率 |
| `excluded_from_latest` | BOOLEAN | 是否已从「最新场次」中排除 |

---

## 11. 接口清单

### 11.1 选手端接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|:----:|------|
| GET | `/api/player/session` | JWT | 当前场次与阵营报名状态 |
| POST | `/api/player/register` | JWT | 报名红/蓝方 |
| POST | `/api/player/cancel` | JWT | 撤销参赛 |
| GET | `/api/player/my-ratings` | JWT | 个人三项玩法积分 |
| GET | `/api/player/match-history` | JWT | 历史战绩列表 |
| GET | `/api/player/rating-rankings` | — | 积分排行榜（按玩法） |

### 11.2 管理端接口（选手相关）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|:----:|------|
| POST | `/api/player/admin/approve-registration` | Admin JWT | 审核通过报名 |
| POST | `/api/player/admin/kick-player` | Admin JWT | 移出某方选手 |

---

## 12. 端到端流程

### 12.1 标准参赛流程

```
管理员创建场次 → waiting
        → 管理员开启报名 → betting
        → 选手 A 选择红方 → 创建 registration_requests(side=red, userA)
选手 B 选择红方 → 创建 registration_requests(side=red, userB)
选手 C 选择蓝方 → 创建 registration_requests(side=blue, userC)
        → 管理员审核通过 A（红方）→ session.redUserId = A.id
   → 删除红方全部 registration_requests（B 的申请被清理）
        → 管理员审核通过 C（蓝方）→ session.blueUserId = C.id
   → 删除蓝方全部 registration_requests
        → 双方就位，管理员开启竞猜 → guessingOpen = true
        → 管理员开始比赛 → started（锁定赔率，关闭竞猜）
        → 管理员录入比分 → settled
   → 计算积分变化 → 写入积分快照 → 结算竞猜
        → 管理员开启下一轮 / 返回首页
```

### 12.2 选手撤销流程

```
选手已提交报名（待审核）→ 调用 cancel → 删除 registration_requests → 释放名额
选手已是正式选手 → 调用 cancel → 清空 session.redUserId/blueUserId → 释放名额
```

### 12.3 管理员移出选手流程

```
管理员移出红方 → 清空 redUserId
             → 删除红方全部 registration_requests
             → 关闭竞猜（guessingOpen = false）
             → 若有已下注 → 全额退款（保持 BETTING 状态）
```

### 12.4 上一局结算信息展示

在 `waiting` 和 `betting` 阶段，场次视图会附带 `lastSettledMatch`：
- 取 id < 当前场次中、status = settled 的最大一条记录
- 展示内容：对阵双方、比分、胜负结果、锁定赔率
- 前端在 `JoinLastSettledCard` 组件中展示

---

## 13. 并发安全设计

| 场景 | 保护机制 |
|------|---------|
| 多人同时报名同一阵营 | 悲观锁 `pessimistic_write` + 唯一约束 `UQ_registration_session_user` |
| 报名与审核并发 | 事务内锁定 session 行 + 请求行 |
| 移出选手与退款 | 事务内依次执行移出 + 退款，保证原子性 |
| 积分计算并发 | `applyReferenceRatingSettlement` 在 `manager` 事务内执行，锁定 rating 行 |
| 场次查询一致性 | `getLatestSessionEntity` 使用 `excluded_from_latest = false` 过滤已收起场次 |

---

## 14. 异常处理

| 异常场景 | 处理方式 |
|---------|---------|
| 无场次时报名/撤销 | 返回 404「当前没有进行中的场次」 |
| 非 betting 状态报名 | 返回 400「当前不在报名阶段」 |
| 阵营名额已被占用 | 返回 409「名额已被占用」 |
| 已在对方阵营 | 返回 400「您已在对方阵营报名，请先撤销」 |
| 撤销时未报名 | 返回 400「您未在本场次报名」 |
| 审核时目标阵营已有正式选手 | 返回 400「已有正式选手」 |
| 移出时该方无选手 | 返回 400「暂无选手」 |
| 场次状态识别失败 | 前端降级显示 `unknown` 状态 + 提示刷新 |

---

## 15. 关键业务常量汇总

| 常量 | 值 | 说明 |
|------|----:|------|
| 默认积分 | 100 | 新用户/无记录用户的基础积分 |
| 积分下限 | 1 | 积分不低于此值 |
| 单场积分基数 | 20 | 每场积分变化的乘数因子 |
| 赔率手续费率 | 0.1 (10%) | 从原始赔率中扣除 |
| 赔率下限 | 1.1 | 最低赔率 |
| 赔率上限 | 2.0 | 最高赔率 |
| 历史战绩默认条数 | 50 | `match-history` 默认 limit |
| 历史战绩最大条数 | 100 | `match-history` limit 上限 |
