# 人物档案

### 2026-03-16
- **Ray**（@rays_0517）：念念的创建者和使用者。Telegram Chat ID: 5246148209（主账号）。37 岁，广州，程序员，夜猫子。偏好中文沟通、简洁干练。给我取名"念念"🌙

### 2026-03-17
- **码农1号（coder agent）**：负责编码任务，擅长 Java/MyBatis/Spring 全栈，可独立完成大规模重构（如 SQL 注入修复涉及 4000+ 行代码变更）

### 2026-03-31
- **设计师（designer agent）**：使用 GLM-4.6V 模型，负责视觉分析和设计任务。image 工具需全局 imageModel 配置为 glm-4.6v（非 agent 级别配置）

### 2026-04-02
- **QQ Bot 联系人**：
  - Ray QQ（nianian Bot）: openid `9F7AE957C5EAAC61DD7020573B820039`
  - 世界（shijie Bot）: 绑定 designer agent，appId `1903747429`
  - 调研员（research Bot）: 绑定 research agent，appId `1903748277`
  - 念念（nianian Bot）: 绑定 main agent，appId `1903739267`

### KCZX 项目相关
- **4 个同源系统**（同一套 science-innovation 代码库的不同部署版本）：
  - 广东华路交通科技有限公司企业科研管理平台（gdhl/kczx_hl_server）
  - 广东省交通集团有限公司科研管理系统（gdcg/science-innovation-parent）
  - 广东省公路建设有限公司科创管理系统（gdgljs/kczx_qy_js_server）
  - 广东省交通科技协同创新信息平台（gdst/kczx_qy_lq_server）
- **安全审计发现**：3 个系统合计 122 个极高 SQL 注入漏洞（MyBatis `${}` 拼接），大量硬编码 API 凭证和密码
