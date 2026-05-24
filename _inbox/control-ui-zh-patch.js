/**
 * OpenClaw Control UI 中文翻译补丁
 * MutationObserver 监听 DOM 变化，自动替换硬编码英文为中文
 */
(function () {
  'use strict';

  const M = new Map([
// --- Common ---
['Save','保存'],['Save changes','保存更改'],['Save & Publish','保存并发布'],
['Saving…','保存中…'],['Saving...','保存中…'],['Cancel','取消'],['Delete','删除'],
['Delete after run','运行后删除'],['Refresh','刷新'],['Refresh All','全部刷新'],
['Refreshing…','刷新中…'],['Refreshing...','刷新中…'],['Loading…','加载中…'],
['Loading...','加载中…'],['Enabled','已启用'],['Disabled','已禁用'],
['Enable','启用'],['Disable','禁用'],['Required','必填'],['Optional','可选'],
['Edit','编辑'],['Update','更新'],['Updating…','更新中…'],['Updating...','更新中…'],
['Remove','删除'],['Apply','应用'],['Applying…','应用中…'],['Reset','重置'],
['Copy','复制'],['Copy as markdown','复制为 Markdown'],['Copy failed','复制失败'],
['Copied','已复制'],['Send','发送'],['Run','运行'],['Stop','停止'],
['Stop current run','停止当前运行'],['Stopping current run...','正在停止当前运行...'],
['Read','读取'],['Write','写入'],['Execute','执行'],['Search','搜索'],
['Filter','筛选'],['Sort','排序'],['All','全部'],['None','无'],
['Yes','是'],['No','否'],['Close','关闭'],['Back','返回'],['Next','下一步'],
['Previous','上一步'],['Add','添加'],['Show','显示'],['Hide','隐藏'],
['Pin','固定'],['Pinned','已固定'],['Unpin filters','取消固定筛选'],
['Pin filters','固定筛选'],['Expand All','全部展开'],['Expand all','全部展开'],
['Expand sidebar','展开侧边栏'],['Collapse sidebar','折叠侧边栏'],
['Resize sidebar','调整侧边栏大小'],['Reload','重新加载'],['View','查看'],
['Status','状态'],['Type','类型'],['Name','名称'],['Description','描述'],
['Version','版本'],['Connect','连接'],['Export','导出'],['Import','导入'],
['Retry','重试'],['Abort','中止'],['Resolve','解决'],['Resolved','已解决'],
['Install','安装'],['Installing…','安装中…'],['Installing...','安装中…'],
['Publish','发布'],['Clone','克隆'],['Attach','附加'],
// --- Nav ---
['Agents','代理'],['Sessions','会话'],['Skills','技能'],['Nodes','节点'],
['Channels','频道'],['Instances','实例'],['Overview','概览'],['Settings','设置'],
['Config','配置'],['Usage','使用情况'],['Debug','调试'],['Logs','日志'],
['Cron','定时任务'],['Chat','聊天'],['Control','控制'],
// --- Tab subtitles ---
['Agents, models, skills, tools, memory, session.','代理、模型、技能、工具、记忆和会话。'],
['Status, entry points, health.','状态、入口点、健康。'],
['Active sessions and defaults.','活动会话和默认设置。'],
['Workspaces, tools, identities.','工作区、工具、身份。'],
['Workspace, identity, and model configuration.','工作区、身份和模型配置。'],
['Workspace and scheduling targets.','工作区和调度目标。'],
['Active session keys and per-session overrides.','活动会话密钥和单会话覆盖。'],
['Channels and settings.','频道和设置。'],
['Connected clients and nodes.','已连接客户端和节点。'],
['Paired devices and commands.','配对设备和命令。'],
['Gateway chat for quick interventions.','网关聊天，快速干预。'],
['Edit openclaw.json.','编辑 openclaw.json。'],
['Theme, UI, and setup wizard settings.','主题、界面和设置向导设置。'],
['Scheduled tasks and automation.','定时任务和自动化。'],
['Gateway, web, browser, and media settings.','网关、Web、浏览器和媒体设置。'],
['Snapshots, events, RPC.','快照、事件、RPC。'],
['Live gateway logs.','实时网关日志。'],
['Channel, message, and audio settings.','频道、消息和音频设置。'],
['Commands, hooks, cron, and plugin settings.','命令、钩子、定时任务和插件设置。'],
// --- Overview ---
['Gateway Access','网关访问'],
['Where the dashboard connects and how it authenticates.','仪表板连接的位置及其身份验证方式。'],
['Gateway Token','网关令牌'],['Password (not stored)','密码（不存储）'],
['Default Session Key','默认会话密钥'],['Language','语言'],
['Snapshot','快照'],['Latest gateway handshake information.','最新的网关握手信息。'],
['Uptime','运行时间'],['Tick Interval','刻度间隔'],['Last Channels Refresh','最后频道刷新'],
['Attention','注意事项'],['Event Log','事件日志'],['Gateway Logs','网关日志'],
['Cost','费用'],['Recent Sessions','最近会话'],['New Session','新建会话'],
['Start a new session','开始新会话'],['Starting new session...','正在开始新会话...'],
['Reset current session','重置当前会话'],['Resetting session...','正在重置会话...'],
['Export session to Markdown','导出会话为 Markdown'],['Exporting session...','正在导出会话...'],
['Notes','备注'],['Quick reminders for remote control setups.','远程控制设置的快速提醒。'],
['Session hygiene','会话清理'],['Use /new or sessions.patch to reset context.','使用 /new 或 sessions.patch 重置上下文。'],
['Cron reminders','定时任务提醒'],['Use isolated sessions for recurring runs.','为重复运行使用隔离的会话。'],
// --- Connection ---
['How to connect','如何连接'],['Start the gateway on your host machine:','在主机上启动网关：'],
['Or generate a reusable token:','或生成可重复使用的令牌：'],
['For remote access, Tailscale Serve is recommended.','如需远程访问，建议使用 Tailscale Serve。'],
['Read the docs →','查看文档 →'],
['This gateway requires auth. Add a token or password, then click Connect.','此网关需要身份验证。添加令牌或密码，然后点击连接。'],
['Authentication','身份验证'],
['This device needs pairing approval from the gateway host.','此设备需要网关主机的配对批准。'],
['Reject this device pairing request?','拒绝此设备配对请求？'],
['Logged out.','已登出。'],['Not connected to gateway.','未连接到网关。'],
['Disconnected from gateway.','已断开与网关的连接。'],
// --- Agents ---
['Agent configurations, models and identities','代理配置、模型和身份'],
['Agent configurations, models, and identities','代理配置、模型和身份'],
['No agents configured.','没有配置的代理。'],['No agent data','无代理数据'],
['Top Agents','代理排行'],['Workspace Skills','工作区技能'],
['Built-in Skills','内置技能'],['Extra Skills','额外技能'],
['Other Skills','其他技能'],['Installed Skills','已安装技能'],
['No skills found.','未找到技能。'],['Skills with missing dependencies','缺少依赖的技能'],
['Skill packs and capabilities','技能包和功能'],
['Tool configurations (browser, search, etc.)','工具配置（浏览器、搜索等）'],
['Files','文件'],['Tools','工具'],['Cron Jobs','定时任务'],
['all skills','全部技能'],['Inherit default','继承默认值'],
['Set as default','设为默认'],['Already default','已是默认'],
['Agent','代理'],['Model','模型'],['Models','模型'],['Model Mix','模型混合'],
['Provider','提供商'],['Top Models','模型排行'],['Top Providers','提供商排行'],
['Top Tools','工具排行'],['No model data','无模型数据'],['No provider data','无提供商数据'],
['Model set to','模型已设为'],['Show or set model','显示或设置模型'],
['Default model','默认模型'],['Memory','记忆'],['Bio','简介'],
['Display Name','显示名称'],['A brief bio or description','简短简介或描述'],
['Tell people about yourself...','介绍一下你自己...'],
['Your full display name','你的完整显示名称'],['Username','用户名'],
['Short username (e.g., satoshi)','短用户名（如 satoshi）'],
['Website','网站'],['Your personal website','你的个人网站'],
['NIP-05 Identifier','NIP-05 标识符'],
['Verifiable identifier (e.g., you@domain.com)','可验证标识符（如 you@domain.com）'],
['Lightning Address','闪电地址'],['Lightning address for tips (LUD-16)','用于打赏的闪电地址（LUD-16）'],
['Image understanding','图像理解'],['Voice input','语音输入'],
['Missing','缺少'],['blocked by allowlist','被白名单阻止'],
// --- Sessions ---
['Kind','类型'],['Tokens','令牌数'],['Updated','更新时间'],
['No active session.','无活动会话。'],['Other Sessions','其他会话'],
// --- Channels ---
['No snapshot yet.','暂无快照。'],['Show QR','显示二维码'],
['Working…','处理中…'],['Working...','处理中…'],
['No channel data','无频道数据'],['Top Channels','频道排行'],
['Accounts','账号'],['Failed','失败'],
// --- Instances ---
['Hide hosts and IPs','隐藏主机和 IP'],['Show hosts and IPs','显示主机和 IP'],
['No instances yet.','暂无实例。'],
// --- Debug ---
['No critical issues','无严重问题'],['Toggle debug','切换调试'],
// --- Logs ---
['Log levels and output configuration','日志级别和输出配置'],
// --- Nodes ---
['Allowlist','白名单'],['Allow skill executables listed by the Gateway.','允许网关列出的技能可执行文件。'],
['Always','始终'],['Never','从不'],
['Applied when the UI prompt is unavailable.','当 UI 提示不可用时应用。'],
['Default prompt policy.','默认提示策略。'],['Default security mode.','默认安全模式。'],
['Deny','拒绝'],['Load approvals','加载审批'],['Load config','加载配置'],
['New pattern','新模式'],['On miss','未命中时'],
['Security','安全'],['Ask','询问'],['Approvals','审批'],
// --- Cron ---
['All jobs','所有任务'],['All scheduled jobs stored in the gateway.','网关中存储的所有定时任务。'],
['All statuses','全部状态'],['All delivery','全部投递'],
['Add job','添加任务'],['New Job','新建任务'],['Edit Job','编辑任务'],
['Create a scheduled wakeup or agent run.','创建定时唤醒或代理运行。'],
['Name it, choose the assistant, and set enabled state.','命名、选择助手并设置启用状态。'],
['Name is required.','名称为必填项。'],['Agent message is required.','代理消息为必填。'],
['System text is required.','系统文本为必填。'],
['Cron expression is required.','Cron 表达式为必填。'],
['Enter a valid date/time.','请输入有效的日期/时间。'],
['Interval must be greater than 0.','间隔必须大于 0。'],
['Invalid interval amount.','无效的间隔值。'],['Invalid run time.','无效的运行时间。'],
['Fill the required fields below to enable submit.','填写下方必填项以启用提交。'],
['Basics','基本信息'],['Schedule','调度'],['Execution','执行'],
['Advanced','高级'],['Delivery','投递'],['Agent ID','代理 ID'],
['Start typing to pick a known agent, or enter a custom one.','开始输入以选择已知代理，或输入自定义 ID。'],
['Every','每隔'],['At','指定时间'],['Run at','运行时间'],['Unit','单位'],
['Minutes','分钟'],['Hours','小时'],['Days','天'],['Seconds','秒'],
['Expression','表达式'],['Timezone (optional)','时区（可选）'],
['Pick a common timezone or enter any valid IANA timezone.','选择常用时区或输入有效的 IANA 时区。'],
['Session','会话'],['Main','主会话'],['Isolated','隔离会话'],
['Main posts a system event. Isolated runs a dedicated agent turn.','主会话发布系统事件。隔离会话运行独立的代理轮次。'],
['Wake mode','唤醒模式'],['Now','立即'],['Next heartbeat','下次心跳'],
['Now triggers immediately. Next heartbeat waits for the next cycle.','立即模式立即触发。下次心跳等待下一个周期。'],
['Run assistant task (isolated)','运行助手任务（隔离）'],
['Starts an assistant run in its own session using your prompt.','使用您的提示在独立会话中启动助手运行。'],
['Publish a message to main timeline','发布消息到主时间线'],
['Sends your text to the gateway main timeline (good for reminders/triggers).','将文本发送到网关主时间线（适用于提醒/触发）。'],
['Timeout (seconds)','超时（秒）'],['Optional, e.g. 90','可选，如 90'],
['Result delivery','结果投递'],['Announce summary (default)','发布摘要（默认）'],
['Webhook POST','Webhook POST'],['None (internal only)','无（仅内部）'],
['Announce posts a summary to chat. None keeps execution internal.','发布将摘要发送到聊天。无保持执行仅内部。'],
['Webhook URL','Webhook URL'],['Channel','频道'],
['Select a job to inspect run history.','请选择一个任务以查看运行历史。'],
['Latest runs across all jobs.','所有任务的最新运行记录。'],
['Run history','运行历史'],['History','历史'],['Scope','范围'],
['Selected job','已选任务'],['Search jobs','搜索任务'],['Search runs','搜索运行'],
['Summary, error, or job','摘要、错误或任务'],
['Newest first','最新优先'],['Oldest first','最早优先'],
['Clear','清除'],['Delivered','已投递'],['Not delivered','未投递'],
['Not requested','未请求'],['Unknown','未知'],['Skipped','已跳过'],
['No summary.','无摘要。'],['Last run','上次运行'],['Next run','下次运行'],
['Next wake','下次唤醒'],['No matching jobs.','没有匹配的任务。'],
['No matching runs.','没有匹配的运行记录。'],
['Load more jobs','加载更多任务'],['Load more runs','加载更多运行'],
['Direction','方向'],['Ascending','升序'],['Descending','降序'],
['Recently updated','最近更新'],['Job','任务'],['Jobs','任务列表'],
['Best effort delivery','尽力投递'],
['Do not fail the job if delivery itself fails.','投递失败时不使任务失败。'],
['Best for one-shot reminders that should auto-clean up.','适用于应自动清理的一次性提醒。'],
['Exact timing (no stagger)','精确时间（无抖动）'],
['Run on exact cron boundaries with no spread.','在精确的 cron 边界运行，无分散。'],
['Stagger window','抖动窗口'],['Stagger unit','抖动单位'],
['Control when this job runs.','控制任务运行时间。'],
['Force this job to use the gateway default assistant.','强制此任务使用网关默认助手。'],
['Wakeups and recurring runs.','唤醒和重复运行。'],
// --- Settings ---
['Appearance','外观'],['Theme','主题'],['Dark','深色'],['Light','浅色'],
['Follow OS light or dark','跟随系统明暗'],['Force dark mode','强制深色模式'],
['Force light mode','强制浅色模式'],['Setup Wizard','设置向导'],
['Setup wizard state and history','设置向导状态和历史'],
['User interface preferences','用户界面偏好'],
// --- Infrastructure ---
['Gateway','网关'],
['Gateway server settings (port, auth, binding)','网关服务器设置（端口、认证、绑定）'],
['Web','Web'],['Browser','浏览器'],['Browser automation settings','浏览器自动化设置'],
['Media','媒体'],['Auto-update settings and release channel','自动更新设置和发布渠道'],
['Gateway control','网关控制'],['Gateway metadata and version information','网关元数据和版本信息'],
['Service discovery and networking','服务发现和网络'],
['Plugin management and extensions','插件管理和扩展'],
['Key bindings and shortcuts','快捷键和绑定'],
// --- Automation ---
['Commands','命令'],['Hooks','钩子'],['Plugins','插件'],
['Custom slash commands','自定义斜杠命令'],['Schedule tasks','调度任务'],
// --- Usage ---
['Input','输入'],['Output','输出'],
['Average cost per message when providers report costs.','提供商报告成本时的平均每条消息费用。'],
['Average tokens per message in this range.','此范围内的平均每条消息令牌数。'],
['Base context per message','每条消息的基础上下文'],
['Throughput shows tokens per minute over active time. Higher is better.','吞吐量显示活动时间内每分钟令牌数。越高越好。'],
['Today','今天'],
// --- Sub-agents ---
['Abort sub-agents','中止子代理'],['Manage sub-agents','管理子代理'],
['Spawn sub-agent','生成子代理'],['Steer a sub-agent','引导子代理'],
['No active sub-agent runs to abort.','无活动的子代理运行可中止。'],
['No active sub-agent sessions found.','未找到活动的子代理会话。'],
['End turn to receive sub-agent results','结束回合以接收子代理结果'],
// --- Model ---
['Thinking','思考'],['Toggle fast mode','切换快速模式'],
['Toggle verbose mode','切换详细模式'],['Set thinking level','设置思考级别'],
['Start typing to pick a known model, or enter a custom one.','开始输入以选择已知模型，或输入自定义模型。'],
// --- Voice ---
['Audio','音频'],['Voice and speech settings','语音和语音设置'],
['Audio input/output settings','音频输入/输出设置'],
['Text-to-speech conversion','文本转语音'],['Talk','对话'],
['Stop speaking','停止说话'],['Read aloud','朗读'],
// --- Tools ---
['What can you do?','你能做什么？'],['Read file contents','读取文件内容'],
['Create or overwrite files','创建或覆盖文件'],['Make precise edits','精确编辑'],
['Run shell commands','运行 shell 命令'],['Run shell','运行 Shell'],
['Fetch web content','获取网页内容'],['Search the web','搜索网页'],
['Manage background processes','管理后台进程'],['Semantic search','语义搜索'],
['Run a skill','运行技能'],['Send messages','发送消息'],['Send to session','发送到会话'],
// --- Chat ---
['Messages','消息'],['Messaging','消息'],
['Message handling and routing settings','消息处理和路由设置'],
['Broadcast','广播'],['Broadcast and notification settings','广播和通知设置'],
['Add a message or paste more images...','添加消息或粘贴更多图片...'],
['Toggle assistant thinking/working output','切换助手思考/工作输出'],
['Hide cron sessions','隐藏定时任务会话'],['Show cron sessions','显示定时任务会话'],
['Listening...','监听中...'],['Thinking...','思考中...'],
// --- Config ---
['Environment','环境'],['Environment Variables','环境变量'],
['Environment variables passed to the gateway process','传递给网关进程的环境变量'],
['Hide env values','隐藏环境变量值'],['Reveal env values','显示环境变量值'],
['Hide sensitive values','隐藏敏感值'],['Reveal sensitive values','显示敏感值'],
['Hide password','隐藏密码'],['Show password','显示密码'],
['Hide token','隐藏令牌'],['Show token','显示令牌'],
['Hide value','隐藏值'],['Reveal value','显示值'],
['Port','端口'],['Host','主机'],['Process','进程'],['Runtime','运行时'],
['Token','令牌'],['Key','密钥'],['Health','健康'],['Online','在线'],['Offline','离线'],
['Docs','文档'],['Resources','资源'],['Unsaved changes','未保存的更改'],
['No results','无结果'],['Type a command…','输入命令…'],
['Help me configure a channel','帮我配置频道'],['What should run?','运行什么？'],
['Store:','存储：'],['Installed','已安装'],['connected','已连接'],
['configured','已配置'],['not configured','未配置'],['no accounts','无账号'],
['Profile','个人资料'],['Import from Relays','从中继导入'],['Importing...','导入中...'],
['Profile imported. Review and publish.','资料已导入。请审核并发布。'],
['Profile imported from relays. Review and publish.','资料已从中继导入。请审核并发布。'],
['Profile published to relays.','资料已发布到中继。'],
['Profile publish failed on all relays.','资料发布到所有中继失败。'],
['Profile update failed','资料更新失败'],['Profile import failed','资料导入失败'],
['Session management and persistence','会话管理和持久化'],
['Session status','会话状态'],['Show session status','显示会话状态'],
['Session history','会话历史'],['Show token usage','显示令牌使用量'],
['Updates','更新'],['Update now','立即更新'],['Automation','自动化'],
['Infrastructure','基础设施'],['AI & Agents','AI 与代理'],
['AI model configurations and providers','AI 模型配置和提供商'],
['Terminal','终端'],['Debug Mode','调试模式'],['Logging','日志'],
['Discovery','发现'],['Bindings','绑定'],['Navigation','导航'],
['Metadata','元数据'],['Prompt','提示'],['Assistant','助手'],
['System','系统'],['User','用户'],['You','你'],
// --- Days ---
['Mon','周一'],['Tue','周二'],['Wed','周三'],['Thu','周四'],
['Fri','周五'],['Sat','周六'],['Sun','周日'],
  ]);

  // ========== 翻译逻辑 ==========
  function translateText(text) {
    if (!text || typeof text !== 'string') return text;
    const trimmed = text.trim();
    if (!trimmed) return text;
    return M.get(trimmed) || M.get(trimmed.replace(/\s+$/, '')) || text;
  }

  // 替换元素内所有文本节点
  function translateNode(el) {
    // 已经翻译过标记
    if (el._zhTranslated) return;
    // 跳过 script/style/input/textarea
    const tag = el.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'CODE') return;

    // placeholder 属性
    if (el.hasAttribute && el.hasAttribute('placeholder')) {
      const ph = el.getAttribute('placeholder');
      const t = translateText(ph);
      if (t !== ph) el.setAttribute('placeholder', t);
    }

    // title 属性
    if (el.hasAttribute && el.hasAttribute('title')) {
      const ti = el.getAttribute('title');
      const t = translateText(ti);
      if (t !== ti) el.setAttribute('title', t);
    }

    // aria-label
    if (el.hasAttribute && el.hasAttribute('aria-label')) {
      const al = el.getAttribute('aria-label');
      const t = translateText(al);
      if (t !== al) el.setAttribute('aria-label', t);
    }

    // 子文本节点
    if (el.childNodes) {
      for (let i = 0; i < el.childNodes.length; i++) {
        const node = el.childNodes[i];
        if (node.nodeType === Node.TEXT_NODE) {
          const val = node.nodeValue;
          const t = translateText(val);
          if (t !== val) node.nodeValue = t;
        }
      }
    }
  }

  // 翻译整个子树
  function translateTree(root) {
    // 对 select option 特殊处理
    if (root.tagName === 'OPTION' && root.hasAttribute('label')) {
      const lab = root.getAttribute('label');
      const t = translateText(lab);
      if (t !== lab) root.setAttribute('label', t);
    }
    if (root.tagName === 'OPTION' || root.tagName === 'BUTTON' || root.tagName === 'SPAN' ||
        root.tagName === 'DIV' || root.tagName === 'P' || root.tagName === 'H1' ||
        root.tagName === 'H2' || root.tagName === 'H3' || root.tagName === 'H4' ||
        root.tagName === 'H5' || root.tagName === 'H6' || root.tagName === 'LI' ||
        root.tagName === 'A' || root.tagName === 'LABEL' || root.tagName === 'TD' ||
        root.tagName === 'TH' || root.tagName === 'SUMMARY' || root.tagName === 'DT' ||
        root.tagName === 'DD' || root.tagName === 'FIGCAPTION' || root.tagName === 'CAPTION') {
      translateNode(root);
    }
    if (root.children) {
      for (let i = 0; i < root.children.length; i++) {
        translateTree(root.children[i]);
      }
    }
  }

  // 使用 MutationObserver 监听 DOM 变化
  let pending = false;
  function scheduleTranslate() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      translateTree(document.body);
    });
  }

  // 初始翻译
  function init() {
    // 等待 body 就绪
    if (!document.body) {
      setTimeout(init, 50);
      return;
    }
    // 初始翻译
    translateTree(document.body);
    // 监听 DOM 变化
    const observer = new MutationObserver((mutations) => {
      let shouldTranslate = false;
      for (const m of mutations) {
        if (m.type === 'childList' && m.addedNodes.length > 0) {
          shouldTranslate = true;
          break;
        }
        if (m.type === 'attributes') {
          shouldTranslate = true;
          break;
        }
      }
      if (shouldTranslate) scheduleTranslate();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['placeholder', 'title', 'aria-label', 'label']
    });
    // 每隔几秒也做一次全量翻译兜底（处理 Lit 重渲染）
    setInterval(() => scheduleTranslate(), 3000);
  }

  // DOMContentLoaded 或立即执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
