<script setup lang="ts">
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <h1>概览</h1>
      <div class="breadcrumb">
        <span>Dashboard</span>
        <span class="sep">/</span>
        <span style="color: var(--text-secondary)">概览</span>
      </div>
    </div>
    <div class="topbar-right">
      <button class="topbar-btn" title="搜索">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      </button>
      <button class="topbar-btn" title="通知">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span class="badge"></span>
      </button>
      <button class="topbar-btn" title="设置">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
      </button>
    </div>
  </header>
</template>
