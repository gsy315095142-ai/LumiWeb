# 小程序远程操控大空间赛事 — 功能设计

> 核心原则：**小程序和 Server 本地控制台（CtrlMatchForm）是并列的双通道**，任一端操作都走同一套事件驱动，互不干扰，状态始终一致。

---

## 一、现状分析

### 1.1 当前架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Server (Unity)                               │
│                                                                     │
│  CtrlMatchForm (本地UI)                                             │
│    │ 点击"开始游戏" → Fire CtrlStartGameEventArgs                   │
│    │ 点击"再来一次" → Fire CtrlReplayGameEventArgs                  │
│    ▼                                                                 │
│  GameProgressManager ── 订阅 Ctrl 事件 ──→ 状态机流转               │
│    None → Match → GamingReady → GamingPlaying → GamingEnd          │
│                          ↑                                          │
│                    MatchManager (玩家管理/帧同步)                     │
│                                                                     │
│  ContestSyncManager ── HTTP 单向推送 ──→ NestJS 后端                │
│    configure / lock / settle / reset / cancel                       │
│    弹幕轮询 ←── HTTP Polling ──← NestJS 后端                       │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │ 单向 HTTP
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NestJS 后端 (Wechat Backend)                     │
│                                                                     │
│  PlayerAdminController:                                            │
│    POST /api/player/admin/configure    → 竞猜配置                    │
│    POST /api/player/admin/open-betting → 开启报名                    │
│    POST /api/player/admin/start-match  → 开始比赛（仅改 DB 状态）     │
│    POST /api/player/admin/end-match    → 结束比赛（手动填比分）       │
│    POST /api/player/admin/next-round   → 下一轮                     │
│                                                                     │
│  同时被 Server ContestSyncManager 调用:                              │
│    POST /api/admin/configure / lock / settle / reset / cancel       │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │ HTTP
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    微信小程序 (UniApp)                               │
│                                                                     │
│  admin.vue → usePlayerAdminPage:                                    │
│    configure → open-betting → start-match → end-match → next-round  │
│    问题：start-match 只改了后端 DB 状态，                             │
│          实际上没有通知 Server 的 GameProgressManager 启动游戏！       │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 关键缺陷

| 问题 | 说明 |
|------|------|
| **Server → 后端单向** | `ContestSyncManager` 只能 HTTP POST 推送事件给后端，后端无法反向控制 Server |
| **小程序 start-match ≠ 真正开始** | 小程序 admin 的 `start-match` 只改了后端 DB 状态（betting→started），并没有触发 Server 端的 `CtrlStartGameEventArgs`，Server 端游戏不会真正启动 |
| **两套状态机脱节** | 后端有 `SessionStatus`（waiting/betting/started/settled），Server 有 `EGameProgress`（None/Match/GamingReady/GamingPlaying/GamingEnd），两者不联动 |
| **结束比赛需手动填比分** | 小程序 admin 结束比赛需要管理员手动输入比分，而不是从 Server 自动获取 |

### 1.3 设计目标

1. **小程序能完整操控 Server 端游戏进程**（选游戏、开始、结束、重置）
2. **CtrlMatchForm 完全不受影响**——仍然可以本地点击操作
3. **两边操作状态一致**——任一端操作后，另一端能实时看到最新状态
4. **比赛数据自动同步**——比分、计时等不再需要手动输入

---

## 二、架构设计

### 2.1 核心思路：在 Server 端新增「远程指令接收器」

不改变现有任何事件流，只是在 Server 端新增一个 HTTP/WS 入口，收到小程序的指令后，**Fire 同样的事件**，效果与 CtrlMatchForm 点击按钮完全等价。

```
┌──────────────────────────────────────────────────────────┐
│                    Server (Unity)                         │
│                                                          │
│  CtrlMatchForm ──┐                                       │
│    点击按钮       │  Fire 同一组 EventArgs                │
│                  ├──→ GameProgressManager ──→ 状态机      │
│  RemoteCtrlHub ──┘                                       │
│    (新增，HTTP API)                                       │
│      ↑ 接收小程序/后端指令                                │
│      ↓ Fire 对应的 CtrlStartGame / CtrlReplay 等          │
│                                                          │
│  状态变更 → 通过 ContestSyncManager 推送到后端            │
│  比分/计时 → 通过 RemoteCtrlHub 的状态查询接口暴露        │
└──────────────────────────────────────────────────────────┘
```

### 2.2 通信通道选择：HTTP REST API（推荐）

| 方案 | 优点 | 缺点 |
|------|------|------|
| **HTTP REST（推荐）** | 简单可靠、Server 已有 `ContestSyncManager` 的 HTTP 经验、NestJS 后端原生支持 HTTP 转发 | 非实时（需轮询状态） |
| WebSocket 双向 | 实时双向推送 | 需要在 Server 端新增 WS Client，增加复杂度 |
| 后端 → Server HTTP → 状态轮询 | 最小改动 | 状态同步有延迟（1-2s 可接受） |

**推荐方案**：Server 端内置一个轻量 HTTP Server（用 C# HttpListener），暴露 REST API。NestJS 后端作为代理转发小程序的指令。

### 2.3 数据流全景

```
小程序 admin.vue
    │ POST /api/player/admin/start-match
    ▼
NestJS 后端 PlayerAdminController
    │ POST http://{server-ip}:{ctrl-port}/ctrl/start
    ▼
Server RemoteCtrlHub (新增)
    │ Fire CtrlStartGameEventArgs.Create(gameType, hasHandedness)
    ▼
GameProgressManager.OnCtrlStartGameEvent()   ← 同一条路径！
    │ m_GameProgress = GamingReady
    │ MatchManager.GameProgressGaming()
    │ Fire StartGameEventArgs
    ▼
ContestSyncManager.OnCtrlStartGameEvent()    ← 自动触发 lock
    │ POST /api/admin/lock → 后端
    ▼
后端 DB 状态同步 → 小程序轮询刷新

同时：
GameProgressManager 状态变更 → RemoteCtrlHub 暴露 GET /ctrl/status
    ← 小程序轮询（2-3s 间隔）获取实时状态
```

---

## 三、Server 端改造

### 3.1 新增 RemoteCtrlHub（HTTP 控制接口）

在 Server 端新增一个轻量 HTTP Server 模块：

```csharp
// RemoteCtrlHub.cs — 远程控制中枢
// 监听 HTTP 请求，Fire 与 CtrlMatchForm 相同的事件

public class RemoteCtrlHub : MonoSingleton<RemoteCtrlHub>, IModule
{
    private HttpListener _listener;
    private int _port = 8730; // 新增的控制端口，配置在 ServerConfig.txt
    
    // 启动 HTTP 监听
    public void StartMod() { ... }
    
    // 路由表：
    // POST /ctrl/select-game    → UpdateGameType + SetHasHandedness
    // POST /ctrl/start          → Fire CtrlStartGameEventArgs
    // POST /ctrl/replay         → Fire CtrlReplayGameEventArgs  
    // POST /ctrl/contest/configure → ContestSyncManager.StartConfigureContest()
    // POST /ctrl/contest/cancel   → ContestSyncManager.OnCtrlCancelContest()
    // POST /ctrl/player/swap-side → 交换选手阵营
    // POST /ctrl/player/kick      → 踢除指定选手
    // GET  /ctrl/status         → 返回完整状态 JSON
    // GET  /ctrl/players        → 返回在线玩家列表
}
```

### 3.2 GET /ctrl/status 返回格式

```json
{
  "gameProgress": "Match",        // None/Match/GamingReady/GamingPlaying/GamingEnd
  "gameType": "IceBall",          // IceBall/Boxing/Fencing
  "hasHandedness": true,          // 大师模式
  "players": [
    { "name": "红方选手", "camp": "red", "connected": true },
    { "name": "蓝方选手", "camp": "blue", "connected": true }
  ],
  "scores": {
    "red": 3,
    "blue": 2
  },
  "timeRemaining": 45.2,          // 剩余秒数（仅比赛中有）
  "contestState": {
    "isConfigured": true,
    "matchName": "第3局"
  }
}
```

### 3.3 为什么 CtrlMatchForm 不受影响

**因为两条路径最终 Fire 的是同一个 Event：**

| 操作 | CtrlMatchForm (本地) | RemoteCtrlHub (远程) |
|------|---------------------|---------------------|
| 开始游戏 | `OnStartGame()` → `Fire CtrlStartGameEventArgs` | 收到 HTTP → `Fire CtrlStartGameEventArgs` |
| 再来一局 | `OnReplayGame()` → `Fire CtrlReplayGameEventArgs` | 收到 HTTP → `Fire CtrlReplayGameEventArgs` |
| 选游戏 | Toggle 切换 → `UpdateGameType()` | 收到 HTTP → `UpdateGameType()` |
| 配置竞猜 | `OnContestStartConfigure()` → `StartConfigureContest()` | 收到 HTTP → `StartConfigureContest()` |
| 换边 | — | 收到 HTTP → `MatchManager.SwapPlayerCamp()` |
| 踢除选手 | — | 收到 HTTP → `MatchManager.KickPlayer()` |

`GameProgressManager`、`MatchManager`、`ContestSyncManager` 只关心 EventArgs，不关心来源。两条路径完全等价，不需要改任何已有代码。

### 3.4 ServerConfig.txt 新增配置

```json
{
  "Port": 7350,
  "StoreId": 1,
  "MutexName": "LumiSportServer",
  "ContestApiUrl": "http://192.168.1.100:3001",
  "ContestPageUrl": "http://192.168.1.100:5173/mobile",
  "ContestAdminToken": "xxx",
  
  "CtrlApiPort": 8730,
  "CtrlApiToken": "your-secret-token-here"
}
```

### 3.5 安全考虑

- **Token 验证**：每个请求必须携带 `Authorization: Bearer <token>` 或 body 中的 `ctrlToken`
- **内网限制**：HTTP Server 只监听内网 IP
- **状态前置校验**：RemoteCtrlHub 在 Fire 事件前先检查当前 GameProgress 状态是否允许该操作（和 CtrlMatchForm 的 UI 按钮禁用逻辑一致）

---

## 四、选手报名与管理规则

### 4.1 报名流程

选手通过**小程序**报名参赛，发生在**「选手入场」阶段**。流程如下：

```
选手在小程序点击「我要参赛」（选手入场阶段）
    │
    ▼
NestJS 后端创建报名记录（status: pending）
    │
    ▼
管理员在小程序 admin 页面看到待审核报名列表（选手入场阶段）
    │
    ├── 审核通过 → 后端更新 status: approved → 通知选手
    │                → 选手名同步到 Server（通过 RemoteCtrlHub）
    │                → 选手佩戴 VR 设备
    │
    └── 审核拒绝 → 后端更新 status: rejected → 通知选手
```

**关键规则：**
- 只有管理员审核通过后，选手才算正式报名成功
- 审核通过的选手，其昵称/名称会同步到 Server 端的 `PlayerData.SetName()`
- 报名状态通过后端 DB 管理，与 Server 的 GameProgress 解耦
- 报名发生在**选手入场阶段**，通过审核后选手再佩戴 VR 设备

### 4.2 赛前选手管理（比赛未开始期间可用）

在**比赛未正式开始前**（GameProgress ∈ {Match, GamingReady}），管理员可以：

| 操作 | 说明 | 实现方式 |
|------|------|----------|
| **换边** | 交换红蓝方选手的阵营 | `POST /ctrl/player/swap-side` → Server 交换两个玩家的 camp |
| **剔除选手** | 将某个选手移出当前比赛 | `POST /ctrl/player/kick` → Server 断开/移除指定玩家 |

**约束条件：**
- 换边和剔除操作**仅在比赛未开始时**（GamingReady 及之前）可用
- 比赛进行中（GamingPlaying）**不可**换边或剔除（只能紧急中止整个比赛）
- 换边后阵营信息实时同步回后端 DB

### 4.3 剔除选手的回退规则

**在「报名竞猜」阶段剔除选手时，赛事流程回退到「选手入场」阶段。**

```
报名竞猜阶段
    │
    │  管理员点击「剔除选手」
    ▼
Server 端执行踢除（MatchManager.KickPlayer）
    │
    ├── 该选手被移出比赛
    │
    └── 赛事状态回退 → 回到「选手入场」阶段
        │
        ├── 竞猜暂停/取消（已有竞猜投注需要回滚）
        ├── 选手需要重新报名或由管理员重新邀请
        └── 管理员重新审核报名后，可再次推进流程
```

**原因：** 剔除选手意味着当前对阵阵容发生根本变化，已有的竞猜数据（赔率、下注）都基于原阵容，必须回退让阵容重新确定后才能继续。

**回退时的处理：**
- 已有的竞猜投注**全部取消并退款**
- 后端 DB 状态回退到 `WAITING`
- 其余未剔除的选手保持在线，但需要重新确认阵容
- 管理员可以在「选手入场」阶段重新审核报名、调整阵营

### 4.4 数据同步时序

```
管理员操作「换边」
    │
    ▼
小程序 POST /api/player/admin/swap-side
    │
    ▼
NestJS → POST Server /ctrl/player/swap-side
    │
    ├── Server 端 MatchManager 交换阵营
    │
    └── Server 回调后端 /api/admin/sync-players（同步最新阵营到 DB）
    │
    ▼
小程序轮询刷新，看到更新后的阵营
```

---

## 五、NestJS 后端改造

### 5.1 新增 Server 代理服务

```typescript
// server-proxy.service.ts
// 负责将小程序的管理指令转发到 Server 端 RemoteCtrlHub

@Injectable()
export class ServerProxyService {
  private readonly serverCtrlUrl: string; // 从配置读取
  
  // 转发控制指令
  async selectGame(dto: { gameType: string; isMasterMode: boolean }) {
    return this.post('/ctrl/select-game', dto);
  }
  
  async startMatch() {
    return this.post('/ctrl/start', {});
  }
  
  async endMatch() {
    // 注意：结束比赛现在由 Server 自动完成（计时结束）
    // 但保留手动结束能力（紧急情况）
    return this.post('/ctrl/end-match', {});
  }
  
  async replayGame() {
    return this.post('/ctrl/replay', {});
  }
  
  // 选手管理
  async swapSide(dto: { playerId?: string }) {
    return this.post('/ctrl/player/swap-side', dto);
  }
  
  async kickPlayer(dto: { playerId: string }) {
    return this.post('/ctrl/player/kick', dto);
  }
  
  // 查询 Server 状态
  async getStatus(): Promise<ServerStatusPayload> {
    return this.get('/ctrl/status');
  }
  
  async getPlayers(): Promise<ServerPlayerPayload[]> {
    return this.get('/ctrl/players');
  }
}
```

### 5.2 改造现有 Admin 接口

**关键变更**：小程序的 `start-match` 不再只改 DB 状态，而是：

1. 先调用 ServerProxy → `POST /ctrl/start`（真正启动游戏）
2. Server 端 `GameProgressManager` 状态流转 → `ContestSyncManager` 自动回调后端 `/api/admin/lock`
3. 后端收到 lock 后更新 DB 状态为 `started`

```
小程序 start-match
  → NestJS 转发到 Server /ctrl/start
  → Server Fire CtrlStartGameEventArgs
  → GameProgressManager 状态变为 GamingReady
  → ContestSyncManager POST /api/admin/lock
  → NestJS 更新 DB 状态
  → 小程序轮询拿到最新状态
```

### 5.3 新增报名审核接口

```typescript
// 报名管理
POST /api/player/admin/registrations          → 获取待审核报名列表
POST /api/player/admin/registration/approve   → 审核通过
POST /api/player/admin/registration/reject    → 审核拒绝
```

### 5.4 新增状态同步机制

**方案 A（推荐）：双写 + 轮询**
- Server 端状态变更时，`RemoteCtrlHub` 主动 POST 到后端 `/api/admin/sync-status`
- 后端维护一个 `serverStatus` 缓存字段
- 小程序轮询 `/api/player/admin/session` 时同时返回 server 状态

**方案 B：纯轮询**
- 小程序后端定期轮询 Server 的 `/ctrl/status`
- 缓存结果，小程序请求时直接返回

---

## 六、小程序端改造

### 6.1 功能模块设计

#### 模块 1：赛事控制台（核心）

| 功能 | 操作 | 条件 |
|------|------|------|
| **选择游戏** | 下拉选择冰球/拳击/击剑 | 仅 Match 阶段 |
| **大师模式** | 开关切换 | 仅冰球 + Match 阶段 |
| **配置竞猜** | 按钮 → 触发 Server 配置竞猜 + 生成 QR | 仅 Match 阶段 + 未配置 |
| **开始比赛** | 按钮 → 真正启动 Server 游戏流程 | 仅 Match 阶段 |
| **再来一局** | 按钮 → 重置 Server + 后端下一轮 | 仅 GamingEnd 阶段 |
| **取消竞猜** | 按钮 → 取消竞猜并退款 | 仅已配置竞猜时 |

#### 模块 2：实时状态面板

| 信息 | 来源 | 刷新方式 |
|------|------|----------|
| 当前阶段 | Server GameProgress | 轮询 2-3s |
| 比分（红/蓝） | Server SportScene | 轮询 2-3s |
| 剩余时间 | Server TimeSportScene | 轮询 2-3s |
| 在线玩家 | Server MatchManager | 轮询 |
| 竞猜状态 | 后端 DB | 轮询 |

#### 模块 3：选手管理

| 功能 | 说明 | 可用阶段 |
|------|------|----------|
| 在线玩家列表 | 显示已连接 VR 玩家，阵营、名称 | 全阶段 |
| 报名审核 | 查看待审核报名，通过/拒绝 | 选手入场阶段 |
| 换边 | 交换红蓝方选手阵营 | 仅比赛未开始 |
| 剔除选手 | 将某个选手移出当前比赛 | 仅比赛未开始 |
| 选手名称同步 | 小程序报名确认的选手名实时同步到 Server | 通过时 |

#### 模块 4：竞猜大盘（已有，增强）

| 功能 | 变化 |
|------|------|
| 竞猜池 | 已有，不变 |
| 比赛结束自动结算 | Server 自动推送比分 → 后端自动 settle，不再需要手动填 |

#### 模块 5：弹幕管理（已有，增强）

| 功能 | 变化 |
|------|------|
| 弹幕流 | 已有，不变 |
| 屏蔽/广播 | 新增 |

### 6.2 页面交互设计

```
admin.vue 改造后的 Tab 结构：

┌─────────────────────────────────────────────┐
│  [赛场控制]  [选手管理]  [竞猜大盘]  [弹幕]  │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─ 赛场状态卡片 ─────────────────────────┐ │
│  │  当前阶段：匹配中                        │ │
│  │  游戏类型：冰球  [切换▼]                 │ │
│  │  大师模式：[开/关]                       │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  ┌─ 比分面板（比赛中显示）────────────────┐  │
│  │  红方 3 : 2 蓝方      剩余 45s         │  │
│  └─────────────────────────────────────────┘ │
│                                             │
│  ┌─ 在线玩家 ────────────────────────────┐  │
│  │  🔴 红方选手 (在线)  [换边] [剔除]     │  │
│  │  🔵 蓝方选手 (在线)  [换边] [剔除]     │  │
│  └─────────────────────────────────────────┘ │
│                                             │
│  ┌─ 待审核报名（选手入场阶段显示）─────┐    │
│  │  👤 张三  [通过] [拒绝]                │  │
│  │  👤 李四  [通过] [拒绝]                │  │
│  └─────────────────────────────────────────┘ │
│                                             │
│  ┌─ 竞猜状态 ────────────────────────────┐  │
│  │  赛事名：第3局                          │  │
│  │  状态：已配置 | 报名中 | 已锁定         │  │
│  │  [配置竞猜] [取消竞猜]                  │  │
│  └─────────────────────────────────────────┘ │
│                                             │
│  ┌─ 操作区 ──────────────────────────────┐  │
│  │  [▶ 开始比赛]  [🔄 再来一局]            │  │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 6.3 按钮状态矩阵

| 按钮 | None | Match | GamingReady | GamingPlaying | GamingEnd |
|------|------|-------|-------------|---------------|-----------|
| 选择游戏 | ✅ | ✅ | ❌ | ❌ | ❌ |
| 大师模式 | ✅ | ✅ | ❌ | ❌ | ❌ |
| 配置竞猜 | ❌ | ✅ | ❌ | ❌ | ❌ |
| 开始比赛 | ❌ | ✅ | ❌ | ❌ | ❌ |
| 再来一局 | ❌ | ❌ | ❌ | ❌ | ✅ |
| 取消竞猜 | ❌ | ✅* | ❌ | ❌ | ❌ |
| 换边 | ❌ | ✅ | ✅ | ❌ | ❌ |
| 剔除选手 | ❌ | ✅ | ✅ | ❌ | ❌ |
| 审核报名 | ❌ | ✅ | ✅ | ❌ | ❌ |

*仅竞猜已配置时可用

**⚠️ 剔除选手回退规则**：在报名竞猜阶段（对应 GamingReady）剔除选手时，赛事流程**回退**到选手入场阶段（对应 Match），已有竞猜投注全部取消并退款。

---

## 七、两套状态映射关系

### 7.1 Server EGameProgress ↔ 后端 SessionStatus 映射

```
Server EGameProgress          后端 SessionStatus     说明
────────────────────────────────────────────────────────────────
None                      →   (无 session)           初始/重置后
Match                     →   WAITING / BETTING      匹配等待中
GamingReady               →   STARTED                开始游戏
GamingPlaying             →   STARTED                比赛进行中
GamingEnd                 →   SETTLED                比赛结束（自动结算）
```

### 7.2 同步时机

| 事件 | Server 动作 | 自动同步到后端 |
|------|-------------|---------------|
| CtrlMatchForm/RemoteCtrlHub 开始游戏 | GameProgress → GamingReady | ContestSyncManager POST /lock |
| SportGameStart | GameProgress → GamingPlaying | 可选：推送"比赛正式开始" |
| SportGameEnd | GameProgress → GamingEnd | ContestSyncManager POST /settle（自动带比分） |
| CtrlReplay | GameProgress → None | ContestSyncManager POST /reset |
| 配置竞猜 | ContestSyncManager configure | POST /configure |
| 换边/剔除 | MatchManager 玩家操作 | POST /api/admin/sync-players |
| 报名竞猜阶段剔除选手 | 剔除 + GameProgress → Match | POST /api/admin/rollback-to-waiting（竞猜取消+退款） |

**关键改进**：比赛结束后 Server 自动推送比分结算，小程序不再需要手动输入比分！

---

## 八、需要新增的功能清单

### 8.1 Server 端（C# Unity）

| 编号 | 功能 | 改动量 | 说明 |
|------|------|--------|------|
| S1 | **RemoteCtrlHub HTTP Server** | 中等 | 新增一个 HttpListener 模块，~200 行 |
| S2 | **指令路由 + Event Fire** | 小 | 在 RemoteCtrlHub 中 Fire 已有的 EventArgs |
| S3 | **GET /ctrl/status 状态查询** | 小 | 聚合 GameProgressManager + MatchManager + SportScene 数据 |
| S4 | **GET /ctrl/players 玩家列表** | 小 | 读取 MatchManager.GetPlayers() |
| S5 | **POST /ctrl/player/swap-side 换边** | 小 | 交换两个玩家阵营，回调后端同步 |
| S6 | **POST /ctrl/player/kick 剔除选手** | 小 | 移除指定玩家，若在报名竞猜阶段则触发回退 |
| S7 | **状态变更主动推送（可选）** | 小 | RemoteCtrlHub 在状态变更时 POST 到后端 |
| S8 | **ServerConfig 新增 CtrlApiPort/CtrlApiToken** | 极小 | 加两个字段 |

### 8.2 NestJS 后端（TypeScript）

| 编号 | 功能 | 改动量 | 说明 |
|------|------|--------|------|
| B1 | **ServerProxyService** | 中等 | HTTP Client 转发控制指令到 Server |
| B2 | **Admin 接口改造** | 小 | start-match/end-match/replay 改为先调 Server 再更新 DB |
| B3 | **Server 状态缓存** | 小 | 定期轮询或接收 Server 推送的状态 |
| B4 | **新增 /api/player/admin/server-status 接口** | 小 | 返回 Server 实时状态 |
| B5 | **新增 /api/player/admin/players 接口** | 小 | 返回在线玩家列表 |
| B6 | **报名审核接口** | 小 | registrations / approve / reject |
| B7 | **选手管理接口（换边/剔除）** | 小 | 转发到 Server + 同步 DB |
| B8 | **配置新增 Server Ctrl URL** | 极小 | .env 新增 SERVER_CTRL_URL |
| B9 | **剔除回退处理** | 小 | 收到 Server 回退通知后取消竞猜并退款 |

### 8.3 小程序前端（UniApp Vue3）

| 编号 | 功能 | 改动量 | 说明 |
|------|------|--------|------|
| F1 | **admin.vue 赛场控制 Tab** | 中等 | 新增游戏选择/大师模式/开始/重置按钮 |
| F2 | **实时比分+计时展示** | 小 | 新增比分卡片组件 |
| F3 | **在线玩家列表** | 小 | 新增玩家卡片组件（含换边/剔除按钮） |
| F4 | **报名审核列表** | 小 | 新增待审核报名卡片 |
| F5 | **状态轮询 composable** | 小 | 新增 useServerStatus 轮询 Server 状态 |
| F6 | **取消手动填比分** | 极小 | AdminProcessCard 移除比分输入框 |

---

## 九、实施优先级

```
P0 — 最小可行（让小程序能操控游戏流程）
│
├── S1 + S2  RemoteCtrlHub + 指令路由 (start / replay / select-game)
├── S3       GET /ctrl/status 
├── S8       ServerConfig 新增配置
├── B1       ServerProxyService
├── B2       Admin 接口改造（start-match → 先调 Server）
├── B8       后端配置
├── F1       admin.vue 赛场控制 Tab
├── F5       状态轮询
└── F6       移除手动填比分
    ↑ 这些做完后，小程序就能：选游戏 → 开始 → 等Server自动结算 → 再来一局

P1 — 选手管理 & 报名审核
│
├── S4       在线玩家查询
├── S5       换边接口
├── S6       剔除选手接口（含回退逻辑）
├── B6       报名审核接口
├── B7       选手管理接口
├── B9       剔除回退处理（取消竞猜+退款）
├── F3       玩家列表 + 换边/剔除
└── F4       报名审核列表
    ↑ 这些做完后，管理员能审核报名、换边、剔除选手（含回退）

P2 — 体验增强
│
├── S7       状态主动推送
├── B3       Server 状态缓存
├── B4 + B5  新增 API
├── F2       实时比分展示
├── 弹幕管理增强（屏蔽/广播）
├── 赛程模板
├── 自动轮转
└── 历史数据统计
```

---

## 十、遗留问题 & 待确认

1. **HTTP 端口冲突**：Server 端新开 HTTP Server 的端口（8730）需确保不与 VR 客户端的 WS 端口（7350/7360）冲突
2. **并发控制**：如果小程序和 CtrlMatchForm 同时操作同一指令怎么办？→ 建议在 GameProgressManager 加简单的状态校验即可（已有），先到的生效
3. **网络异常**：Server 的 RemoteCtrlHub 如果暂时不可达，小程序应如何提示？→ 显示 Server 连接状态指示灯
4. **击剑（Fencing）支持**：目前 ContestSyncManager 的 SettleContest 只处理了 IceBall 和 Boxing，Fencing 的结算需要补充
5. **多门店场景**：如果一套小程序后端对应多个 Server 实例，需要 ServerProxy 支持多实例路由（当前暂不考虑）
6. **换边后竞猜池影响**：换边后已有的竞猜下注是否需要调整（红方下注变成蓝方）？→ 待确认业务规则
7. **剔除回退时机**：是否只有在竞猜阶段才回退？选手入场阶段剔除是否直接踢出而不回退？→ 当前设计：选手入场阶段剔除直接踢出不回退，报名竞猜阶段剔除则回退到选手入场
