# 赛事与场次管理 PRD

> **文档版本**: v1.0  
> **最后更新**: 2026-05-11  
> **文档性质**: 基于代码逆向梳理  
> **对应后端模块**: `modules/player`（`player-admin.controller.ts` / `player-admin-session.service.ts` / `player-join.service.ts` / `player-session-view.service.ts` / `player-rating.service.ts`）  
> **对应前端页面**: `pages/player/admin.vue`（管理端）、`pages/player/join.vue`（选手报名）、`pages/player/event.vue`（对局详情）

---

## 一、模块概述

### 1.1 模块定位

赛事与场次管理是 LumiSport 平台的**核心运营中枢**，负责：

- 管理员创建、配置、操控比赛场次的全生命周期
- 选手报名参赛（红/蓝方阵营选择）
- 观众围观实时赛况（场次状态同步）
- 比赛结果录入与积分结算
- 多轮连续对局管理

### 1.2 核心业务概念

| 概念 | 说明 |
|------|------|
| **场次（Session）** | 一场完整的比赛单元，从创建到结算为一个场次。同一时刻仅有一个「最新可操作场次」 |
| **轮次（Round）** | 一个多局系列赛中的第 N 局。每局结算后可无缝开启下一轮，轮次编号自动递增 |
| **阵营（Side）** | 每局比赛分为红方（red）和蓝方（blue），各占一个选手位 |
| **玩法/游戏类型（GameType）** | 三种比赛项目：疾速冰球（hockey）、烈焰拳王（boxing）、雷霆击剑（fencing） |
| **大师模式（MasterMode）** | 冰球专属高级模式，除比分外还需录入冰/火/风球出现次数 |
| **竞猜开关（guessingOpen）** | 报名阶段内独立控制的观众竞猜开放标记 |

---

## 二、角色与权限

### 2.1 管理员（admin）

拥有全部赛事操控权限：

| 操作 | 说明 | 前置条件 |
|------|------|----------|
| 配置场次 | 设置名称/玩法/大师模式 | 状态为 `waiting` |
| 开始报名 | `waiting → betting` | 已有配置的场次 |
| 开启竞猜 | 开放观众下注 | `betting` + 双方选手就位 + 实力差距未超阈值 |
| 开始比赛 | `betting → started` | `betting` 状态 |
| 结束比赛 | `started → settled` | `started` 状态 + 填写结果 |
| 开启下一轮 | `settled → 新 waiting` | `settled` 状态 |
| 返回首页 | 收起当前场次 | 任意状态（中间状态会退款） |
| 取消本局竞猜 | 全额退款 + 回到 waiting | `betting` 状态 |
| 通过报名审核 | 待审 → 正式选手 | `betting` 状态 |
| 移出选手 | 踢出正式/待审选手 | `betting` 状态 |
| 查看竞猜大盘 | 所有人下注汇总 | 任意时刻 |

### 2.2 选手（user）

| 操作 | 说明 | 前置条件 |
|------|------|----------|
| 选择阵营报名 | 申请加入红方或蓝方 | `betting` 状态 + 目标阵营名额空 |
| 撤销参赛 | 取消报名或退出正式位 | `betting` 状态 |
| 查看当前场次 | 赛况、状态、双方信息 | 任意时刻 |
| 查看历史战绩 | 个人参与过的已结算场次 | 任意时刻 |
| 查看积分排名 | 按玩法的全服排名 | 任意时刻 |

### 2.3 观众（未报名的普通用户）

| 操作 | 说明 |
|------|------|
| 查看当前场次 | 赛况、状态、双方信息 |
| 竞猜下注（竞猜模块） | `guessingOpen = true` 时 |

---

## 三、场次状态机

### 3.1 状态定义

```
SessionStatus 枚举值：

┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ WAITING  │ ──► │ BETTING  │ ──► │ STARTED  │ ──► │ SETTLED  │
│ 等待报名 │     │ 报名中   │     │ 比赛中   │     │ 已结算   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     ▲                                                   │
     │              adminNextRound()                      │
     └───────────────────────────────────────────────────┘
```

| 状态 | 枚举值 | 含义 | 可执行操作 |
|------|--------|------|-----------|
| **waiting** | `waiting` | 场次已创建，等待管理员开启报名 | 管理员：配置场次、开始报名、返回首页 |
| **betting** | `betting` | 报名阶段，选手可选择阵营 | 管理员：开启竞猜、开始比赛、通过审核、移出选手、取消竞猜、返回首页<br>选手：报名、撤销 |
| **started** | `started` | 比赛进行中 | 管理员：结束比赛、返回首页（退款） |
| **settled** | `settled` | 本局已结算，积分已更新 | 管理员：开启下一轮、返回首页 |

### 3.2 特殊流转

#### 取消本局竞猜（cancel-betting-round）
```
betting ──[取消竞猜]──► waiting
          ↑ 全额退还所有押注
          ↑ 局数 +1（逻辑上视为新的一局）
```

#### 返回首页（return-home）
```
waiting  ──[返回首页]──► 收起（excludedFromLatest = true）
betting  ──[返回首页]──► 全额退款 → 收起
started  ──[返回首页]──► 全额退款 → 收起
settled  ──[返回首页]──► 收起（数据保留可查）
```
> 收起后该场次不再作为「最新可操作场次」显示，但历史数据（战绩/流水/积分）仍然保留。

#### 报名中的竞猜子状态
```
betting + guessingOpen = false  →  仅报名，观众不可下注
betting + guessingOpen = true   →  报名 + 竞猜同时开放
```

---

## 四、功能详述

### 4.1 管理端功能

#### 4.1.1 配置场次（configure）

**接口**: `POST /api/player/admin/configure`  
**前置条件**: 无场次时创建新局；有 `waiting` 状态场次时修改配置

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| matchName | string(200) | 否 | 场次名称，如"周六擂台赛" |
| gameType | enum | 否 | `hockey` / `boxing` / `fencing`，默认 `hockey` |
| isMasterMode | boolean | 否 | 冰球是否启用大师模式，默认 `true` |

**业务规则**：
- 首次配置：自动创建一条新 `game_sessions` 记录，`round = 1`，`status = waiting`
- 修改配置：仅 `waiting` 状态可修改；`betting/started` 阶段不可修改
- 不传 `matchName` 时场次名称为 `null`，前端按 `第N局` 显示

#### 4.1.2 开始报名（open-betting）

**接口**: `POST /api/player/admin/open-betting`  
**流转**: `waiting → betting`

**业务规则**：
- 重置竞猜开关：`guessingOpen = false`
- 此后选手可开始选择阵营报名

#### 4.1.3 开启竞猜（open-guessing）

**接口**: `POST /api/player/admin/open-guessing`  
**前置条件**: `betting` 状态 + 双方选手均已就位

**业务规则**：
- 红蓝双方均已有正式选手（`redUserId` / `blueUserId` 非 null）
- 实力差距检查：计算双方当前玩法的积分，若差距超过阈值（`shouldVoidAllBetsAtMatchStart`）则拒绝开启，提示 `BETTING_BLOCKED_LOPSIDED_MESSAGE`
- 设置 `guessingOpen = true`，观众可开始下注

#### 4.1.4 开始比赛（start-match）

**接口**: `POST /api/player/admin/start-match`  
**流转**: `betting → started`

**业务规则**：
- **锁定赔率**：计算红蓝双方的当前玩法积分，基于积分差生成锁定赔率：
  - 预期胜率 `winRate = myRating / (myRating + enemyRating)`
  - 赔率 `odds = (1 / winRate) × (1 - 手续费率 0.1)`
  - 赔率范围 `[1.1, 2.0]`
  - 写入 `lockedRedOdds` / `lockedBlueOdds`
- **实力悬殊流局**：若双方积分差距超过阈值或存在机器人对手，则：
  - 作废全部已有押注，全额退款
  - 置 `betsVoidedAtMatchStart = true`
  - 清空锁定赔率
- 关闭竞猜：`guessingOpen = false`

#### 4.1.5 结束比赛（end-match）

**接口**: `POST /api/player/admin/end-match`  
**流转**: `started → settled`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| redScore | int(0~9999) | ✅ | 红方得分 |
| blueScore | int(0~9999) | ✅ | 蓝方得分 |
| iceBalls | int(0~9999) | 条件必填 | 冰球大师模式：冰球出现次数 |
| fireBalls | int(0~9999) | 条件必填 | 冰球大师模式：火球出现次数 |
| windBalls | int(0~9999) | 条件必填 | 冰球大师模式：风球出现次数 |
| totalKnockdowns | int(0~9999) | 条件必填 | 拳王模式：倒地次数总和 |

**条件必填规则**：

| 玩法 | 大师模式 | 额外必填字段 |
|------|---------|-------------|
| 疾速冰球 | ✅ 开启 | iceBalls + fireBalls + windBalls |
| 疾速冰球 | ❌ 关闭 | 无 |
| 烈焰拳王 | — | totalKnockdowns |
| 雷霆击剑 | — | 无 |

**结算流程**（事务内依次执行）：

1. **录入比分**：写入 `redScore` / `blueScore` 及玩法扩展字段
2. **元素之王判定**（冰球大师模式）：取冰/火/风球最大值对应的元素作为 `elementWinner`；平局时优先级为 ice > fire > wind
3. **积分结算**（`applyReferenceRatingSettlement`）：
   - 取双方当前玩法的积分（`user_game_ratings`）
   - 平局：双方积分不变
   - 胜负：胜方加分，败者扣分
   - 积分变化量 = `20 × (对手积分 / 双方积分之和)`（`REF_SCORE_RATE = 20`）
   - 最低积分不低于 1（`REF_MIN_RATING = 1`）
   - 写入快照：`redRatingBefore` / `redRatingAfter` / `redRatingChange`（蓝方同理）
4. **竞猜结算**（`settleBetsForSession`）：结算本场所有竞猜押注（详见竞猜系统 PRD）
5. **更新状态**：`status = settled`

#### 4.1.6 开启下一轮（next-round）

**接口**: `POST /api/player/admin/next-round`  
**前置条件**: `settled` 状态

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| matchName | string(200) | 否 | 新局名称，不填则默认"第N局" |
| gameType | enum | 否 | 不填则沿用上一局玩法 |
| isMasterMode | boolean | 否 | 不填则沿用上一局设置 |

**业务规则**：
- 创建一条新的 `game_sessions` 记录
- `round = 上一局 round + 1`
- 红蓝双方选手位清空
- 所有字段初始化为 null / 默认值
- 状态为 `waiting`

#### 4.1.7 返回首页（return-home）

**接口**: `POST /api/player/admin/return-home`

**业务规则**（按当前状态）：

| 当前状态 | 处理 |
|---------|------|
| waiting | 清除报名请求 → 收起 |
| betting | 全额退还所有押注 → 清除报名请求 → 收起 |
| started | 全额退还所有押注 → 收起 |
| settled | 直接收起 |

> 收起 = 设置 `excludedFromLatest = true`，该场次不再出现在「最新可操作场次」查询中，但数据保留。

#### 4.1.8 取消本局竞猜（cancel-betting-round）

**接口**: `POST /api/player/admin/cancel-betting-round`  
**前置条件**: `betting` 状态

**业务规则**：
- 全额退还本场所有押注
- 局数 `round + 1`
- 状态回到 `waiting`（实际实现为退款后视同新建一局）

#### 4.1.9 通过报名审核（approve-registration）

**接口**: `POST /api/player/admin/approve-registration`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| side | enum | ✅ | `red` / `blue` |
| userId | int | ✅ | 待审核选手的用户 ID |

**业务规则**：
- 该侧必须有待审申请（`game_session_registration_requests` 中存在记录）
- 该侧正式选手位必须为空（`redUserId` / `blueUserId` 为 null）
- 审核通过后：将该用户设为该侧正式选手，删除该侧所有待审申请
- 若该侧已有正式选手，拒绝操作

#### 4.1.10 移出选手（kick-player）

**接口**: `POST /api/player/admin/kick-player`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| side | enum | ✅ | `red` / `blue` |

**业务规则**：
- 移出该侧的正式选手（置 null）及所有待审申请
- 关闭竞猜：`guessingOpen = false`
- 若本场已有押注，则全额退款（保持 `betting` 状态不变）
- 该侧无选手时拒绝操作

#### 4.1.11 查看竞猜大盘（betting-pool）

**接口**: `GET /api/player/admin/betting-pool`  
**返回**: 当前场次所有竞猜下注的汇总视图（详见竞猜系统 PRD）  
**特殊**: 无可操作场次时返回 `sessionId = 0` 的空池占位

#### 4.1.12 排查调试（debug-session-store）

**接口**: `GET /api/player/admin/debug-session-store`  
**用途**: 排查"删库后仍显示旧局"问题  
**返回**: 当前连接的数据库名、MySQL 主机名、场次表总行数、最大 ID、最新未收起场次信息

---

### 4.2 选手端功能

#### 4.2.1 选择阵营报名（register）

**接口**: `POST /api/player/register`  
**前置条件**: 当前存在 `betting` 状态的场次

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| side | enum | ✅ | `red` / `blue` |

**业务规则**：

| 场景 | 处理 |
|------|------|
| 目标阵营正式位为空 | 创建待审申请（`game_session_registration_requests`） |
| 已是目标阵营正式选手 | 幂等返回，不重复创建 |
| 已有目标阵营待审申请 | 幂等返回，不重复创建 |
| 目标阵营正式位已被占 | 报错 `ConflictException`：名额已被占用 |
| 已在对方阵营（正式或待审） | 报错：请先撤销当前报名 |
| 非报名阶段 | 报错：当前不在报名阶段 |

> **注意**：报名是「待审」机制，最终能否上场取决于管理员审核通过。但也存在管理员直接确认无需审核的场景。

#### 4.2.2 撤销参赛（cancel）

**接口**: `POST /api/player/cancel`  
**前置条件**: `betting` 状态

**业务规则**：
- 若有待审申请：直接删除申请记录
- 若是正式选手：将该侧正式位清空（`redUserId = null` 或 `blueUserId = null`）
- 非报名阶段不可撤销
- 不在该场次中时报错

#### 4.2.3 查看当前场次（getSessionStatus）

**接口**: `GET /api/player/session`  
**返回**: `PlayerSessionView` 结构（见 4.3 节）

#### 4.2.4 查看历史战绩（getMatchHistory）

**接口**: `GET /api/player/match-history`  
**返回**: 用户参与过的所有已结算场次列表，包含：
- 场次信息（ID、轮次、名称、玩法）
- 双方选手信息、比分、结果
- 积分变化快照（before / after / change）
- 按场次 ID 降序排列，默认最多 50 条

#### 4.2.5 查看积分排名（getRatingRankings）

**接口**: `GET /api/player/rating-rankings?gameType=hockey`  
**返回**: 按指定玩法的全服积分排名

#### 4.2.6 查看我的积分（getMyRatings）

**接口**: `GET /api/player/my-ratings`  
**返回**: 当前用户三项玩法的积分（hockey / boxing / fencing）

---

### 4.3 场次视图（PlayerSessionView）

所有接口返回统一的场次视图结构：

```typescript
interface PlayerSessionView {
  // 基础信息
  sessionId: number            // 场次 ID（0 = 无可操作场次/空占位）
  round: number                // 轮次编号
  gameType: GameType           // 玩法
  status: SessionStatus        // 当前状态
  matchName: string | null     // 场次名称
  isMasterMode: boolean        // 冰球大师模式

  // 红方信息
  redPlayer: { id, displayName } | null   // 正式选手
  redPendingPlayers: { id, displayName }[] // 待审选手列表
  redRating: number                        // 红方当前玩法积分
  redAvailable: boolean                    // 红方名额是否空闲

  // 蓝方信息
  bluePlayer: { id, displayName } | null
  bluePendingPlayers: { id, displayName }[]
  blueRating: number
  blueAvailable: boolean

  // 当前用户视角
  mySide: 'red' | 'blue' | null          // 已是哪方正式选手
  myPendingSide: 'red' | 'blue' | null   // 待审在哪方

  // 比赛结果
  redScore: number | null
  blueScore: number | null
  iceBalls: number | null      // 冰球大师
  fireBalls: number | null     // 冰球大师
  windBalls: number | null     // 冰球大师
  totalKnockdowns: number | null // 拳王
  elementWinner: string | null   // 元素之王

  // 竞猜状态
  guessingOpen: boolean        // 当前是否开放竞猜

  // 上一局结算（waiting/betting 时展示）
  lastSettledMatch: {
    sessionId, round, matchName, gameType,
    redPlayer, bluePlayer, redScore, blueScore,
    result: '红方胜' | '蓝方胜' | '平局',
    odds: { red, blue } | null
  } | null
}
```

---

## 五、积分系统

### 5.1 积分模型

| 参数 | 值 | 说明 |
|------|-----|------|
| 初始积分 | 100 | 新用户在任意玩法上的起始积分 |
| 最低积分 | 1 | 积分不会低于此值 |
| 每局变化率 | 20 | `REF_SCORE_RATE`，决定每局积分变化的基数 |

### 5.2 积分计算规则

```
胜方积分增量 = REF_SCORE_RATE × (败方积分 / 双方积分之和)
败方积分减量 = REF_SCORE_RATE × (胜方积分 / 双方积分之和)
```

**示例**：
- 红方积分 120，蓝方积分 80，红方胜
- 红方增量 = 20 × (80 / 200) = 8 → 新积分 128
- 蓝方减量 = 20 × (120 / 200) = 12 → 新积分 68
- 平局时双方积分不变

### 5.3 积分与赔率

| 参数 | 值 | 说明 |
|------|-----|------|
| 手续费率 | 0.1 (10%) | `REF_ODDS_FEE_RATE` |
| 最低赔率 | 1.1 | `REF_MIN_WIN_ODDS` |
| 最高赔率 | 2.0 | `REF_MAX_WIN_ODDS` |

```
预期胜率 = 我方积分 / (我方积分 + 对方积分)
基础赔率 = 1 / 预期胜率
最终赔率 = 基础赔率 × (1 - 手续费率)
最终赔率 = clamp(最终赔率, 1.1, 2.0)
```

### 5.4 积分独立

三项玩法（冰球/拳王/击剑）各有独立积分，互不影响。`user_game_ratings` 表以 `(userId, gameType)` 为唯一键。

---

## 六、数据模型

### 6.1 game_sessions（场次表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | 自增主键 |
| game_type | enum(hockey/boxing/fencing) | 玩法类型 |
| status | enum(waiting/betting/started/settled) | 场次状态 |
| match_name | varchar(200) | 场次名称（可 null） |
| is_master_mode | boolean | 冰球大师模式（默认 true） |
| round | int | 轮次编号（默认 1） |
| red_user_id | int FK→users | 红方选手 |
| blue_user_id | int FK→users | 蓝方选手 |
| red_score | int | 红方得分 |
| blue_score | int | 蓝方得分 |
| ice_balls | int | 冰球次数（冰球大师） |
| fire_balls | int | 火球次数（冰球大师） |
| wind_balls | int | 风球次数（冰球大师） |
| total_knockdowns | int | 倒地次数总和（拳王） |
| element_winner | enum(ice/fire/wind) | 元素之王 |
| red_rating_before | decimal(10,2) | 红方结算前积分 |
| blue_rating_before | decimal(10,2) | 蓝方结算前积分 |
| red_rating_after | decimal(10,2) | 红方结算后积分 |
| blue_rating_after | decimal(10,2) | 蓝方结算后积分 |
| red_rating_change | decimal(10,2) | 红方积分变化量 |
| blue_rating_change | decimal(10,2) | 蓝方积分变化量 |
| locked_red_odds | decimal(10,2) | 锁定红方赔率 |
| locked_blue_odds | decimal(10,2) | 锁定蓝方赔率 |
| bets_voided_at_match_start | boolean | 开赛时是否已流局退款 |
| excluded_from_latest | boolean | 是否已收起（返回首页） |
| guessing_open | boolean | 竞猜开关 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### 6.2 game_session_registration_requests（报名申请表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | 自增主键 |
| session_id | int FK→game_sessions | 所属场次 |
| side | enum(red/blue) | 申请阵营 |
| user_id | int FK→users | 申请用户 |
| created_at | datetime | 申请时间 |

**唯一约束**: `(session_id, user_id)` — 同一场次同一用户仅可有一条申请

### 6.3 user_game_ratings（用户玩法积分表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | 自增主键 |
| user_id | int FK→users | 用户 |
| game_type | enum(hockey/boxing/fencing) | 玩法 |
| rating | decimal | 积分（默认 100） |

**唯一约束**: `(user_id, game_type)`

---

## 七、端到端业务流程

### 7.1 标准比赛流程

```
管理员                     系统                      选手/观众
  │                        │                           │
  ├─ 配置场次 ────────────►│                           │
  │  (选玩法/大师模式)      │                           │
  │                        │  status = waiting          │
  │                        │                           │
  ├─ 开始报名 ────────────►│                           │
  │                        │  status = betting          │
  │                        │  guessingOpen = false      │
  │                        │                    ◄───── 选手选择阵营
  │                        │                    (创建待审申请)
  │                        │                           │
  ├─ 审核通过报名 ─────────►│                           │
  │  (确认选手身份)         │  设为正式选手              │
  │                        │                           │
  ├─ 开启竞猜 ────────────►│                           │
  │  (双方就位后)           │  guessingOpen = true       │
  │                        │                    ◄───── 观众下注
  │                        │                           │
  ├─ 开始比赛 ────────────►│                           │
  │                        │  status = started          │
  │                        │  锁定赔率                  │
  │                        │  guessingOpen = false      │
  │                        │  (可能触发流局退款)        │
  │                        │                           │
  │                        │  ◄──── 比赛进行中 ───────► │
  │                        │                           │
  ├─ 结束比赛 ────────────►│                           │
  │  (录入比分+扩展数据)    │  status = settled          │
  │                        │  积分结算                  │
  │                        │  竞猜结算                  │
  │                        │                           │
  ├─ 开启下一轮 ──────────►│                           │
  │  (可选换玩法)           │  新建 round+1              │
  │                        │  status = waiting          │
  │                        │                           │
  └────────────────────────┘                           │
```

### 7.2 异常流程

#### 7.2.1 实力悬殊流局

```
开始比赛 → 检测双方积分差距超阈值
         → 全额退还所有押注
         → betsVoidedAtMatchStart = true
         → 赔率清空
         → 仍然 started（比赛照打，但不涉及竞猜）
```

#### 7.2.2 管理员中途返回首页

```
返回首页 → 当前为 betting/started
        → 全额退还所有押注
        → 清除报名申请
        → excludedFromLatest = true
        → 场次数据保留（可查历史）
```

#### 7.2.3 移出选手后退竞猜

```
移出选手 → 该侧正式/待审选手清除
        → guessingOpen = false
        → 若已有押注 → 全额退款（保持 betting 状态）
```

---

## 八、三种玩法差异对比

| 维度 | 疾速冰球（hockey） | 烈焰拳王（boxing） | 雷霆击剑（fencing） |
|------|-------------------|-------------------|-------------------|
| 基础比分 | ✅ red/blue score | ✅ red/blue score | ✅ red/blue score |
| 大师模式 | ✅ 可选（默认开） | ❌ 不适用 | ❌ 不适用 |
| 扩展数据 | 冰/火/风球次数 | 倒地次数总和 | 无 |
| 元素之王判定 | ✅ 最多的元素胜出 | ❌ 不适用 | ❌ 不适用 |
| 结算必填字段 | redScore + blueScore + (大师: iceBalls/fireBalls/windBalls) | redScore + blueScore + totalKnockdowns | redScore + blueScore |
| 竞猜扩展玩法 | 元素之王竞猜 + 精确总分 | 倒地之王竞猜 + 精确分差 | 精确总分竞猜 |

---

## 九、关键业务规则汇总

| # | 规则 | 来源 |
|---|------|------|
| 1 | 同一时刻全局仅有一个「最新可操作场次」（`excluded_from_latest = false` 的最大 ID 行） | `getLatestSessionEntity` |
| 2 | 报名必须走待审流程，最终由管理员审核通过确认 | `register` + `approveRegistration` |
| 3 | 同一场次同一用户只能申请一次（唯一约束），且只能选一个阵营 | `UQ_registration_session_user` |
| 4 | 开启竞猜前必须双方就位，且实力差距未超阈值 | `adminOpenGuessing` |
| 5 | 开赛瞬间锁定赔率，此后不再变化 | `adminStartMatch` |
| 6 | 开赛时若实力悬殊则自动流局退款（比赛照打） | `shouldVoidAllBetsAtMatchStart` |
| 7 | 三种玩法积分完全独立，互不影响 | `user_game_ratings` 按 gameType 分 |
| 8 | 积分变化在 `settled` 时一次性结算写入，包含 before/after/change 快照 | `applyReferenceRatingSettlement` |
| 9 | 返回首页不会删除历史数据，仅标记 `excludedFromLatest` | `adminReturnToHome` |
| 10 | 无可操作场次时返回 `sessionId = 0` 的空占位视图，前端展示配置入口 | `buildEmptySessionView` |
| 11 | 所有涉及押注金额的操作（开赛/移出/返回首页/取消竞猜）均在事务内完成，保证数据一致性 | `@Transaction` + `pessimistic_write` 锁 |
| 12 | 「下一轮」默认沿用上一局的玩法和大师模式设置，可覆盖修改 | `adminNextRound` |

---

## 十、接口清单

### 10.1 管理端接口

| 方法 | 路径 | 说明 | 前置状态 |
|------|------|------|---------|
| POST | `/api/player/admin/configure` | 配置/创建场次 | waiting 或无场次 |
| POST | `/api/player/admin/open-betting` | 开始报名 | waiting |
| POST | `/api/player/admin/open-guessing` | 开启竞猜 | betting + 双方就位 |
| POST | `/api/player/admin/start-match` | 开始比赛 | betting |
| POST | `/api/player/admin/end-match` | 结束比赛 | started |
| POST | `/api/player/admin/next-round` | 开启下一轮 | settled |
| POST | `/api/player/admin/return-home` | 返回首页 | 任意 |
| POST | `/api/player/admin/cancel-betting-round` | 取消本局竞猜 | betting |
| POST | `/api/player/admin/approve-registration` | 通过报名审核 | betting |
| POST | `/api/player/admin/kick-player` | 移出选手 | betting |
| GET | `/api/player/admin/session` | 获取当前场次 | — |
| GET | `/api/player/admin/betting-pool` | 竞猜大盘 | — |
| GET | `/api/player/admin/debug-session-store` | 排查调试 | — |

### 10.2 选手端接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/player/session` | 获取当前场次视图 |
| POST | `/api/player/register` | 选择阵营报名 |
| POST | `/api/player/cancel` | 撤销参赛 |
| GET | `/api/player/match-history` | 历史战绩 |
| GET | `/api/player/rating-rankings` | 积分排名 |
| GET | `/api/player/my-ratings` | 我的积分 |

> **鉴权**: 所有接口均需 JWT Token；管理端接口额外要求 `role = admin`（`AdminGuard`）。

---

## 十一、并发与数据安全

### 11.1 悲观锁

所有涉及场次状态变更 + 押注金额操作的方法均使用 `pessimistic_write` 行锁：

- `adminOpenGuessing`
- `adminStartMatch`
- `adminEndMatch`
- `adminCancelBettingRound`
- `adminApproveRegistration`
- `adminKickPlayer`
- `adminReturnToHome`
- `register`（选手报名）
- `cancel`（选手撤销）

### 11.2 事务保证

所有多表操作（结算/退款/报名）均在 `dataSource.transaction` 中执行，任一步失败则整体回滚。

### 11.3 幂等性

- 重复报名同一阵营 → 幂等返回当前视图
- 已是正式选手再报同一阵营 → 幂等返回
- 无场次时配置 → 自动创建新局

---

## 十二、前端页面映射

| 页面 | 文件 | 职责 |
|------|------|------|
| 管理端首页 | `admin.vue` | 场次状态总览、所有管理操作按钮、竞猜大盘入口 |
| 竞猜大盘 | `AdminBettingPool.vue` | 管理员查看全场上注汇总 |
| 选手报名 | `join.vue` | 选择红/蓝方阵营、查看当前积分 |
| 对局详情 | `event.vue` | 当前场次实时状态、比分展示、弹幕互动 |
| 个人中心 | `mine.vue` | 历史战绩、各玩法积分 |

---

## 附录：术语表

| 术语 | 英文/代码 | 说明 |
|------|----------|------|
| 场次 | Session / GameSession | 一局完整比赛 |
| 轮次 | Round | 多局系列赛中的第 N 局 |
| 大师模式 | Master Mode | 冰球高级模式，需录入元素球数据 |
| 元素之王 | Element King | 冰球大师模式中，出现次数最多的元素 |
| 流局 | Void | 因实力悬殊等原因作废全部押注 |
| 锁定赔率 | Locked Odds | 开赛时固定的胜负赔率，后续不变 |
| 收起 | Exclude | 管理员返回首页后，场次不再显示为「最新」 |
| 待审 | Pending | 选手报名后的审核状态 |
| 正式选手 | Approved Player | 管理员审核通过后的确认选手 |
