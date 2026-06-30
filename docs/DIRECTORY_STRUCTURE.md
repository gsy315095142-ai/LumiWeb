# LumiWeb 目录结构规划

> 文档版本：v1.2 · 2026-06-30 · **LumiSport 重构为 4 桶结构，business-flow/control-center 已并入单仓库（2026-06-30）**  
> 用途：统一 LumiWeb 静态站点目录、命名与部署约定；新对话可直接阅读本文继续实施迁移。

---

## 1. 核心约束

| 约束 | 说明 |
|------|------|
| 根目录只留门户 | 服务器根目录仅暴露 `index.html`（及可选的 `.gitignore` 等，业务内容不上根目录） |
| **全站仅 1 个 index.html** | 只有根目录 `index.html`；`WebProjects/` 内禁止任何 `index.html` |
| 内容全部进 WebProjects | 除根 `index.html` 外，所有页面、资源、子项目均在 `WebProjects/` 下 |
| 项目目录用产品英文名 | `LumiMagic_Season_01`、`LumiSport`、`LumiMagic_Season_02` |
| 路径禁止中文 | 目录名、文件名一律英文；**页面内展示文案可保留中文** |
| 文件名全局不重复 | 见第 3 节「去重命名策略」 |

---

## 2. 目标目录树

```
LumiWeb/
├── index.html                              # ★ 全站唯一 index.html（门户）
├── start-local-server.bat                  # 本地开发，可不部署
├── .gitignore
├── docs/
│   └── DIRECTORY_STRUCTURE.md              # 本文档
│
└── WebProjects/
    ├── _portal/                            # 门户共用资源（可选，从 index 拆出时）
    │   ├── portal.css
    │   ├── portal.js
    │   └── projects.json                   # 项目卡片数据，新增项目优先改这里
    │
    ├── _scripts/                           # 构建/拆分工具，部署可省略
    │   └── split-content.js
    │
    ├── LumiMagic_Season_01/                # 魔法学院 · 第一季
    │   ├── LumiMagic_Season_01.html        # ★ 项目 hub（与目录同名，见 §3）
    │   ├── shared/
    │   │   ├── common.css
    │   │   ├── common.js
    │   │   ├── wireframe.css
    │   │   └── module-nav.js
    │   └── modules/
    │       ├── login/
    │       │   ├── login.html              # 模块页：用语义名，不用 index.html
    │       │   ├── parts/
    │       │   └── login-utils.js
    │       ├── home/
    │       │   ├── home.html
    │       │   └── ...
    │       ├── booking/
    │       ├── order/
    │       ├── ticket/
    │       ├── role/
    │       ├── mine/
    │       ├── central/
    │       ├── promotion/
    │       ├── group/
    │       └── stats/
    │
    ├── LumiSport/                          # 竞技大空间（4 桶结构）
    │   ├── LumiSport.html                  # ★ 项目 hub（与目录同名，卡片分 4 段）
    │   ├── prototypes/                      # ① 可交互原型
    │   │   └── miniprogram/
    │   │       ├── prototype-hub.html
    │   │       └── ...
    │   ├── tools/                           # ② 工具
    │   │   └── value-calc/                  # 预测数值计算
    │   │       ├── value-calc.html
    │   │       ├── value-calc.css
    │   │       └── value-calc.js
    │   ├── docs/                            # ③ 设计 / 业务 / 规则文档
    │   │   ├── control-center/              # 已并入单仓库（内部文档名暂保留中文）
    │   │   │   ├── control-center.html
    │   │   │   ├── page-login.html
    │   │   │   ├── page-login-parts/
    │   │   │   └── ...（其余 page-* 保持现有模式）
    │   │   ├── business-flow/               # 已并入单仓库
    │   │   │   └── business-flow.html
    │   │   ├── warmup/                       # 原 warmup-docs
    │   │   │   ├── common-rules.html
    │   │   │   ├── blazing-boxer.html
    │   │   │   ├── speed-hockey.html
    │   │   │   ├── thunder-fencing.html
    │   │   │   ├── magic-party.html
    │   │   │   ├── waiting-scene.png
    │   │   │   └── *-figures/                # 图片英文名 fig-1.* … fig-N.*
    │   │   └── optimization/                 # 优化迭代文档
    │   │       ├── optimization-list.html
    │   │       ├── optimization-list.md
    │   │       ├── blazing-boxer-feedback.md
    │   │       ├── registration-prediction-doc-mapping.md
    │   │       └── registration-flow/
    │   │           ├── registration-flow.html
    │   │           └── registration-flow.md
    │   └── showcase/                         # ④ 对外展示 / 营销
    │       ├── hall-of-fame/
    │       │   ├── hall-of-fame.html
    │       │   ├── images/
    │       │   └── videos/
    │       └── events/
    │           └── mock-guessing-20260618/
    │               ├── mock-guessing-20260618.html
    │               ├── render.bat
    │               └── ...
    │
    └── LumiMagic_Season_02/                # 魔法学院 · 第二季（占位）
        └── LumiMagic_Season_02.html        # ★ 项目 hub（Coming Soon）
```

---

## 3. 去重命名策略（重点）

### 3.1 问题

若多处使用 `index.html` 或泛用名（`hub.html`、`portal.html`），会导致：

- IDE 搜索 / 标签页大量同名文件，难以区分  
- 对话中说「改 index.html」产生歧义  
- 迁移、review 时容易改错文件  

### 3.2 核心规则：全站只有 1 个 `index.html`

| 文件 | 职责 | URL |
|------|------|-----|
| `/index.html` | **唯一**全站门户 | `/` 或 `/index.html` |

**`WebProjects/` 及所有子目录内禁止出现 `index.html`。**

### 3.3 各层级入口命名（全局不重名）

| 层级 | 命名规则 | 示例 | 全局唯一性 |
|------|----------|------|------------|
| 全站门户 | 固定 `index.html` | `/index.html` | 全站 1 个 |
| 项目 hub | **`{项目目录名}.html`**，放在该项目根下 | `LumiSport/LumiSport.html` | 文件名 = 产品 ID，不重复 |
| 子系统入口 | 小写 `kebab-case`，语义化 | `control-center/control-center.html` | 路径 + 名双重区分 |
| 文档模块页 | **`{模块目录名}.html`** | `modules/login/login.html` | 目录 + 文件名 |
| 门户配置 | 非 HTML | `_portal/projects.json` | — |

**项目 hub 与目录同名**的好处：

- 每个项目 hub 文件名不同（`LumiMagic_Season_01.html` ≠ `LumiSport.html`）  
- 看到文件名就知道属于哪个产品线  
- 新增 `LumiMagic_Season_03/` 时，hub 自然为 `LumiMagic_Season_03.html`，规则可延续  

### 3.4 子系统入口命名约定

| 场景 | ❌ 避免 | ✅ 推荐 |
|------|---------|---------|
| 项目 hub | `LumiSport/index.html` | `LumiSport/LumiSport.html` |
| 控制中心 | `control-center/index.html` | `control-center/control-center.html` |
| 小程序原型总入口 | `miniprogram/index.html` | `miniprogram/prototype-hub.html` |
| 业务流程设计 | `business-flow/index.html` | `business-flow/business-flow.html` |
| 文档模块页 | `modules/login/index.html` | `modules/login/login.html` |
| 泛用 hub 名 | 各项目都用 `hub.html` | 各项目用 `{目录名}.html` |

### 3.5 其它层级命名规则

| 层级 | 规则 | 示例 |
|------|------|------|
| 项目根目录 | `PascalCase` + 下划线 | `LumiMagic_Season_01` |
| 项目 hub 文件 | 与目录同名 | `LumiMagic_Season_01/LumiMagic_Season_01.html` |
| 项目内子目录 | 小写 `kebab-case` | `warmup-docs`、`admin-styles` |
| 页面 / 脚本 | 小写 `kebab-case` | `common-rules.html`、`client-betting.js` |
| 工具目录 | 下划线前缀 | `_portal/`、`_scripts/` |
| 文档片段 parts | `序号-英文描述.html` | `1-global-flow-overview.html` |

### 3.6 URL 说明

所有入口 URL 均带明确文件名，例如：

- `/WebProjects/LumiSport/LumiSport.html`  
- `/WebProjects/LumiSport/docs/control-center/control-center.html`  
- `/WebProjects/LumiSport/docs/business-flow/business-flow.html`  

路径即文档，无歧义。若将来需要短 URL，可在服务器做 rewrite（如 `/LumiSport/` → `LumiSport.html`），**源码仍保持语义文件名**。

---

## 4. 部署与访问路径

### 4.1 上传清单

```
index.html
WebProjects/          # 整个目录（_scripts/ 可不传）
docs/                 # 可选，内部文档可不传
```

### 4.2 主要 URL 对照

| 页面 | URL |
|------|-----|
| 全站门户 | `/index.html` |
| 魔法学院 S1 hub | `/WebProjects/LumiMagic_Season_01/LumiMagic_Season_01.html` |
| 魔法学院 · 登录模块 | `/WebProjects/LumiMagic_Season_01/modules/login/login.html` |
| 竞技大空间 hub | `/WebProjects/LumiSport/LumiSport.html` |
| 控制中心 | `/WebProjects/LumiSport/docs/control-center/control-center.html` |
| 业务流程 | `/WebProjects/LumiSport/docs/business-flow/business-flow.html` |
| 小程序原型 | `/WebProjects/LumiSport/prototypes/miniprogram/prototype-hub.html` |
| 工具 · 预测数值计算 | `/WebProjects/LumiSport/tools/value-calc/value-calc.html` |
| 热身 · 通用规则 | `/WebProjects/LumiSport/docs/warmup/common-rules.html` |
| 优化迭代清单 | `/WebProjects/LumiSport/docs/optimization/optimization-list.html` |
| 荣誉殿堂 | `/WebProjects/LumiSport/showcase/hall-of-fame/hall-of-fame.html` |
| 魔法学院 S2 占位 | `/WebProjects/LumiMagic_Season_02/LumiMagic_Season_02.html` |

### 4.3 根门户链接示例

```html
<a href="WebProjects/LumiMagic_Season_01/LumiMagic_Season_01.html">Lumi 魔法学院</a>
<a href="WebProjects/LumiSport/LumiSport.html">Lumi 竞技大空间</a>
<a href="WebProjects/LumiMagic_Season_02/LumiMagic_Season_02.html">Lumi 魔法学院 · 第二季</a>
```

---

## 5. 旧路径 → 新路径迁移对照

### 5.1 项目 / 目录

| 现在 | 迁移后 |
|------|--------|
| `WebProjects/lumi-magic.html` | `WebProjects/LumiMagic_Season_01/LumiMagic_Season_01.html` |
| `WebProjects/lumi-sport.html` | `WebProjects/LumiSport/LumiSport.html` |
| `WebProjects/magic-*`（平铺） | `WebProjects/LumiMagic_Season_01/modules/...` |
| `WebProjects/LumiSportWeb/web/` | `WebProjects/LumiSport/control-center/` |
| `WebProjects/LumiSportWeb/web/index.html` | `WebProjects/LumiSport/control-center/control-center.html` |
| `WebProjects/lumi-sport-miniprogram/` | `WebProjects/LumiSport/miniprogram/` |
| `WebProjects/lumi-sport-miniprogram/index.html` | `WebProjects/LumiSport/miniprogram/prototype-hub.html` |
| `WebProjects/Design_LumiSport/` | `WebProjects/LumiSport/business-flow/` |
| `WebProjects/LumiSport热身设计_独立文档/` | `WebProjects/LumiSport/warmup-docs/` |
| `WebProjects/_split_all_v2.js` | `WebProjects/_scripts/split-content.js` |

**内部「返回项目」链接**（迁移时需批量更新）：

| 场景 | 旧链接 | 新链接 |
|------|--------|--------|
| 魔法模块 topbar | `lumi-magic.html` | `../../LumiMagic_Season_01.html`（在 `modules/*/` 下） |
| 控制中心 nav-back | `../../lumi-sport.html` | `../../LumiSport.html` |
| 根门户 | — | 仍指向各项目 `{Name}.html` |

### 5.2 魔法学院模块（示例）

| 现在 | 迁移后 |
|------|--------|
| `magic-login.html` | `LumiMagic_Season_01/modules/login/login.html` |
| `magic-home.html` | `LumiMagic_Season_01/modules/home/home.html` |
| `magic-booking.html` | `LumiMagic_Season_01/modules/booking/booking.html` |
| `common.css` 等 | `LumiMagic_Season_01/shared/` |

### 5.3 热身设计（warmup-docs）

| 现在 | 迁移后 |
|------|--------|
| `通用规则.html` | `common-rules.html` |
| `烈焰拳王.html` | `blazing-boxer.html` |
| `疾速冰球.html` | `speed-hockey.html` |
| `雷霆击剑.html` | `thunder-fencing.html` |
| `魔法派对.html` | `magic-party.html` |

图片目录（HTML 内引用路径同步改）：

| 现在 | 迁移后 |
|------|--------|
| `冰球示意图/` | `speed-hockey-figures/` |
| `击剑示意图/` | `thunder-fencing-figures/` |
| `魔法派对示意图/` | `magic-party-figures/` |

### 5.4 小程序原型（miniprogram）

| 现在 | 迁移后 |
|------|--------|
| `客户端.html` | `client.html` |
| `客户端.js` | `client.js` |
| `客户端.css` | `client.css` |
| `客户端-竞猜.js` | `client-betting.js` |
| `客户端-竞猜-data.js` | `client-betting-data.js` |
| `客户端-竞猜-选手.js` | `client-betting-players.js` |
| `客户端-竞猜-记录.js` | `client-betting-records.js` |
| `客户端-竞猜-报名.js` | `client-betting-signup.js` |
| `客户端-竞猜-门店.js` | `client-betting-store.js` |
| `客户端-竞猜-下注.js` | `client-betting-place.js` |
| `管理员端.html` | `admin.html` |
| `管理员端.js` | `admin.js` |
| `管理员端.css` | `admin.css` |
| `管理员端-区域.js` | `admin-zones.js` |
| `管理员端-商品.js` | `admin-products.js` |
| `管理员端-扫码.js` | `admin-scan.js` |
| `管理员端-扫码-data.js` | `admin-scan-data.js` |
| `管理员端-扫码-弹窗.js` | `admin-scan-modal.js` |
| `管理员端-扫码-发放.js` | `admin-scan-grant.js` |
| `管理员端-扫码-发放页.js` | `admin-scan-grant-page.js` |
| `管理员端-扫码-报名.js` | `admin-scan-signup.js` |
| `管理员端-扫码-兑换.js` | `admin-scan-redeem.js` |
| `管理员端-styles/` | `admin-styles/` |
| `管理员端-styles/场次.css` | `admin-styles/sessions.css` |
| `管理员端-styles/商品库.css` | `admin-styles/products.css` |
| `管理员端-styles/弹窗.css` | `admin-styles/modals.css` |
| `管理员端-styles/我的.css` | `admin-styles/profile.css` |
| `管理员端-styles/扫码兑换.css` | `admin-styles/scan-redeem.css` |
| `优化记录.md` | `changelog.md`（可选） |

### 5.5 LumiSport web 文档片段（page-login-parts 示例）

| 现在 | 迁移后 |
|------|--------|
| `1-全局流程概览.html` | `1-global-flow-overview.html` |
| `2-登录页UI.html` | `2-login-ui.html` |
| `3-微信登录.html` | `3-wechat-login.html` |
| `4-用户角色与权限.html` | `4-roles-and-permissions.html` |
| `5-用户初始化与经济系统.html` | `5-user-init-and-economy.html` |
| `6-选择门店页.html` | `6-store-selection.html` |
| `7-Token持久化.html` | `7-token-persistence.html` |
| `8-页面跳转关系.html` | `8-page-navigation.html` |
| `9-退出登录.html` | `9-logout.html` |
| `10-白名单管理.html` | `10-whitelist-management.html` |
| `11-相关API.html` | `11-related-apis.html` |
| `12-页脚.html` | `12-footer.html` |

其余 `page-bet-parts`、`page-danmaku-parts`、`page-event-parts`、`page-mine-parts` 按同一规则：**保留序号 + 英文 kebab-case**，并更新对应 `page-*.html` 中的 `PARTS` 数组。

---

## 6. 内容组织模式（新页面统一遵循）

### 6.1 推荐模式（LumiSport web 已在用）

```
page-xxx.html              # 壳页 + 导航
page-xxx.css
page-xxx-utils.js
page-xxx-parts/            # HTML 片段，fetch 加载
  1-section-name.html
  2-section-name.html
```

### 6.2 魔法学院旧模式（逐步淘汰）

```
magic-xxx-s1.js            # JS 字符串块
magic-xxx-loader.js        # 注入 DOM
```

新模块或重构模块优先改为 **parts + fetch**；旧 loader 可在迁入 `modules/` 后分批替换。

---

## 7. Git 单仓库（已并仓）

`business-flow`、`control-center` 原为两个独立 Git 仓库，已于 2026-06-30 **以文件快照方式并入 LumiWeb 单一仓库**：

- 删除各自的 `.git`，断开与原远程仓库的关联（不保留各自提交历史）。
- 移入 `WebProjects/LumiSport/docs/` 下，作为普通文件由 LumiWeb 父仓库统一跟踪。
- 父仓库 `.gitignore` 已移除对这两个目录的忽略规则。

> 现位置：`LumiSport/docs/business-flow/`、`LumiSport/docs/control-center/`。
> 备注：这两个目录内部的页面片段 / 文档暂保留中文文件名（如 `page-*-parts/` 与 `小程序需求文档/`），仅修正了跨目录与返回 hub 的链接；后续如需彻底英文化，需同步更新各 `page-*.html` 的 `PARTS` 数组及相关引用。

---

## 8. 新增项目 checklist

1. 在 `WebProjects/` 下新建 `LumiXxx/` 或 `LumiMagic_Season_NN/`  
2. 在该目录根放 **`{目录名}.html`** 作为 hub（禁止 `index.html`）  
3. 子系统用语义文件名（禁止 `index.html`、`hub.html` 等泛用名）  
4. 在 `WebProjects/_portal/projects.json` 或根 `index.html` 增加入口卡片  
5. 更新 `start-local-server.bat` 中的快捷 URL（可选）  
6. 路径、文件名全部英文；不写中文路径  

---

## 9. 实施顺序建议

| 阶段 | 内容 | 风险 |
|------|------|------|
| 1 | 建 `docs/`、`_portal/`、`_scripts/`，更新 `.gitignore` | 低 |
| 2 | 迁 `LumiSport/`（web、miniprogram、warmup-docs、design） | 中 |
| 3 | 迁 `LumiMagic_Season_01/`（modules 收拢 + 重命名） | 高 |
| 4 | 更新根 `index.html` 链接与 `start-local-server.bat` | 低 |
| 5 | 清理 `WebProjects/` 根目录遗留平铺文件 | 中 |

每阶段完成后本地 HTTP 服务逐链接点测。

---

## 10. 已确认决策摘要

- ✅ 除根 `index.html` 外，内容均在 `WebProjects/`  
- ✅ 项目名：`LumiMagic_Season_01`、`LumiSport`、`LumiMagic_Season_02`  
- ✅ 中文路径/文件名全部英文化  
- ✅ **全站仅 1 个 `index.html`**（根门户）；项目 hub 用 `{目录名}.html`  
- ✅ 子系统与模块页使用语义化文件名，避免重名  

---

*迁移实施时以本文为准；若有变更请更新本文档版本号与日期。*
