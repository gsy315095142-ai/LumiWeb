# LumiSport 目录重构 + 单仓库合并 · 执行交接文档

> 版本：v1.0 · 2026-06-30
> 适用对象：**持有 `business-flow` / `control-center` 两个子仓库本地副本的那台电脑上的 AI**
> 目的：把 `WebProjects/LumiSport/` 下平铺的 8 个异类目录重构为 4 个语义分组，并把两个原本独立的子仓库**并入 LumiWeb 单一仓库**（去除其与原远程仓库的关联）。
>
> 本文档自包含，无需其它上下文即可执行。所有路径以仓库根 `LumiWeb/` 为基准。

---

## 0. 背景与现状

`WebProjects/LumiSport/` 当前平铺着 8 个性质完全不同的目录，且存在 3 处违反项目规范（见 `docs/DIRECTORY_STRUCTURE.md`）的问题：

1. **仍有中文目录/文件名**：`优化方案/`、`优化方案/报名与预测流程优化/`、`预测数值计算/`，以及若干中文文件名（清单 html/md、`出图.bat`、warmup 图片等）。
2. **出现了第 2 个 `index.html`**：`预测数值计算/index.html`，违反"全站仅 1 个 index.html"。
3. `business-flow`、`control-center` 是两个**独立 Git 仓库**（非 submodule，无 `.gitmodules`），目前通过 `.gitignore` 被父仓库忽略。

LumiWeb 本身是单一仓库：`origin = https://github.com/gsy315095142-ai/LumiWeb.git`，主分支 `master`。

**本次目标**：4 桶分组 + 全英文路径 + 消灭第 2 个 index.html + 两个子仓库并入 LumiWeb（删除各自 `.git`，纳入父仓库版本管理）。

> 注意：执行机上 `business-flow/`、`control-center/` 是**存在**的（另一台原始机上不存在，故由本机执行并仓）。

---

## 1. 目标目录树（4 桶）

```
WebProjects/LumiSport/
├── LumiSport.html                      # hub（卡片重排为 4 段，详见 §5）
│
├── prototypes/                         # ① 可交互原型
│   └── miniprogram/                    # ← 原 miniprogram/（文件内容不变）
│
├── tools/                              # ② 工具
│   └── value-calc/                     # ← 原 预测数值计算/
│       ├── value-calc.html             # ← index.html
│       ├── value-calc.css              # ← styles.css
│       └── value-calc.js               # ← app.js
│
├── docs/                               # ③ 设计 / 业务 / 规则文档
│   ├── business-flow/                  # ← 原 LumiSport/business-flow/（并仓，去 .git）
│   ├── control-center/                 # ← 原 LumiSport/control-center/（并仓，去 .git）
│   ├── warmup/                         # ← 原 warmup-docs/
│   │   ├── common-rules.html
│   │   ├── blazing-boxer.html
│   │   ├── speed-hockey.html
│   │   ├── thunder-fencing.html
│   │   ├── magic-party.html
│   │   └── *-figures/                  # 图片改英文名（见 §3.3）
│   └── optimization/                   # ← 原 优化方案/（以后可放更多迭代周期文档）
│       ├── optimization-list.html      # ← 竞技大空间优化迭代清单.html
│       ├── optimization-list.md        # ← 竞技大空间优化迭代清单.md
│       ├── optimization-list.css       # （已英文，不动）
│       ├── optimization-list.js        # （已英文，不动）
│       ├── blazing-boxer-feedback.md   # ← 烈焰拳王反馈优化方案.md
│       └── registration-flow/          # ← 报名与预测流程优化/
│           ├── registration-flow.html  # ← 报名与预测流程优化.html
│           ├── registration-flow.md    # ← 报名与预测流程优化.md
│           ├── registration-flow.css        # （已英文，不动）
│           ├── registration-flow.js         # （已英文，不动）
│           ├── registration-flow-mockups.css# （已英文，不动）
│           └── registration-flow-mockups.js # （已英文，不动）
│
└── showcase/                           # ④ 对外展示 / 营销
    ├── hall-of-fame/                   # ← 原 hall-of-fame/（文件内容不变）
    └── events/                         # ← 原 events/
        └── mock-guessing-20260618/
            ├── render.bat              # ← 出图.bat
            └── ...（其余文件名已英文）
```

---

## 2. 子仓库并入 LumiWeb（单仓库化）

对 `business-flow`、`control-center` 各执行：

1. **去除与原远程仓库的关联**：删除该目录下的 `.git` 文件夹。
   - `Remove-Item -Recurse -Force WebProjects\LumiSport\business-flow\.git`
   - `Remove-Item -Recurse -Force WebProjects\LumiSport\control-center\.git`
   - 若它们内部还有 `.gitignore` / `.github` 等仅服务于独立仓库的文件，按需保留或清理（一般保留无害）。
2. **移动到新位置**（与 §3 目录重构一并完成）：
   - `WebProjects/LumiSport/business-flow/` → `WebProjects/LumiSport/docs/business-flow/`
   - `WebProjects/LumiSport/control-center/` → `WebProjects/LumiSport/docs/control-center/`
3. **从父仓库 `.gitignore` 删除忽略规则**（见 §6）。
4. 执行完所有重构后，这两个目录的全部文件将作为普通文件被 LumiWeb 仓库跟踪。

> 历史说明：本操作仅保留**文件快照**，不保留这两个仓库各自的提交历史。如需保留历史，须改用 `git subtree`/`git read-tree` 合并，本文档不涉及——若要保留请先停下并与用户确认。

---

## 3. 目录与文件重命名映射

### 3.1 目录（含移动）

| 现路径 | 新路径 |
|--------|--------|
| `WebProjects/LumiSport/miniprogram/` | `WebProjects/LumiSport/prototypes/miniprogram/` |
| `WebProjects/LumiSport/预测数值计算/` | `WebProjects/LumiSport/tools/value-calc/` |
| `WebProjects/LumiSport/business-flow/` | `WebProjects/LumiSport/docs/business-flow/` |
| `WebProjects/LumiSport/control-center/` | `WebProjects/LumiSport/docs/control-center/` |
| `WebProjects/LumiSport/warmup-docs/` | `WebProjects/LumiSport/docs/warmup/` |
| `WebProjects/LumiSport/优化方案/` | `WebProjects/LumiSport/docs/optimization/` |
| `WebProjects/LumiSport/优化方案/报名与预测流程优化/` | `WebProjects/LumiSport/docs/optimization/registration-flow/` |
| `WebProjects/LumiSport/hall-of-fame/` | `WebProjects/LumiSport/showcase/hall-of-fame/` |
| `WebProjects/LumiSport/events/` | `WebProjects/LumiSport/showcase/events/` |

### 3.2 文件改名

| 现文件 | 新文件 |
|--------|--------|
| `tools/value-calc/index.html`（原 `预测数值计算/index.html`） | `value-calc.html` |
| `tools/value-calc/styles.css` | `value-calc.css` |
| `tools/value-calc/app.js` | `value-calc.js` |
| `docs/optimization/竞技大空间优化迭代清单.html` | `optimization-list.html` |
| `docs/optimization/竞技大空间优化迭代清单.md` | `optimization-list.md` |
| `docs/optimization/烈焰拳王反馈优化方案.md` | `blazing-boxer-feedback.md` |
| `docs/optimization/registration-flow/报名与预测流程优化.html` | `registration-flow.html` |
| `docs/optimization/registration-flow/报名与预测流程优化.md` | `registration-flow.md` |
| `showcase/events/mock-guessing-20260618/出图.bat` | `render.bat` |

### 3.3 warmup 图片改名（中文 → 英文）

`docs/warmup/` 下存在中文图片文件名，需改为英文并同步更新引用：

- 根目录单图 `击球场景示意图.png`（或类似中文名）→ 取语义英文名，如 `blazing-boxer-scene.png`（**先打开引用它的 html 确认归属再定名**）。
- 各 `*-figures/` 子目录内的中文图片（如 `击球N.png`、`魔法N.png` 等），统一改为 `fig-1.<ext>` … `fig-N.<ext>`，**保持原序号顺序、保留原扩展名**（注意 `speed-hockey-figures` 混有 `.jpg`/`.png`；`thunder-fencing-figures` 含 `4.1`/`4.2` → 改为 `fig-4-1`/`fig-4-2`）。
- 改完后，**逐个打开对应 warmup html，把 `<img src="...中文名...">` 改成新英文名**。建议用 grep 校验无残留中文 src。

---

## 4. 链接 / 引用更新清单（精确到文件）

> 原则：**凡是被多套了一层目录的页面，其指向上层的相对路径（`../`）都要 +1 层。** 下表已给出最终值，按行修改。行号为重构前的位置，仅供定位。

### 4.1 `tools/value-calc/value-calc.html`（原 `预测数值计算/index.html`）

| 位置 | 原值 | 新值 |
|------|------|------|
| `<link rel="stylesheet">` | `href="styles.css"` | `href="value-calc.css"` |
| 顶部返回链接 | `href="../LumiSport.html"` | `href="../../LumiSport.html"` |
| 底部脚本 | `src="app.js"` | `src="value-calc.js"` |

### 4.2 `prototypes/miniprogram/`

| 文件 | 原值 | 新值 |
|------|------|------|
| `prototype-hub.html`（×2 处返回链接） | `href="../LumiSport.html"` | `href="../../LumiSport.html"` |
| `prototype-hub.html`（业务流程链接） | `href="../business-flow/business-flow.html"` | `href="../../docs/business-flow/business-flow.html"` |
| `client.html` | `href="../LumiSport.html"` | `href="../../LumiSport.html"` |
| `admin.html` | `href="../LumiSport.html"` | `href="../../LumiSport.html"` |

> 其余 miniprogram 内部文件互相引用是同目录相对路径，不受影响。建议 grep `../` 复查是否还有指向 LumiSport 根或 `_portal` 的链接。

### 4.3 `docs/warmup/*.html`（5 个文件）

`common-rules.html` / `blazing-boxer.html` / `speed-hockey.html` / `thunder-fencing.html` / `magic-party.html`：

| 原值 | 新值 |
|------|------|
| `href="../LumiSport.html"` | `href="../../LumiSport.html"` |

（图片 src 改名见 §3.3。）

### 4.4 `docs/optimization/`

| 文件 | 原值 | 新值 |
|------|------|------|
| `optimization-list.html` | `href="../LumiSport.html"` | `href="../../LumiSport.html"` |
| `registration-flow/registration-flow.html` | `href="../../LumiSport.html"` | `href="../../../LumiSport.html"` |

> `optimization-list.html` 引用的 `optimization-list.css/.js` 为同目录，不变。`registration-flow.html` 引用的 `registration-flow*.css/.js` 为同目录，不变。

### 4.5 `showcase/hall-of-fame/hall-of-fame.html`

| 原值 | 新值 |
|------|------|
| `href="../LumiSport.html"` | `href="../../LumiSport.html"` |

> `images/`、`videos/` 为同目录子文件夹，引用不变。

### 4.6 `showcase/events/mock-guessing-20260618/`

| 文件 | 原值 | 新值 |
|------|------|------|
| `mock-guessing-20260618.html` | `href="../../LumiSport.html"` | `href="../../../LumiSport.html"` |
| `script.js`（×3 处 ruleLink） | `'../../warmup-docs/speed-hockey.html'` 等 | `'../../../docs/warmup/speed-hockey.html'` 等 |

`script.js` 三处具体：
- `'../../warmup-docs/speed-hockey.html'` → `'../../../docs/warmup/speed-hockey.html'`
- `'../../warmup-docs/blazing-boxer.html'` → `'../../../docs/warmup/blazing-boxer.html'`
- `'../../warmup-docs/thunder-fencing.html'` → `'../../../docs/warmup/thunder-fencing.html'`

---

## 5. hub 重排：`WebProjects/LumiSport/LumiSport.html`

hub 自身位置不变（`../../index.html`、`../_portal/site-version.js` 保持不动）。需要做两件事：

### 5.1 更新 8 张卡片的 `href`

| 卡片 | 原 href | 新 href |
|------|---------|---------|
| 控制中心 | `control-center/control-center.html` | `docs/control-center/control-center.html` |
| 业务流程 | `business-flow/business-flow.html` | `docs/business-flow/business-flow.html` |
| 预测数值计算 | `预测数值计算/index.html` | `tools/value-calc/value-calc.html` |
| 小程序原型 | `miniprogram/prototype-hub.html` | `prototypes/miniprogram/prototype-hub.html` |
| 热身设计 | `warmup-docs/common-rules.html` | `docs/warmup/common-rules.html` |
| 优化迭代清单 | `优化方案/竞技大空间优化迭代清单.html` | `docs/optimization/optimization-list.html` |
| 报名与预测流程 | `优化方案/报名与预测流程优化/报名与预测流程优化.html` | `docs/optimization/registration-flow/registration-flow.html` |
| 荣誉殿堂 | `hall-of-fame/hall-of-fame.html` | `showcase/hall-of-fame/hall-of-fame.html` |

### 5.2 把卡片列表分成 4 段小标题

在 `.doc-list` 内按下列分组插入 4 个分段标题（沿用现有 `.section-label` 样式或新增一个轻量小标题 class，视觉与现有风格保持一致），顺序建议：

1. **可交互原型**：小程序原型
2. **工具**：预测数值计算
3. **设计 / 业务 / 文档**：控制中心、业务流程、热身设计、优化迭代清单、报名与预测流程
4. **对外展示**：荣誉殿堂

> 备注：`events/mock-guessing` 当前**不在 hub 卡片中**（仅通过 `start-local-server.bat` 快捷入口访问），本次不强制加卡片；如需展示可在"对外展示"段补一张。

---

## 6. 父仓库 `.gitignore`

删除这两行（让并入的子仓库内容被 LumiWeb 跟踪）：

```
WebProjects/LumiSport/business-flow/
WebProjects/LumiSport/control-center/
```

其余规则（旧目录残留、本地临时文件）保持不变。

---

## 7. `start-local-server.bat`

更新两条写死的快捷 URL：

| 原 | 新 |
|----|----|
| `.../WebProjects/LumiSport/events/mock-guessing-20260618/mock-guessing-20260618.html` | `.../WebProjects/LumiSport/showcase/events/mock-guessing-20260618/mock-guessing-20260618.html` |
| `.../WebProjects/LumiSport/control-center/control-center.html` | `.../WebProjects/LumiSport/docs/control-center/control-center.html` |

`serve.ps1` 是通用静态服务、无写死路径，**不需要改**。

---

## 8. 两个子仓库内部回链（重点：只有持有它们的机器能改）

`business-flow/`、`control-center/` 因为被移到 `docs/` 下，**相对深度 +1**。请在这两个目录内：

1. grep 查找指向 hub 的相对链接（如 `../../LumiSport.html`、`../../lumi-sport.html`、指向 `_portal`、根 `index.html` 的相对路径）。
2. 凡是穿越到 LumiSport 根或更上层的相对路径，统一 **+1 层 `../`**。
   - 例：`control-center/control-center.html` 内若有 `href="../../LumiSport.html"`，移动后应为 `href="../../../LumiSport.html"`。
3. 注意其内部 `page-*` 子页面、`page-*-parts/` 片段加载路径若是相对自身目录则不受影响；只有跨出本子仓库目录、指向 LumiSport/根的链接才需 +1。

> 这一步在原始机器上无法完成（那台机器没有这两个目录），必须由本机执行。

---

## 9. `docs/DIRECTORY_STRUCTURE.md` 更新

重构完成后同步更新该规范文档：

- 把 `LumiSport/` 目录树改为本文 §1 的 4 桶结构。
- 补上之前漏记的 `showcase/hall-of-fame/`、`showcase/events/`。
- 第 7 节"Git 子仓库"改写为"已并入 LumiWeb 单仓库，不再有独立子仓库"，并删除对应 `.gitignore` 说明。
- 升版本号与日期（如 v1.2 · 2026-06-30）。

---

## 10. 验证清单（重构后逐项过）

1. **全站仅 1 个 index.html**：`Get-ChildItem -Recurse -Filter index.html` 只应返回根 `index.html`。
2. **无中文路径**：在 `WebProjects/LumiSport/` 下确认无中文目录名/文件名残留（图片、md、html、bat 全部英文）。
3. **无独立 .git**：`docs/business-flow/`、`docs/control-center/` 下不再有 `.git` 文件夹。
4. **本地起服务点测**（`start-local-server.bat`）：
   - 进 `LumiSport.html`，逐张卡片点开，**8 个链接全部 200、无 404**。
   - 每个子页面的"返回 LumiSport / 返回项目"链接能正确回到 hub。
   - `tools/value-calc/value-calc.html` 样式与脚本正常（无控制台 404）。
   - warmup 各页图片正常显示（无裂图）。
   - events `mock-guessing` 页内"规则链接"能跳到 `docs/warmup/*` 对应页。
   - prototype-hub 里"查看业务流程说明"能跳到 `docs/business-flow/business-flow.html`。
5. **grep 复查**：全 `WebProjects/LumiSport/` 搜 `warmup-docs`、`预测数值计算`、`优化方案`、`hall-of-fame/`（裸引用）、`miniprogram/`（跨层裸引用）等旧路径关键字，确认无遗漏。
6. `git status` 查看：两个原子仓库内容应作为新增普通文件出现在待提交列表中。

---

## 11. 建议执行顺序

1. 先删两个子仓库的 `.git`（§2.1）。
2. 建 4 个桶目录，move 所有子目录到位（§3.1）。
3. 改文件名（§3.2、§3.3）。
4. 批量修链接（§4、§5、§7、§8）。
5. 改 `.gitignore`（§6）。
6. 更新 `DIRECTORY_STRUCTURE.md`（§9）。
7. 起服务跑验证清单（§10）。
8. 全部通过后再 `git add` / `commit`（提交信息可如：`refactor(LumiSport): 4-bucket structure + merge business-flow/control-center into monorepo`）。**提交前请等用户确认。**

---

*本文档为一次性迁移说明；执行完成后可归档或删除。*
