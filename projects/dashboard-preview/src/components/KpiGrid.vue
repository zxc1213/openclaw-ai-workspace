<script setup lang="ts">
const kpis = [
  {
    label: '总收入',
    value: '¥284,532',
    change: '+12.5%',
    direction: 'up' as const,
    period: '较上月',
    iconClass: 'green',
    iconPath: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  },
  {
    label: '活跃用户',
    value: '18,429',
    change: '+8.2%',
    direction: 'up' as const,
    period: '较上月',
    iconClass: 'blue',
    iconPath: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  },
  {
    label: '订单数',
    value: '3,842',
    change: '-2.1%',
    direction: 'down' as const,
    period: '较上月',
    iconClass: 'yellow',
    iconPath: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0',
  },
  {
    label: '转化率',
    value: '4.28%',
    change: '+0.6%',
    direction: 'up' as const,
    period: '较上月',
    iconClass: 'green',
    iconPath: 'M22 12h-4l-3 9L9 3l-3 9H2',
  },
]
</script>

<template>
  <div class="kpi-grid">
    <div v-for="kpi in kpis" :key="kpi.label" class="kpi-card">
      <div class="kpi-header">
        <span class="kpi-label">{{ kpi.label }}</span>
        <div class="kpi-icon" :class="kpi.iconClass">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path :d="kpi.iconPath" />
          </svg>
        </div>
      </div>
      <div class="kpi-value">{{ kpi.value }}</div>
      <div class="kpi-change" :class="kpi.direction">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path v-if="kpi.direction === 'up'" d="M12 19V5M5 12l7-7 7 7"/>
          <path v-else d="M12 5v14M19 12l-7 7-7-7"/>
        </svg>
        {{ kpi.change }}
        <span class="period">{{ kpi.period }}</span>
      </div>
    </div>
  </div>
</template>
