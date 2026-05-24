# n1majne3/zai-usage-menu-bar 学习分析

> 项目地址: https://github.com/n1majne3/zai-usage-menu-bar
> 学习日期: 2026-04-06
> 类型: macOS 菜单栏原生应用 → 智谱 Coding Plan 用量监控

## 项目概览

macOS 菜单栏原生应用，实时监控智谱 Coding Plan API 用量。纯 Swift + SwiftUI，零第三方依赖，SPM 构建。

**技术栈**: Swift 5.9 / SwiftUI / macOS 14 (Sonoma) / Swift Package Manager

## 项目结构

```
ZaiUsageMenuBar/
├── Package.swift                   # SPM 配置
└── Sources/ZaiUsageMenuBar/
    ├── ZaiUsageMenuBarApp.swift    # @main 入口 + 语言设置
    ├── AppDelegate.swift           # NSStatusItem + NSPopover + 5min Timer
    ├── UsageAPIClient.swift        # 3 个 API 并发请求
    ├── UsageModels.swift           # 7 个 Codable 模型
    ├── UsageViewModel.swift        # @MainActor ObservableObject
    ├── MenuBarContentView.swift    # SwiftUI 视图集合
    ├── SettingsView.swift          # 语言 + Token 设置
    ├── Localization.swift          # 手写双语字典 (en/zh)
    └── Assets.xcassets/            # App 图标
```

## 关键技术：智谱 Monitor API

### 未公开文档的端点

| 端点 | 用途 | 参数 |
|------|------|------|
| `open.bigmodel.cn/api/monitor/usage/model-usage` | 模型调用 + token 消耗（24h） | startTime, endTime |
| `open.bigmodel.cn/api/monitor/usage/tool-usage` | 工具调用明细（MCP/搜索） | startTime, endTime |
| `open.bigmodel.cn/api/monitor/usage/quota/limit` | 配额上限 + 使用率 + 重置时间 | 无 |

- 认证: `Authorization: Bearer <token>`（智谱 API token）
- 返回: `{ code: number, msg: string, data: T, success: boolean }`
- 配额类型: `TOKENS_LIMIT`（5h 窗口）、`TIME_LIMIT`（1min 窗口，MCP）

### API 数据模型

**ModelUsageData**: x_time[], modelCallCount[], tokensUsage[], totalUsage{ totalModelCallCount, totalTokensUsage }
**ToolUsageData**: x_time[], totalUsage{ totalNetworkSearchCount, totalWebReadMcpCount, totalZreadMcpCount, totalSearchMcpCount, toolDetails[{ modelName, totalUsageCount }] }
**QuotaLimitData**: limits[{ type, unit, number, usage, currentValue, remaining, percentage, nextResetTime(ms), usageDetails[{ modelCode, usage }] }], level

## 架构设计

- **MVVM**: Model → ViewModel(@MainActor) → SwiftUI View
- **并发**: `async let` 并行 3 个 API
- **菜单栏**: NSStatusItem + NSPopover(transient)
- **刷新**: Timer 300s + NotificationCenter 广播 + 手动按钮

## 代码质量

- 可读性好，职责分离清晰
- 缺少重试/离线缓存
- UserDefaults 存储 Token（未加密）
- `anthropicAuthToken` key 名暴露 fork 来源
- Base URL `https://open.bigmodel.cn/api/anthropic` 暴露智谱兼容 Anthropic API

## 有价值发现

1. 智谱 Coding Plan 兼容 Anthropic API 格式
2. TOKENS_LIMIT 是 5 小时滚动窗口（解释了突然限速的原因）
3. MCP 工具分 3 类：WebRead MCP / Search MCP / ZRead MCP
4. 配额 API 返回 nextResetTime（毫秒 timestamp）可直接用于倒计时
5. 这些 API 可集成到 OpenClaw 做用量预警

## 衍生项目

- **zai-tray** (`E:/AI_Project/zai-tray`): Windows 系统托盘版本
  - 技术栈: Tauri v2 + React + TypeScript + Tailwind
  - 参考 zai-usage-menu-bar 的 API 集成和 UI 设计
  - 2026-04-06 启动开发
