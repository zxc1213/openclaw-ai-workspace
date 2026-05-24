# Vue/JS 安全检查清单

## XSS 防护

- [ ] 不使用 `v-html` 渲染用户输入内容
- [ ] 如必须用 `v-html`，内容经过白名单 HTML 净化（DOMPurify）
- [ ] URL 参数中的用户输入不直接拼接到链接
- [ ] 路由参数不直接渲染到页面

## 敏感信息

- [ ] 前端代码无硬编码密钥、密码、Token
- [ ] API Key 放在环境变量（`.env`），不提交到 Git
- [ ] `.env.local` 在 `.gitignore` 中
- [ ] 生产环境 API 地址不走前端配置

## Token 安全

- [ ] Token 不存储在 `localStorage`（易受 XSS），推荐 `httpOnly Cookie` 或 `sessionStorage`
- [ ] Token 过期有刷新机制（refresh token）
- [ ] 登出时清除 Token

## API 调用安全

- [ ] 所有请求走 HTTPS
- [ ] 敏感操作有二次确认
- [ ] 表单有 CSRF Token（如后端要求）
- [ ] 文件上传限制类型和大小（前端校验 + 后端校验）
- [ ] 下载链接不可预测（防未授权下载）

## 路由与权限

- [ ] 敏感页面有路由守卫（`beforeEach`）
- [ ] 按钮级别权限控制（`v-if="hasPermission('xxx')"`）
- [ ] 未授权访问跳转到 403 页面
- [ ] 不在前端隐藏菜单来实现"权限"（后端必须校验）

## 第三方依赖

- [ ] 定期运行 `npm audit` 检查漏洞
- [ ] 不使用已停止维护的依赖
- [ ] lock 文件提交到版本控制

## 其他

- [ ] 不使用 `eval()` / `new Function()` 执行动态代码
- [ ] iframe 使用 `sandbox` 属性
- [ ] `window.open` 设置 `noopener, noreferrer`
- [ ] 避免在 URL hash 中存储敏感数据
- [ ] WebSocket 连接使用 `wss://` 而非 `ws://`
