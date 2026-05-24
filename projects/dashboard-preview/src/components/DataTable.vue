<script setup lang="ts">
const transactions = [
  { id: 'TXN-001', user: '张伟', amount: '¥12,580', status: 'active', statusText: '已完成', date: '2026-04-10' },
  { id: 'TXN-002', user: '李娜', amount: '¥8,340', status: 'pending', statusText: '处理中', date: '2026-04-10' },
  { id: 'TXN-003', user: '王强', amount: '¥23,100', status: 'active', statusText: '已完成', date: '2026-04-09' },
  { id: 'TXN-004', user: '刘洋', amount: '¥5,920', status: 'inactive', statusText: '已取消', date: '2026-04-09' },
  { id: 'TXN-005', user: '陈思', amount: '¥15,670', status: 'active', statusText: '已完成', date: '2026-04-08' },
]
</script>

<template>
  <div class="data-table">
    <div class="data-table-header">
      <h3>最近交易</h3>
      <input class="table-search" type="text" placeholder="搜索交易..." />
    </div>
    <table>
      <thead>
        <tr>
          <th>交易 ID</th>
          <th>用户</th>
          <th>金额</th>
          <th>状态</th>
          <th>日期</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tx in transactions" :key="tx.id">
          <td style="color: var(--text-primary); font-weight: 500;">{{ tx.id }}</td>
          <td>{{ tx.user }}</td>
          <td style="color: var(--text-primary); font-weight: 500;">{{ tx.amount }}</td>
          <td>
            <span class="status-badge" :class="tx.status">
              <span class="status-dot"></span>
              {{ tx.statusText }}
            </span>
          </td>
          <td>{{ tx.date }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
