<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  BarController,
  DoughnutController,
} from 'chart.js'

Chart.register(
  LineController, LineElement, PointElement, LinearScale, CategoryScale,
  Filler, Tooltip, Legend, ArcElement, BarElement, BarController, DoughnutController,
)

const lineCanvas = ref<HTMLCanvasElement | null>(null)
const doughnutCanvas = ref<HTMLCanvasElement | null>(null)
let lineChart: Chart | null = null
let doughnutChart: Chart | null = null

const activeTab = ref('week')

const weekLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const monthLabels = Array.from({ length: 30 }, (_, i) => `${i + 1}日`)
const yearLabels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

const weekData = [32, 45, 38, 52, 48, 60, 55]
const monthData = [28, 35, 42, 38, 50, 45, 55, 60, 52, 48, 65, 58, 70, 62, 75, 68, 72, 80, 78, 85, 82, 90, 88, 95, 92, 98, 105, 100, 110, 108]
const yearData = [320, 450, 380, 520, 480, 600, 550, 620, 580, 700, 650, 720]

function getLabels() {
  if (activeTab.value === 'week') return weekLabels
  if (activeTab.value === 'month') return monthLabels
  return yearLabels
}

function getData() {
  if (activeTab.value === 'week') return weekData
  if (activeTab.value === 'month') return monthData
  return yearData
}

function buildLineChart() {
  if (!lineCanvas.value) return
  if (lineChart) lineChart.destroy()

  const ctx = lineCanvas.value.getContext('2d')
  if (!ctx) return

  const gradient = ctx.createLinearGradient(0, 0, 0, 260)
  gradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)')
  gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)')

  const gradient2 = ctx.createLinearGradient(0, 0, 0, 260)
  gradient2.addColorStop(0, 'rgba(6, 182, 212, 0.15)')
  gradient2.addColorStop(1, 'rgba(6, 182, 212, 0.0)')

  const data = getData()
  const data2 = data.map(v => Math.round(v * (0.6 + Math.random() * 0.3)))

  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: getLabels(),
      datasets: [
        {
          label: '收入',
          data,
          borderColor: '#10b981',
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#10b981',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
        },
        {
          label: '支出',
          data: data2,
          borderColor: '#06b6d4',
          backgroundColor: gradient2,
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#06b6d4',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            color: '#8a9b90',
            font: { size: 12 },
            boxWidth: 12,
            boxHeight: 2,
            usePointStyle: false,
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: '#1a2922',
          titleColor: '#e8ede9',
          bodyColor: '#8a9b90',
          borderColor: 'rgba(16, 185, 129, 0.2)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          titleFont: { size: 13, weight: 600 },
          bodyFont: { size: 12 },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#5a6b60', font: { size: 11 } },
          border: { display: false },
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#5a6b60', font: { size: 11 } },
          border: { display: false },
        },
      },
    },
  })
}

function buildDoughnutChart() {
  if (!doughnutCanvas.value) return
  if (doughnutChart) doughnutChart.destroy()

  const ctx = doughnutCanvas.value.getContext('2d')
  if (!ctx) return

  doughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['直接访问', '搜索引擎', '社交媒体', '邮件推广', '其他'],
      datasets: [{
        data: [35, 28, 18, 12, 7],
        backgroundColor: [
          '#10b981',
          '#06b6d4',
          '#f59e0b',
          '#8b5cf6',
          '#6b7280',
        ],
        borderColor: '#151f1a',
        borderWidth: 3,
        hoverBorderColor: '#151f1a',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#8a9b90',
            font: { size: 12 },
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 8,
          },
        },
        tooltip: {
          backgroundColor: '#1a2922',
          titleColor: '#e8ede9',
          bodyColor: '#8a9b90',
          borderColor: 'rgba(16, 185, 129, 0.2)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`,
          },
        },
      },
    },
  })
}

function switchTab(tab: string) {
  activeTab.value = tab
  buildLineChart()
}

onMounted(() => {
  buildLineChart()
  buildDoughnutChart()
})

onUnmounted(() => {
  lineChart?.destroy()
  doughnutChart?.destroy()
})
</script>

<template>
  <div class="charts-grid">
    <div class="chart-card">
      <div class="chart-card-header">
        <h3>收入趋势</h3>
        <div class="chart-tabs">
          <button
            v-for="tab in ([
              { key: 'week', label: '本周' },
              { key: 'month', label: '本月' },
              { key: 'year', label: '全年' },
            ] as const)"
            :key="tab.key"
            class="chart-tab"
            :class="{ active: activeTab === tab.key }"
            @click="switchTab(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
      <div class="chart-wrapper">
        <canvas ref="lineCanvas"></canvas>
      </div>
    </div>

    <div class="chart-card">
      <div class="chart-card-header">
        <h3>流量来源</h3>
      </div>
      <div class="chart-wrapper">
        <canvas ref="doughnutCanvas"></canvas>
      </div>
    </div>
  </div>
</template>
