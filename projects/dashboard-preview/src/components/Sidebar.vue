<script setup lang="ts">
const navItems = [
  { icon: 'dashboard', label: '概览', active: true },
  { icon: 'analytics', label: '数据分析', active: false },
  { icon: 'users', label: '用户管理', active: false },
  { icon: 'projects', label: '项目', active: false },
  { icon: 'transactions', label: '交易记录', active: false },
]

const navItems2 = [
  { icon: 'settings', label: '系统设置', active: false },
  { icon: 'help', label: '帮助中心', active: false },
]
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">D</div>
      <span>Dashboard</span>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section-label">主菜单</div>
      <div
        v-for="item in navItems"
        :key="item.icon"
        class="nav-item"
        :class="{ active: item.active }"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <!-- Dashboard icon -->
          <template v-if="item.icon === 'dashboard'">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
          </template>
          <!-- Analytics -->
          <template v-else-if="item.icon === 'analytics'">
            <path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 6-8"/>
          </template>
          <!-- Users -->
          <template v-else-if="item.icon === 'users'">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </template>
          <!-- Projects -->
          <template v-else-if="item.icon === 'projects'">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </template>
          <!-- Transactions -->
          <template v-else-if="item.icon === 'transactions'">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </template>
        </svg>
        {{ item.label }}
      </div>

      <div class="nav-section-label" style="margin-top: 8px">系统</div>
      <div
        v-for="item in navItems2"
        :key="item.icon"
        class="nav-item"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <!-- Settings -->
          <template v-if="item.icon === 'settings'">
            <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </template>
          <!-- Help -->
          <template v-else-if="item.icon === 'help'">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
          </template>
        </svg>
        {{ item.label }}
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="user-badge">
        <div class="user-avatar">R</div>
        <div class="user-info">
          <div class="name">Ray</div>
          <div class="role">管理员</div>
        </div>
      </div>
    </div>
  </aside>
</template>
