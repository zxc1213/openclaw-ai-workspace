<script setup lang="ts">
import Sidebar from './components/Sidebar.vue'
import Topbar from './components/Topbar.vue'
import KpiGrid from './components/KpiGrid.vue'
import ChartsGrid from './components/ChartsGrid.vue'
import DataTable from './components/DataTable.vue'
import ActivityFeed from './components/ActivityFeed.vue'
</script>

<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main-content">
      <Topbar />
      <div class="page-content">
        <KpiGrid />
        <ChartsGrid />
        <div class="bottom-grid">
          <DataTable />
          <ActivityFeed />
        </div>
      </div>
    </div>
  </div>
</template>
