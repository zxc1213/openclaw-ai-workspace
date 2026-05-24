<script setup lang="ts">
const activities = [
  { text: '<strong>张伟</strong> 完成了一笔 ¥12,580 的交易', time: '5 分钟前', color: 'var(--success)' },
  { text: '<strong>系统</strong> 完成了月度数据备份', time: '23 分钟前', color: 'var(--info)' },
  { text: '<strong>李娜</strong> 提交了新的退款申请', time: '1 小时前', color: 'var(--warning)' },
  { text: '<strong>王强</strong> 更新了个人信息', time: '2 小时前', color: 'var(--accent)' },
  { text: '<strong>刘洋</strong> 取消了订单 TXN-004', time: '3 小时前', color: 'var(--danger)' },
  { text: '<strong>陈思</strong> 注册了新账户', time: '5 小时前', color: 'var(--success)' },
]
</script>

<template>
  <div class="activity-card">
    <h3>最近活动</h3>
    <div v-for="(act, i) in activities" :key="i" class="activity-item">
      <div class="activity-dot" :style="{ background: act.color }"></div>
      <div>
        <div class="activity-text" v-html="act.text"></div>
        <div class="activity-time">{{ act.time }}</div>
      </div>
    </div>
  </div>
</template>
