# OpenCLI 适配器系统分析

## 架构概览

OpenCLI 采用 **Dynamic Loader + YAML/TS 双引擎** 架构，通过约定式目录结构实现 79+ 网站适配器的自动发现与注册。核心设计理念：简单流程用 YAML 声明，复杂逻辑用 TypeScript，两者共享统一的命令注册表。

## 加载机制（Dynamic Loader）

### 双路径发现

```
discoverClis(dirs)
  ├── Fast Path: loadFromManifest()  ← cli-manifest.json（生产模式）
  │     ├── YAML: pipeline 直接内联，零解析开销
  │     └── TS: 注册轻量 stub，延迟加载（_lazy + _modulePath）
  └── Fallback: discoverClisFromFs() ← 文件系统扫描（开发模式）
        ├── *.yaml → registerYamlCli() → js-yaml 解析 → registerCommand()
        └── *.ts/*.js → 正则检测 cli()/onStartup() → dynamic import()
```

**关键设计**：
- 生产环境使用预编译 manifest，YAML pipeline 完全内联为 JSON，消除运行时 YAML 解析
- TS 模块采用延迟加载（lazy stub），只在首次执行时才 `import()` 实际模块
- 注册表用 `globalThis.__opencli_registry__` 全局共享，确保 npm link / peerDependency 场景下模块实例唯一

### 注册表（Registry）

命令以 `site/name` 为 canonical key 存入全局 `Map<string, CliCommand>`，支持 alias 映射。每个命令携带 strategy（PUBLIC/COOKIE/HEADER/INTERCEPT/UI）、browser 标志、参数定义、pipeline 或 func。

## YAML vs TS 适配器对比

| 维度 | YAML 适配器 | TypeScript 适配器 |
|------|------------|-------------------|
| 定义方式 | `.yaml` 文件，声明式 pipeline | `.ts` 文件，调用 `cli()` 注册 |
| 执行模型 | Pipeline 步骤链（navigate → evaluate → map → limit） | 自定义 `func(page, kwargs)` 函数 |
| 浏览器能力 | 通过内置 steps（navigate/click/type/wait/snapshot/intercept/tap） | 直接操作 `IPage` 接口（CDP、原生点击、文件上传等） |
| 适用场景 | 简单 API 抓取、列表类命令 | 需要签名算法（如 Bilibili WBI）、复杂业务逻辑、状态管理 |
| 依赖管理 | 无外部依赖 | 可 import 共享模块（如 `_shared/`） |
| 典型例子 | `bilibili/hot.yaml`（热门视频） | `bilibili/feed.ts`（动态时间线）、`cursor/*.ts` |

### Pipeline 执行引擎

YAML pipeline 由 `executePipeline()` 驱动，步骤注册在动态 step registry 中：

```
核心步骤：navigate, fetch, evaluate, click, type, wait, press, snapshot
数据变换：select, map, filter, sort, limit
高级操作：intercept（网络拦截）, tap（Store 交互）, download
```

每个 step handler 签名统一：`(page, params, data, args) => Promise<TResult>`，data 在步骤间流式传递。支持浏览器步骤自动重试（可配次数）。

### IPage 抽象层

`types.ts` 定义了 `IPage` 接口——类型安全的浏览器页面抽象，涵盖导航、快照、点击、输入、Cookie、截图、网络捕获、CDP 原生命令等。这是 YAML steps 和 TS func 共享的底层能力。

## 适配器生成流程

### 三阶段工作流

```
explore → synthesize → generate
```

1. **explore**（探索）：打开目标 URL，自动滚动触发懒加载，捕获网络流量，分析 JSON 响应结构，自动推断 API 能力（端点、分页参数、认证方式、字段角色）
2. **synthesize**（合成）：将探索产物转为 YAML pipeline 候选，自动 ranking
3. **generate**（一键生成）：串联 explore + synthesize，按 goal 过滤最佳候选

### record 模式（录制回放）

手动操作浏览器 → fetch/XHR 拦截器录制所有请求 → 分析请求/响应 → 推断能力 → 写 YAML 候选。适合 explore 无法自动触发的交互场景。

## 插件系统

```
~/.opencli/plugins/<name>/    ← 每个插件一个目录
~/.opencli/plugins.lock.json  ← 安装锁（source + commitHash + timestamp）
~/.opencli/monorepos/<repo>/  ← monorepo 克隆（子插件用 symlink 引用）
```

**安装源格式**：`github:user/repo`、`github:user/repo/subplugin`、`file:///local/path`、`/absolute/path`

**关键机制**：
- 插件内 TS 文件通过 esbuild 即时转译为 JS
- `linkHostOpencli()` 将宿主 opencli symlink 到插件 node_modules，确保 TS 插件 resolve 到宿主版本
- 支持 monorepo（`opencli-plugin.json` 声明 `plugins` 字段），子插件以 symlink 方式安装
- 事务性安装/更新（`Transaction` 类 + temp→rename 原子替换）
- 版本兼容性检查（简化 semver range 解析）

### opencli-plugin.json

```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "opencli": ">=1.0.0",
  "plugins": {          // monorepo 模式
    "sub-plugin": { "path": "plugins/sub-plugin", "description": "..." }
  }
}
```

## 典型适配器分析

### bilibili（YAML + TS 混合）

- **hot.yaml**：纯 YAML pipeline，navigate → evaluate（fetch API）→ map → limit，适合简单的热门列表
- **feed.ts**：TS 适配器，因为需要自定义 `apiGet()` 封装（Cookie 认证 + WBI 签名）、`payloadData()` 数据提取、`stripHtml()` 文本处理
- **utils.ts**：站点级共享工具（BV 号解析、WBI 签名算法、UID 解析），被多个 TS 适配器复用
- 展示了同站点 YAML/TS 混用的典型模式：简单命令 YAML，复杂命令 TS，共享工具模块

### cursor（纯 TS + 共享工厂）

- 所有命令（status, screenshot, new, dump 等）均调用 `_shared/desktop-commands.ts` 的工厂函数
- 工厂模式（`makeStatusCommand`, `makeScreenshotCommand`）消除了 Electron 应用类适配器的重复代码
- Strategy.UI + CDP 直连，无需 Cookie

### _shared/ 目录

跨站点共享模块，如 `desktop-commands.ts`（Electron 应用命令工厂）、`common.ts`。适配器通过 `import from '../_shared/'` 复用。

## 可借鉴的设计模式

1. **Manifest 预编译**：YAML 在构建时内联为 JSON，零运行时解析开销——适合有大量声明式配置的系统
2. **Lazy Stub 延迟加载**：TS 模块注册时只存路径，首次执行才加载——降低启动时间
3. **globalThis 全局注册表**：解决 npm link / peerDependency 导致的模块实例隔离问题
4. **Pipeline Step Registry**：开放的步骤注册机制，插件可注册自定义 YAML 操作
5. **IPage 抽象层**：统一浏览器交互接口，YAML steps 和 TS func 共享同一套能力
6. **共享工厂模式**：`_shared/` + 命令工厂消除同类适配器重复代码
7. **事务性安装**：temp → rename 原子替换 + 回滚机制，保证插件安装的幂等性和安全性
8. **双引擎分层**：YAML 覆盖 80% 简单场景，TS 处理 20% 复杂需求——降低社区贡献门槛
9. **录制回放 + 自动探索**：两种互补的适配器生成路径，降低新站点适配成本
10. **monorepo + symlink**：子插件以 symlink 引用 monorepo 仓库，共享依赖、独立安装
