# OpenCLI 掘金适配器

为 [OpenCLI](https://github.com/jackwener/opencli) 编写的掘金（juejin.cn）网站适配器，基于 YAML 声明式 pipeline 实现。

## 功能

| 命令 | 文件 | 描述 |
|------|------|------|
| `juejin hot` | `hot.yaml` | 掘金推荐文章列表 |
| `juejin latest` | `latest.yaml` | 掘金最新文章列表 |
| `juejin article <id>` | `article.yaml` | 文章详情（标题、作者、标签、统计、内容预览） |
| `juejin user <user_id>` | `user.yaml` | 指定用户发表的文章列表 |

## 使用方法

### 安装

将 `clis/juejin/` 目录下的所有 `.yaml` 文件复制到 OpenCLI 的插件目录：

```bash
# 方式一：复制到全局 clis 目录
cp *.yaml ~/.opencli/clis/juejin/

# 方式二：创建为插件
mkdir -p ~/.opencli/plugins/juejin/clis/juejin/
cp *.yaml ~/.opencli/plugins/juejin/clis/juejin/
# 创建插件配置
echo '{"name":"juejin","version":"1.0.0","opencli":">=1.6.0"}' > ~/.opencli/plugins/juejin/opencli-plugin.json
```

### 命令示例

```bash
# 推荐文章（默认 20 条）
opencli juejin hot

# 推荐文章（限制 10 条）
opencli juejin hot --limit 10

# 最新文章
opencli juejin latest

# 文章详情
opencli juejin article 7584110439933100078

# 用户文章
opencli juejin user 2444938365386621
```

## 技术说明

### 实现方式

全部使用 YAML 声明式 pipeline，采用 `navigate` + `evaluate` 模式：

1. **先 navigate 到 juejin.cn** — 获取浏览器上下文（Cookie、会话状态）
2. **在 evaluate 中调用掘金 API** — 利用浏览器 `fetch()` 发送 POST 请求，自动携带 Cookie
3. **map + limit** — 数据转换和截断

### 为什么不用 `fetch` 步骤？

OpenCLI 的 `fetch` pipeline 步骤仅支持 GET 请求（通过 `params` 传递查询参数），不支持 POST 请求体（`body`）。掘金的推荐 API 和用户文章 API 均为 POST 接口，因此需要通过 `evaluate` 在浏览器环境中直接调用。

### API 端点

| 命令 | API | 方法 |
|------|-----|------|
| hot | `api.juejin.cn/recommend_api/v1/article/recommend_all_feed` | POST |
| latest | 同上（sort_type=300） | POST |
| article | 页面 SSR（`__NUXT__` 数据） | DOM 解析 |
| user | `api.juejin.cn/content_api/v1/article/query_list` | POST |

### 反爬机制

掘金的反爬策略较轻：

1. **推荐/最新/用户文章 API**：纯 POST 接口，无需特殊签名，直接返回 JSON。`browser: false` 模式理论上可行，但为了获取 Cookie 上下文（个性化推荐），仍然 navigate 到主站。
2. **文章详情**：通过 SSR 渲染（`window.__NUXT__`），页面内容可直接从 DOM 提取，无需额外 API。
3. **搜索 API**：需要登录态 Cookie 才能返回结果，暂未实现搜索命令。

## 参考

- [OpenCLI 适配器系统分析](../opencli-adapter-system.md)
- [OpenCLI GitHub](https://github.com/jackwener/opencli)
