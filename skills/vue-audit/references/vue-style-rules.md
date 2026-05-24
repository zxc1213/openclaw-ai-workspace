# Vue/JS 代码风格规则（团队标准）

## 格式

| 规则 | 标准 |
|------|------|
| 缩进 | 2 空格，禁止 Tab |
| 引号 | 单引号 `'` |
| 分号 | 不使用 |
| 尾逗号 | ES5 风格（对象、数组末尾加逗号） |
| 行宽 | 100 字符 |
| 文件编码 | UTF-8 |
| 换行符 | LF |
| 文件末尾 | 必须有空行 |
| 行尾空格 | 禁止 |

## 命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | 大驼峰 | `UserProfile.vue` |
| JS/TS 文件 | 小驼峰 | `useAuth.js` |
| CSS/SCSS 文件 | kebab-case | `user-profile.scss` |
| 目录名 | kebab-case | `user-management/` |
| 组件 name | 大驼峰，多词 | `UserProfile` |
| props | camelCase 声明 | `userName` |
| events | camelCase | `@update:user` |
| CSS 类名 | kebab-case | `.user-profile` |
| CSS 变量 | kebab-case | `--primary-color` |
| 常量 | 全大写下划线 | `MAX_PAGE_SIZE` |
| 私有方法 | 下划线前缀 | `_handleClick` |
| store 模块 | kebab-case | `user-module` |

## 模板规范

- 属性顺序: `v-if` → `v-for` → `v-model` → `@event` → `:prop` → `class/style`
- 指令缩写一致性: `@click` 或 `v-on:click`，项目中保持统一（推荐缩写形式）
- `v-for` 必须配 `:key`，优先使用唯一 ID 而非 index
- `v-if` 和 `v-for` 不同时用在一个元素上
- 模板中避免复杂表达式，提取到 computed
- 插值 `{{ }}` 简单表达式，复杂逻辑用计算属性或方法

## Script 规范

- 组件选项顺序（Vue2 Options API）:
  1. `name`
  2. `components`
  3. `props`
  4. `emits`
  5. `data`
  6. `computed`
  7. `watch`
  8. `created` → `mounted` → `updated` → `destroyed`
  9. `methods`

- 组合式函数顺序（Vue3 Composition API）:
  1. `ref` / `reactive` 定义
  2. `computed`
  3. `watch` / `watchEffect`
  4. 生命周期 hooks
  5. 方法函数
  6. `return`（Options API 混用时）

- `async/await` 优于 `.then()`
- 解构赋值提高可读性
- 箭头函数用于回调，命名函数用于组件方法

## Style 规范

- 组件样式使用 `scoped`
- CSS 类名使用 BEM 命名（`.block__element--modifier`）
- 避免深层嵌套选择器（不超过 3 层）
- 颜色/尺寸使用 CSS 变量或 SCSS 变量
- 避免使用 `!important`（除非覆盖第三方样式）

## 代码示例

```vue
<!-- ✅ 正确 -->
<template>
  <div class="user-profile">
    <h1>{{ user.name }}</h1>
    <button v-if="canEdit" @click="handleEdit">
      编辑
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  userId: {
    type: Number,
    required: true,
  },
})

const userStore = useUserStore()
const user = computed(() => userStore.getUserById(props.userId))
const canEdit = computed(() => user.value?.role === 'admin')

const handleEdit = () => {
  // ...
}
</script>

<style scoped>
.user-profile {
  padding: 16px;
}
</style>
```

```vue
<!-- ❌ 错误 -->
<template>
  <div class="UserProfile">
    <h1 v-if="show">{{user.name}}</h1>  <!-- 缺少空格，class 非小写 -->
    <button @click="handleEdit()" v-show="canEdit">  <!-- v-show/v-if 语义错误位置 -->
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: true, // 命名不明确
    }
  },
  methods: {
    handleEdit: function() { // 不用箭头函数写法不够简洁
      // ...
    }.bind(this) // 不必要的 bind
  }
}
</script>
```
