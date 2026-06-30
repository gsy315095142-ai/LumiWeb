# 用户认证 PRD

> **版本**: v1.1  
> **最后更新**: 2026-05-11  
> **文档性质**: 需求设计文档  
> **相对 v1.0 变更**: 移除管理员免密登录，统一微信登录 + 白名单鉴权

---

## 1. 模块概述

用户认证模块负责所有用户的身份验证与鉴权，是系统的入口关卡。系统**仅支持微信小程序登录**这一种登录方式，所有用户（普通用户和管理员）都通过微信一键登录进入系统。

管理员身份的判定不在登录环节，而是在登录后通过**白名单机制**确认：系统根据用户的微信 OpenID 查询白名单表，如果匹配则识别为管理员，同时获取其关联的门店列表。

| 登录方式 | 服务角色 | 说明 |
|----------|---------|------|
| 微信小程序登录 | 所有用户 | 基于 `wx.login` + `jscode2session`，一键无感登录；登录后通过白名单区分普通用户与管理员 |

**身份判定流程：**

```
微信登录 → 获取 OpenID → 查询白名单表
  → 命中 → 角色 = admin，附带关联门店列表
  → 未命中 → 角色 = user（选手 / 观众）
```

所有登录统一返回 **JWT 令牌**，后续请求通过 `Authorization: Bearer <token>` 鉴权。

---

## 2. 角色体系

### 2.1 角色定义

| 角色 | 枚举值 | 说明 |
|------|--------|------|
| 普通用户 | `user` | 选手 + 观众（同一角色，通过行为区分） |
| 管理员 | `admin` | 门店管理员，可管理一家或多家门店 |

### 2.2 角色判定规则

- **登录时不预设角色**：所有用户通过微信登录后，默认角色为 `user`
- **白名单升级**：登录时后端查询 `store_admins` 白名单表，如果该用户的 `mp_openid` 存在于表中，则将角色设为 `admin`，并在 JWT 中附带其管理的门店 ID 列表
- **动态生效**：白名单的增删操作即时生效，用户下次登录或刷新 Token 时更新权限

### 2.3 角色约束

- **角色由系统判定**：用户不能自行选择或切换角色
- **身份互斥**：管理员不能报名参赛或参与竞猜（业务层校验）
- **管理员可管理多家门店**：一个管理员可以关联多家门店，在白名单表中体现为多条记录

### 2.4 同一数据表

两种角色存储在同一个 `users` 表中，通过 `role` 字段区分。管理员与门店的关联关系存储在独立的 `store_admins` 白名单表中。

---

## 3. 登录方式详述

### 3.1 微信小程序登录（唯一登录方式）

#### 适用角色

所有用户（普通用户 + 管理员）

#### 端到端流程

```
小程序端                        后端                          微信服务器
   │                            │                             │
   │ 1. uni.login({provider:'weixin'})                        │
   │ ──────── code ──────────────────────────────────────────  │
   │                            │                             │
   │ 2. POST /api/auth/login-wechat { code }                  │
   │ ───────────────────────────────────────────────────────► │
   │                            │                             │
   │                            │ 3. jscode2session           │
   │                            │ ──────────────────────────► │
   │                            │ ◄──── { openid, session_key }│
   │                            │                             │
   │                            │ 4. 查找/创建用户             │
   │                            │    (mp_openid 唯一匹配)      │
   │                            │                             │
   │                            │ 5. 查询白名单表              │
   │                            │    (store_admins 表)         │
   │                            │    命中 → role=admin         │
   │                            │         + storeIds=[...]     │
   │                            │    未命中 → role=user        │
   │                            │                             │
   │                            │ 6. 签发 JWT                 │
   │ ◄──── { accessToken, user, managedStores }─────────────  │
   │                            │                             │
   │ 7. 存储 token + userInfo + managedStores 到本地          │
   │ 8. reLaunch → 首页         │                             │
```

#### 核心逻辑

| 步骤 | 实现细节 |
|------|---------|
| 获取 code | `uni.login({ provider: 'weixin' })` 返回临时 `code` |
| 换取 openid | 服务端调用 `https://api.weixin.qq.com/sns/jscode2session`，传入 `appid + secret + code` |
| 用户查找 | 按 `mp_openid` 在 `users` 表查找 |
| 自动注册 | 如果 openid 不存在，自动创建新用户（昵称默认「微信用户」，角色为 `user`，竞猜币为 0） |
| **白名单查询** | 按 `mp_openid` 在 `store_admins` 表查找所有关联记录 |
| **角色判定** | 白名单命中 → 更新 `users.role = admin`，收集关联的 `store_id` 列表；未命中 → `role = user` |
| 幂等安全 | `mp_openid` 字段有 UNIQUE 约束，同一微信用户不会重复创建 |

#### 白名单判定逻辑（伪代码）

```typescript
// 登录时执行
const adminRecords = await storeAdminsRepo.find({ where: { mp_openid } });

if (adminRecords.length > 0) {
  // 该用户是管理员
  user.role = 'admin';
  managedStoreIds = adminRecords.map(r => r.store_id);
} else {
  // 普通用户
  user.role = 'user';
  managedStoreIds = [];
}
```

#### 环境依赖

| 环境变量 | 说明 | 必填 |
|----------|------|------|
| `WECHAT_MP_APPID` | 微信小程序 AppID | 是 |
| `WECHAT_MP_SECRET` | 微信小程序 AppSecret | 是 |
| `JWT_SECRET` | JWT 签名密钥 | 是 |
| `JWT_EXPIRES_IN` | JWT 过期时间，默认 `7d` | 否 |

#### 异常处理

| 场景 | 处理方式 |
|------|---------|
| 微信 code 无效/过期 | 返回 401 + 微信原始错误信息 |
| AppID/AppSecret 未配置 | 返回 500「服务端未配置微信小程序 AppID/AppSecret」 |
| openid 获取失败 | 返回 401「微信登录失败」 |
| 账户被锁定 | 返回 403 + 剩余锁定时间 |

---

## 4. 白名单管理机制

### 4.1 设计思路

管理员不是通过单独的登录入口进入系统，而是通过**后台配置白名单**的方式产生。运营人员在后台系统中将某个微信用户的 OpenID 与一家或多家门店进行绑定，绑定后该用户即成为对应门店的管理员。

### 4.2 白名单数据结构

白名单通过 `store_admins` 关联表实现（详见第 8 节数据模型）。每条记录代表「某用户（OpenID）是某门店的管理员」这一关系。

**典型场景：**

| mp_openid | store_id | nickname | store_name |
|-----------|----------|----------|------------|
| oX1234... | 1 | 张三 | 杭州西湖店 |
| oX1234... | 3 | 张三 | 上海浦东店 |
| oX5678... | 1 | 李四 | 杭州西湖店 |

> 张三同时管理杭州西湖店和上海浦东店；李四只管理杭州西湖店。

### 4.3 白名单管理方式

白名单的管理（增删改查）通过以下方式实现：

| 操作 | 方式 | 说明 |
|------|------|------|
| 添加管理员 | 后台接口 / 数据库操作 | 将用户的 OpenID 与门店 ID 绑定 |
| 移除管理员 | 后台接口 / 数据库操作 | 删除对应的 `store_admins` 记录 |
| 变更门店 | 后台接口 / 数据库操作 | 增删该用户关联的门店记录 |
| 查询管理员 | 后台接口 | 按门店或按用户查询关联关系 |

> **注意**：获取用户的 OpenID 需要用户先在小程序端登录一次，登录后运营人员可在后台通过用户昵称或手机号查到其 OpenID，再进行白名单配置。

### 4.4 白名单管理接口（后台）

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | `/api/admin/store-admins` | 查询白名单列表 | 超级管理员 |
| POST | `/api/admin/store-admins` | 添加管理员-门店绑定 | 超级管理员 |
| DELETE | `/api/admin/store-admins/:id` | 移除绑定 | 超级管理员 |
| GET | `/api/admin/store-admins/by-store/:storeId` | 查询某门店的管理员列表 | 超级管理员 |
| GET | `/api/admin/store-admins/by-user/:userId` | 查询某用户管理的门店列表 | 超级管理员 |

#### POST /api/admin/store-admins 参数

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_id | number | 是 | 用户 ID（users 表主键） |
| store_id | number | 是 | 门店 ID（stores 表主键） |

---

## 5. JWT 鉴权机制

### 5.1 JWT Payload 结构

```json
{
  "sub": 1,                              // 用户 ID
  "role": "user" | "admin",             // 角色（由白名单判定）
  "storeIds": [1, 3],                    // 管理的门店 ID 列表（仅 admin 时有值）
  "mp_openid": "oX1234...",              // 微信 OpenID
  "iat": 1710000000,                     // 签发时间
  "exp": 1710086400                      // 过期时间
}
```

### 5.2 令牌有效期

| 场景 | 有效期 | 说明 |
|------|--------|------|
| 微信登录（所有用户） | 由 `JWT_EXPIRES_IN` 环境变量决定，默认 **7 天** | 环境配置 |

### 5.3 鉴权流程

```
客户端请求                        服务端
   │                                │
   │ Authorization: Bearer <token>  │
   │ ──────────────────────────────►│
   │                                │ 1. jwt.strategy 解析 token
   │                                │ 2. 提取 { sub, role, storeIds, mp_openid }
   │                                │ 3. 构造 JwtPayload 注入请求
   │                                │ 4. @CurrentUser() 装饰器注入
   │                                │
   │ ◄─── 正常业务响应 ──────────────│
```

### 5.4 管理员鉴权守卫

| 组件 | 说明 |
|------|------|
| `AdminGuard` | 校验 `role === 'admin'`，非管理员返回 403 |
| `StoreAdminGuard` | 校验当前用户是否管理指定门店（`storeIds` 包含目标 store_id），无权限返回 403 |

### 5.5 守卫与装饰器

| 组件 | 说明 |
|------|------|
| `JwtAuthGuard` | 继承 Passport `AuthGuard('jwt')`，token 无效时抛出 401「登录已过期，请重新登录」 |
| `JwtStrategy` | 从 `Authorization: Bearer` 提取 token，验证签名和过期时间，解析为 `JwtPayload` |
| `@CurrentUser()` | 参数装饰器，从 `request.user` 提取当前用户信息 |
| `JwtPayload` | 类型定义 `{ sub: number; role: 'user' | 'admin'; storeIds: number[]; mp_openid: string }` |

---

## 6. 账户安全机制

### 6.1 频率限制

| 机制 | 说明 |
|------|------|
| NestJS ThrottlerGuard | 全局频率限制，同一 IP 过于频繁时返回 429 |
| 前端防重 | `loading` 状态锁，请求期间按钮禁用，防止重复提交 |

### 6.2 安全设计要点

| 要点 | 说明 |
|------|------|
| Token 不含敏感信息 | JWT payload 仅含 `sub`、`role`、`storeIds`、`mp_openid`，不含密码/手机号 |
| 过期自动失效 | `jwt.strategy` 设置 `ignoreExpiration: false`，过期 token 直接拒绝 |
| 微信 session_key 不存储 | 服务端仅提取 `openid`，不持久化 `session_key` |
| 白名单即时生效 | 白名单变更后，用户下次登录或手动刷新 Token 时更新权限 |

---

## 7. 用户资料管理

### 7.1 获取资料

- **接口**: `GET /api/auth/profile`
- **鉴权**: 需要 JWT
- **返回**: `{ id, nickname, role, mp_openid, managedStores }`

#### 返回示例

**普通用户：**
```json
{
  "id": 1,
  "nickname": "微信用户",
  "role": "user",
  "mp_openid": "oX1234...",
  "managedStores": []
}
```

**管理员（管理多家门店）：**
```json
{
  "id": 2,
  "nickname": "张三",
  "role": "admin",
  "mp_openid": "oX5678...",
  "managedStores": [
    { "id": 1, "name": "杭州西湖店" },
    { "id": 3, "name": "上海浦东店" }
  ]
}
```

### 7.2 更新资料

- **接口**: `PUT /api/auth/profile`
- **鉴权**: 需要 JWT
- **可编辑字段**:

| 字段 | 校验规则 | 说明 |
|------|---------|------|
| nickname | 可选，字符串，最长 100 字，trim 后不能为空串 | 用户昵称 |

> **注意**：角色、门店关联等字段不支持通过此接口修改，需通过白名单管理接口操作。

---

## 8. 前端实现

### 8.1 登录页面结构

```
pages/login/
├── index.vue                        # 页面入口
├── components/
│   ├── LoginBrandHeader.vue         # 品牌 Logo + 标题
│   ├── LoginGameIcons.vue           # 三种游戏模式图标展示
│   └── LoginPrimaryActions.vue      # 登录按钮（仅微信登录）
├── composables/
│   └── useLoginPage.ts              # 登录逻辑（状态管理 + 事件处理）
└── game-modes.ts                    # 游戏模式配置数据
```

### 8.2 页面交互设计

#### 唯一状态：微信登录

```
┌──────────────────────────────────────┐
│          赛博朋克深色背景             │
│       radial-gradient 霓虹光晕       │
│                                      │
│  ┌──────────────────────────────┐    │
│  │       [ 品牌 Logo ]          │    │
│  │     [ 游戏模式图标 ]         │    │
│  │                              │    │
│  │  ┌──────────────────────┐    │    │
│  │  │    微信登录  🎮       │    │    │
│  │  └──────────────────────┘    │    │
│  │                              │    │
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

> 相比 v1.0 移除了「管理员登录」按钮和面板，所有用户统一走微信登录。

### 8.3 交互细节

| 交互 | 说明 |
|------|------|
| 页面加载 | 检查 `userStore.isLoggedIn`，已登录则自动跳转首页 |
| 微信登录按钮 | 点击后调用 `uni.login()` → `loginWechatApi()` → 存储令牌 → 跳转首页 |
| 加载状态 | 请求中按钮显示「登录中…」并禁用，防止重复提交 |
| 错误展示 | 统一展示在页面底部红色区域，不使用弹窗 |
| 登录成功 | 直接 `reLaunch` 到首页，无额外 Toast |
| 管理员识别 | 登录成功后，前端根据返回的 `role` 字段判断是否为管理员，根据 `managedStores` 展示门店选择 |

#### 管理员多门店选择（登录后）

当管理员关联多家门店时，在需要操作门店相关功能时（如创建赛事），前端展示门店选择器：

```
┌──────────────────────────────────┐
│        请选择操作门店             │
│                                  │
│  ┌──────────────────────────┐    │
│  │  ● 杭州西湖店             │    │
│  │  ○ 上海浦东店             │    │
│  └──────────────────────────┘    │
│                                  │
│          [ 确认 ]                │
└──────────────────────────────────┘
```

### 8.4 用户状态管理（Pinia Store）

文件：`uniapp/src/store/modules/user.ts`

| 功能 | 说明 |
|------|------|
| `loginWithWechat()` | 调用 `uni.login()` 获取 code → API 登录 → 存储令牌 + 角色信息 |
| `fetchProfile()` | 从服务端获取最新用户信息（含门店列表），失败则触发登出 |
| `updateProfile(data)` | 更新昵称等，同步更新本地缓存 |
| `logout()` | 清除 token + userInfo + managedStores + localStorage → 跳转登录页 |
| `checkAutoLogin()` | 应用启动时调用，有 token 则验证有效性，无效则登出 |
| `isAdmin` | 计算属性：`role === 'admin'` |
| `currentStoreId` | 当前选中的门店 ID（多门店时需选择） |

### 8.5 本地存储

| 键 | 内容 | 说明 |
|----|------|------|
| `token` | JWT accessToken | 用于请求鉴权 |
| `userInfo` | `{ id, nickname, role, mp_openid }` | 用户基本信息 |
| `managedStores` | `[{ id, name }]` | 管理的门店列表（仅管理员有值） |
| `currentStoreId` | `number` | 当前选中的门店 ID |

---

## 9. 数据模型

### 9.1 users 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | INT | PK, AUTO_INCREMENT | 用户 ID |
| `mp_openid` | VARCHAR(64) | UNIQUE, NOT NULL | 微信小程序 OpenID（唯一登录标识） |
| `role` | ENUM('user','admin') | DEFAULT 'user' | 角色（由白名单动态判定） |
| `nickname` | VARCHAR(100) | NULLABLE | 昵称 |
| `phone` | VARCHAR(20) | NULLABLE | 手机号（用户可选绑定） |
| `avatar_url` | VARCHAR(500) | NULLABLE | 头像 URL |
| `coins` | INT | DEFAULT 0 | 竞猜币余额 |
| `total_betting_winnings` | DOUBLE | DEFAULT 0 | 累计竞猜派奖 |
| `last_check_in_ymd` | VARCHAR(10) | NULLABLE | 上次签到日期（YYYY-MM-DD） |
| `status` | ENUM('active','locked') | DEFAULT 'active' | 账户状态 |
| `created_at` | DATETIME | 自动 | 创建时间 |
| `updated_at` | DATETIME | 自动 | 更新时间 |
| `deleted_at` | DATETIME | NULLABLE | 软删除时间 |

> **相比 v1.0 移除的字段**：`email`、`password_hash`、`login_attempts`、`locked_until`（邮箱登录相关字段不再需要）。

### 9.2 stores 表（门店表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | INT | PK, AUTO_INCREMENT | 门店 ID |
| `name` | VARCHAR(100) | NOT NULL | 门店名称 |
| `address` | VARCHAR(255) | NULLABLE | 门店地址 |
| `contact_phone` | VARCHAR(20) | NULLABLE | 联系电话 |
| `status` | ENUM('active','inactive') | DEFAULT 'active' | 门店状态 |
| `created_at` | DATETIME | 自动 | 创建时间 |
| `updated_at` | DATETIME | 自动 | 更新时间 |

### 9.3 store_admins 表（白名单表）⭐ 新增

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | INT | PK, AUTO_INCREMENT | 记录 ID |
| `user_id` | INT | FK → users.id, NOT NULL | 关联用户 |
| `store_id` | INT | FK → stores.id, NOT NULL | 关联门店 |
| `created_at` | DATETIME | 自动 | 绑定时间 |
| `created_by` | INT | FK → users.id, NULLABLE | 操作人（添加此记录的管理员） |

> **核心设计**：一条记录 = 「某用户是某门店的管理员」。同一用户多条记录 = 管理多家门店。

### 9.4 索引设计

| 索引 | 字段 | 类型 | 说明 |
|------|------|------|------|
| PRIMARY | `id`（各表） | 主键 | 自增 ID |
| UNIQUE | `users.mp_openid` | 唯一索引 | 微信用户去重 |
| UNIQUE | `store_admins(user_id, store_id)` | 联合唯一索引 | 防止重复绑定 |
| INDEX | `store_admins.user_id` | 普通索引 | 按用户查门店 |
| INDEX | `store_admins.store_id` | 普通索引 | 按门店查管理员 |

### 9.5 状态枚举

#### UserRole

| 值 | 说明 |
|----|------|
| `user` | 普通用户 |
| `admin` | 管理员（由白名单表判定） |

#### UserStatus

| 值 | 说明 |
|----|------|
| `active` | 正常状态 |
| `locked` | 锁定状态 |

---

## 10. 接口清单

### 10.1 认证接口

| 方法 | 路径 | 说明 | 鉴权 | 备注 |
|------|------|------|------|------|
| POST | `/api/auth/login-wechat` | 微信小程序登录 | 否 | **唯一登录方式** |
| GET | `/api/auth/profile` | 获取当前用户信息（含门店列表） | **是** | JWT Bearer |
| PUT | `/api/auth/profile` | 更新当前用户资料 | **是** | JWT Bearer |

> **相比 v1.0 移除的接口**：`POST /api/auth/login`（邮箱登录）、`POST /api/auth/login-admin`（管理员登录）。

### 10.2 白名单管理接口（后台，需超级管理员权限）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/store-admins` | 查询白名单列表（支持按门店/用户筛选） |
| POST | `/api/admin/store-admins` | 添加管理员-门店绑定 |
| DELETE | `/api/admin/store-admins/:id` | 移除单条绑定 |
| GET | `/api/admin/store-admins/by-store/:storeId` | 查询某门店的管理员列表 |
| GET | `/api/admin/store-admins/by-user/:userId` | 查询某用户管理的门店列表 |

### 10.3 接口参数详情

#### POST /api/auth/login-wechat

| 字段 | 类型 | 必填 | 校验 |
|------|------|------|------|
| code | string | 是 | 最长 128 字符 |

#### 返回结构

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 2,
    "nickname": "张三",
    "role": "admin",
    "mp_openid": "oX5678..."
  },
  "managedStores": [
    { "id": 1, "name": "杭州西湖店" },
    { "id": 3, "name": "上海浦东店" }
  ]
}
```

#### PUT /api/auth/profile

| 字段 | 类型 | 必填 | 校验 |
|------|------|------|------|
| nickname | string | 否 | 最长 100 字 |

#### POST /api/admin/store-admins

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_id | number | 是 | 用户 ID |
| store_id | number | 是 | 门店 ID |

---

## 11. 错误码表

| HTTP 状态码 | 错误场景 | 提示文案 | 触发条件 |
|-------------|---------|---------|---------|
| 400 | 参数校验失败 | 具体字段错误 | DTO 校验不通过 |
| 401 | 微信登录失败 | 微信原始错误信息或「微信登录失败」 | code 无效/openid 获取失败 |
| 401 | Token 过期 | 「登录已过期，请重新登录」 | JWT 验证失败 |
| 401 | 用户不存在 | 「用户不存在」 | getProfile 找不到用户 |
| 403 | 非管理员 | 「无管理员权限」 | 非管理员访问管理端接口 |
| 403 | 无门店权限 | 「您不是该门店的管理员」 | 管理员访问非管辖门店 |
| 403 | 白名单绑定已存在 | 「该用户已是此门店管理员」 | 重复绑定 |
| 429 | 频率限制 | ThrottlerException | 请求过于频繁 |
| 500 | 微信配置缺失 | 「服务端未配置微信小程序 AppID/AppSecret」 | 环境变量未设置 |

---

## 12. 登录态生命周期

### 12.1 登录态建立

```
用户触发微信登录 → API 返回 { accessToken, user, managedStores }
  → token 存入 Pinia store + localStorage
  → userInfo 存入 Pinia store + localStorage
  → managedStores 存入 Pinia store + localStorage
  → reLaunch 跳转首页
```

### 12.2 登录态维持

```
每次请求 → 请求拦截器自动注入 Authorization: Bearer <token>
  → 服务端 JwtStrategy 校验
  → 有效 → 正常处理
  → 无效/过期 → 返回 401 → 前端响应拦截器自动登出
```

### 12.3 登录态销毁

| 触发方式 | 行为 |
|----------|------|
| 用户主动登出 | 清除 Pinia store + localStorage（含 managedStores），跳转登录页 |
| Token 过期 | 服务端返回 401，前端 `fetchProfile` 失败触发登出 |
| Token 被篡改 | 服务端 JWT 验签失败，返回 401 |

### 12.4 自动登录

```
应用启动 (App.vue / onLaunch)
  → userStore.checkAutoLogin()
  → 有 token ?
       → 是：fetchProfile() 验证有效性 + 刷新白名单信息
              → 成功：保留登录态
              → 失败：logout() 清除
       → 否：无操作，显示登录页
```

---

## 13. 关键业务常量

| 常量 | 值 | 说明 |
|------|----|------|
| `JWT_EXPIRES_IN` | `'7d'`（默认） | 微信登录有效期，后端 `.env` 配置 |
| `WECHAT_MP_APPID` | — | 微信小程序 AppID，后端 `.env` 配置 |
| `WECHAT_MP_SECRET` | — | 微信小程序 AppSecret，后端 `.env` 配置 |
| `JWT_SECRET` | — | JWT 签名密钥，后端 `.env` 配置 |

> **相比 v1.0 移除的常量**：`MAX_LOGIN_ATTEMPTS`、`LOCK_DURATION_MINUTES`、`DEFAULT_JWT_EXPIRES`、`REMEMBER_ME_JWT_EXPIRES`、`ADMIN_PHONE`（邮箱登录/管理员免密登录相关常量不再需要）。

---

## 14. 架构关系图

```
┌─────────────────────── 前端 (UniApp) ──────────────────────────┐
│                                                                 │
│  pages/login/index.vue                                         │
│       │                                                         │
│       ├─ useLoginPage.ts (逻辑组合式函数)                       │
│       │    └─ handleWechatLogin()                               │
│       │                                                         │
│       └─ store/modules/user.ts (Pinia)                         │
│              ├─ loginWithWechat()                               │
│              ├─ fetchProfile()                                  │
│              ├─ updateProfile()                                 │
│              ├─ logout()                                        │
│              ├─ isAdmin (计算属性)                               │
│              └─ currentStoreId (当前门店)                       │
│                                                                 │
│  api/auth.ts ─── 请求层封装                                     │
│                                                                 │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                  HTTP (Bearer Token)
                        │
┌───────────────────────▼───────── 后端 (NestJS) ──────────────────┐
│                                                                 │
│  auth.controller.ts ─── 路由入口                                │
│       │                                                         │
│       ├─ auth.service.ts ─── 核心业务逻辑                       │
│       │    ├─ loginWechat() (微信登录 + 白名单判定)             │
│       │    ├─ getProfile()  (含门店列表)                        │
│       │    └─ updateProfile()                                   │
│       │                                                         │
│       ├─ jwt.strategy.ts ─── JWT 解析/验证                      │
│       ├─ jwt-auth.guard.ts ─── 鉴权守卫                         │
│       ├─ admin.guard.ts ─── 管理员守卫                          │
│       ├─ store-admin.guard.ts ─── 门店管理员守卫                │
│       │                                                         │
│       ├─ entities/user.entity.ts ─── 用户实体                   │
│       ├─ entities/store.entity.ts ─── 门店实体                  │
│       └─ entities/store-admin.entity.ts ─── 白名单实体          │
│                                                                 │
│  common/guards/     ─── 全局守卫                                │
│  common/decorators/ ─── @CurrentUser() 装饰器                   │
│                                                                 │
└───────────────────────┬─────────────────────────────────────────┘
                        │
              ┌─────────▼──────────┐
              │       MySQL        │
              │  ┌──────────────┐  │
              │  │    users     │  │
              │  ├──────────────┤  │
              │  │    stores    │  │
              │  ├──────────────┤  │
              │  │ store_admins │  │ ← 白名单表
              │  └──────────────┘  │
              └────────────────────┘
```

---

## 15. 与其他模块的关系

| 关联模块 | 关系说明 |
|----------|---------|
| **赛事管理 (player)** | 管理员登录后只能操作其白名单关联门店的赛事（创建/开局/结算）；选手需 user 角色才能报名 |
| **竞猜系统 (betting)** | 观众需 user 角色才能下注；竞猜币/签到等字段挂在 users 表上 |
| **弹幕互动 (danmaku)** | 发送弹幕需要 JWT 鉴权，从 token 中提取用户 ID |
| **门店管理** | 门店是白名单的关联主体，管理员通过白名单关联门店实现权限控制 |

---

## 16. 已知局限与后续规划

| 项目 | 当前状态 | 建议 |
|------|---------|------|
| 白名单管理 | 需后台手动配置 OpenID | 可增加「管理员邀请码」/「扫码授权」等更友好的绑定方式 |
| 超级管理员 | 暂未区分超级管理员与普通管理员 | 可增加 `super_admin` 角色管理白名单本身 |
| Token 刷新 | 无 refresh token 机制，过期需重新登录 | 可引入双 token 方案 |
| 多设备登录 | 不限制多设备同时在线 | 可增加设备管理 |
| 门店切换 | 前端手动选择当前操作门店 | 可增加「默认门店」设置 |
| OpenID 获取 | 用户需先登录才能获取 OpenID | 可提供运营后台查看已登录用户 OpenID 列表的功能 |
