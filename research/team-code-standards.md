# 团队代码规范化方案

> 目标：解决 IDEA (Java) + Trae (Vue) 多人协作下的代码风格不一致问题
> 日期：2026-04-09

---

## 问题分析

多人协作中，常见的风格不一致问题：
1. **缩进风格**：有人用 Tab，有人用 Space，尺寸也不同
2. **文件编码**：UTF-8 vs GBK
3. **换行符**：CRLF vs LF
4. **Java 格式**：大括号位置、import 顺序、行宽、空行
5. **Vue/JS 格式**：引号风格、分号、尾逗号、缩进
6. **命名规范**：类名/变量名/文件名不统一
7. **Git 提交**：提交信息随意、未格式化的代码被提交

## 解决方案（四层防线）

### 第一层：`.editorconfig` — 基础统一（所有编辑器通用）

放在项目根目录，IDEA/Trae/VSCode 都原生支持，零配置生效。

```editorconfig
# https://editorconfig.org
root = true

# 全局默认
[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 4

# Java
[*.java]
indent_size = 4

# Vue / JS / TS / JSON
[*.{vue,js,ts,jsx,tsx,json,css,scss,less}]
indent_size = 2

# XML / YAML
[*.{xml,yml,yaml}]
indent_size = 2

# Maven POM
[pom.xml]
indent_size = 4

# Markdown
[*.md]
trim_trailing_whitespace = false

# properties
[*.properties]
charset = utf-8
```

### 第二层：IDEA 代码格式化 — Java 后端

#### 2.1 导出团队格式化配置

**操作步骤**：
1. IDEA → Settings → Editor → Code Style → Java
2. 配置好团队的格式化规则（缩进4空格、大括号同行、import顺序等）
3. 点击 Scheme → Export → 保存为 `intellij-java-style.xml`
4. 把文件提交到项目根目录（或放在 docs/ 目录）

**团队成员导入**：
1. IDEA → Settings → Editor → Code Style → Java
2. Scheme → Import → 选择项目里的 `intellij-java-style.xml`

#### 2.2 也可以直接用 Google Java Style（推荐起步方案）

下载 [intellij-java-google-style.xml](https://github.com/google/styleguide/blob/gh-pages/intellij-java-google-style.xml) 放到项目根目录，团队成员导入即可。

#### 2.3 IDEA Save Actions 插件（自动格式化）

安装 **Save Actions** 插件，保存时自动：
- 格式化代码
- 优化 import
- 移除未使用的 import

Settings → Tools → Save Actions：
- ✅ Activate save actions on save
- ✅ Format code
- ✅ Optimize imports

**注意**：Save Actions 是本地 IDE 配置，无法通过项目共享。建议团队约定统一安装。

#### 2.4 Eclipse Code Formatter 插件（可选）

如果团队有人用 Eclipse，可以安装 **Eclipse Code Formatter** 插件统一格式化配置文件。

### 第三层：前端代码格式化 — Vue 前端 (Trae)

#### 3.1 Prettier（主力格式化工具）

项目根目录安装：

```bash
npm install --save-dev --save-exact prettier
```

配置 `.prettierrc`：

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "vueIndentScriptAndStyle": false
}
```

配置 `.prettierignore`：

```
node_modules
dist
build
public
*.min.js
*.min.css
```

#### 3.2 ESLint + Prettier（代码质量检查）

```bash
# Vue2 项目
npm install --save-dev eslint eslint-plugin-vue eslint-config-prettier @vue/eslint-config-prettier

# Vue3 项目  
npm install --save-dev eslint eslint-plugin-vue eslint-config-prettier @vue/eslint-config-prettier
```

配置 `.eslintrc.js`（Vue3 示例）：

```js
module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
}
```

#### 3.3 Trae 配置

Trae 基于 VSCode，配置 workspace `.vscode/settings.json`：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "files.eol": "\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true
}
```

这样团队成员 clone 项目后，Trae 自动使用项目级别的配置，无需手动设置。

### 第四层：Git 提交时强制检查

#### 4.1 Java 项目 — Maven Checkstyle + Spotless

**方案 A：Spotless（推荐，更现代）**

`pom.xml` 中添加：

```xml
<build>
  <plugins>
    <plugin>
      <groupId>com.diffplug.spotless</groupId>
      <artifactId>spotless-maven-plugin</artifactId>
      <version>2.44.0</version>
      <configuration>
        <java>
          <!-- 使用 Google Java Style 或导入团队自己的 -->
          <googleJavaFormat>
            <style>GOOGLE</style>
          </googleJavaFormat>
          <!-- 或使用 Eclipse 格式化配置 -->
          <!-- <eclipse>
            <file>${project.basedir}/eclipse-formatter.xml</file>
          </eclipse> -->
          <removeUnusedImports />
          <trimTrailingWhitespace />
          <endWithNewline />
        </java>
      </configuration>
      <executions>
        <execution>
          <goals>
            <goal>check</goal>
          </goals>
          <phase>validate</phase>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
```

运行检查：`mvn spotless:check`  
自动修复：`mvn spotless:apply`

**方案 B：Checkstyle（传统方案）**

`pom.xml` 中添加：

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-checkstyle-plugin</artifactId>
      <version>3.6.0</version>
      <configuration>
        <configLocation>checkstyle.xml</configLocation>
        <encoding>UTF-8</encoding>
        <consoleOutput>true</consoleOutput>
        <failsOnError>true</failsOnError>
      </configuration>
      <executions>
        <execution>
          <id>validate</id>
          <phase>validate</phase>
          <goals>
            <goal>check</goal>
          </goals>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
```

#### 4.2 前端项目 — Husky + lint-staged

```bash
npm install --save-dev husky lint-staged
npx husky init
```

`package.json` 添加配置：

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,scss,less,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

`.husky/pre-commit`：

```bash
npx lint-staged
```

效果：每次 `git commit` 前自动格式化暂存区的文件，格式不对直接拒绝提交。

#### 4.3 Commit Message 规范（可选）

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

`commitlint.config.js`：

```js
module.exports = {
  extends: ['@commitlint/config-conventional']
}
```

强制提交信息格式：`type(scope): description`
- feat: 新功能
- fix: 修复 bug
- docs: 文档
- style: 格式（不影响逻辑）
- refactor: 重构
- test: 测试
- chore: 构建/工具

---

## 文件名规范

在 `.editorconfig` 基础上，建议在团队文档中约定：

| 类型 | 规范 | 示例 |
|------|------|------|
| Java 类 | 大驼峰 | `UserController.java` |
| Vue 组件 | 大驼峰 | `UserProfile.vue` |
| JS/TS 文件 | 小驼峰 | `formatUtils.js` |
| CSS/SCSS | 小驼峰 | `globalStyles.scss` |
| 工具类 | 大驼峰 + Utils/Helper | `DateUtils.java` |

---

## 落地步骤（推荐顺序）

1. **第一步**：所有项目根目录添加 `.editorconfig`（立即生效，零成本）
2. **第二步**：Java 项目添加 IDEA 格式化配置文件 + Spotless Maven 插件
3. **第三步**：前端项目添加 Prettier + ESLint + `.vscode/settings.json`
4. **第四步**：前后端都添加 Git hooks（Husky / Maven validate phase）
5. **第五步**：团队开会宣讲，统一安装必要插件

---

## 需要提交到版本控制的项目文件清单

```
项目根目录/
├── .editorconfig                    # 所有项目通用
├── .prettierrc                      # 前端项目
├── .prettierignore                  # 前端项目
├── .eslintrc.js                     # 前端项目
├── .vscode/settings.json            # 前端项目（Trae 自动识别）
├── .husky/                          # Git hooks
│   ├── pre-commit
│   └── commit-msg
├── checkstyle.xml                   # Java 项目（可选）
├── intellij-java-style.xml          # Java 项目（IDEA 格式化配置）
└── docs/coding-standards.md         # 团队编码规范文档
```
