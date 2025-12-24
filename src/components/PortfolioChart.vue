<template>
  <div class="portfolio-chart" :class="{ dark }">
    <h2>Portfolio History</h2>
    <div v-if="loading" class="loading">Loading history data...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="history && history.length > 0" class="chart-container">
      <svg :viewBox="`0 0 ${width} ${height}`" class="chart">
        <!-- Grid lines -->
        <line v-for="i in 5" :key="`grid-${i}`" :x1="padding" :y1="padding + ((height - 2 * padding) / 4) * (i - 1)"
          :x2="width - padding" :y2="padding + ((height - 2 * padding) / 4) * (i - 1)" class="grid-line"
          stroke-width="1" />

        <!-- Chart line -->
        <polyline :points="chartPoints" fill="none" class="chart-line" stroke-width="3" stroke-linecap="round"
          stroke-linejoin="round" />

        <!-- Data points -->
        <circle v-for="(point, i) in points" :key="`point-${i}`" :cx="point.x" :cy="point.y" r="4" class="data-point">
          <title>{{ history && history[i] ? formatDate(history[i].timestamp) + ': $' + formatNumber(history[i].equity) :
            '' }}</title>
        </circle>

        <!-- Y-axis labels -->
        <text v-for="(label, i) in yAxisLabels" :key="`label-${i}`" :x="padding - 10"
          :y="padding + ((height - 2 * padding) / 4) * i" text-anchor="end" font-size="12" class="axis-label"
          dominant-baseline="middle">
          ${{ formatNumber(label) }}
        </text>
      </svg>

      <!-- Stats -->
      <div class="stats">
        <div class="stat">
          <span class="stat-label">Latest:</span>
          <span class="stat-value">${{ formatNumber(latestEquity) }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Change:</span>
          <span class="stat-value" :class="latestChange >= 0 ? 'positive' : 'negative'">
            {{ latestChange >= 0 ? '+' : '' }}${{ formatNumber(Math.abs(latestChange)) }}
            ({{ latestChangePercent >= 0 ? '+' : '' }}{{ latestChangePercent.toFixed(2) }}%)
          </span>
        </div>
      </div>
    </div>
    <div v-else class="no-data">No history data available</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface HistoryItem {
  timestamp: number;
  equity: number;
  change: number;
  changePercent: number;
}

interface Props {
  history: HistoryItem[] | null;
  loading?: boolean;
  error?: string | null;
  dark?: boolean;
}

const props = defineProps<Props>();

const width = 800;
const height = 400;
const padding = 60;

const points = computed(() => {
  if (!props.history || props.history.length === 0) return [];

  const maxEquity = Math.max(...props.history.map(h => h.equity));
  const minEquity = Math.min(...props.history.map(h => h.equity));
  const equityRange = maxEquity - minEquity || 1;

  return props.history.map((item, index) => {
    const x = padding + (index / (props.history!.length - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - ((item.equity - minEquity) / equityRange) * (height - 2 * padding);
    return { x, y };
  });
});

const chartPoints = computed(() => {
  return points.value.map(p => `${p.x},${p.y}`).join(' ');
});

const yAxisLabels = computed(() => {
  if (!props.history || props.history.length === 0) return [0, 0, 0, 0, 0];

  const maxEquity = Math.max(...props.history.map(h => h.equity));
  const minEquity = Math.min(...props.history.map(h => h.equity));

  return [maxEquity, maxEquity * 0.75 + minEquity * 0.25, (maxEquity + minEquity) / 2, maxEquity * 0.25 + minEquity * 0.75, minEquity];
});

const latestEquity = computed(() => {
  if (!props.history || props.history.length === 0) return 0;
  const latest = props.history[props.history.length - 1];
  return latest?.equity ?? 0;
});

const latestChange = computed(() => {
  if (!props.history || props.history.length === 0) return 0;
  const latest = props.history[props.history.length - 1];
  return latest?.change ?? 0;
});

const latestChangePercent = computed(() => {
  if (!props.history || props.history.length === 0) return 0;
  const latest = props.history[props.history.length - 1];
  return latest?.changePercent ?? 0;
});

function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}
</script>

<style scoped>
.portfolio-chart {
  margin-bottom: 2rem;
}

h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.dark h2 {
  color: #e0e0e0;
}

.loading,
.error,
.no-data {
  padding: 2rem;
  text-align: center;
  border-radius: 8px;
  background: #f5f5f5;
}

.dark .loading,
.dark .no-data {
  background: #2d2d2d;
  color: #aaa;
}

.error {
  background: #fee;
  color: #c33;

}

.dark .error {
  background: #3d1f1f;
  color: #ff6b6b;

}

.chart-container {
  background: white;
  padding: 1.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;

}

.dark .chart-container {
  background: #2d2d2d;
  border-color: #444;

}

.chart {
  width: 100%;
  height: auto;
  max-height: 400px;

}

.grid-line {
  stroke: #e0e0e0;
}

.dark .grid-line {
  stroke: #444;
}

.chart-line {
  stroke: #db7093;
}

.dark .chart-line {
  stroke: #ff6b9d;
}

.data-point {
  cursor: pointer;
  fill: #db7093;
}

.dark .data-point {
  fill: #ff6b9d;
}

.axis-label {
  fill: #666;
}

.dark .axis-label {
  fill: #aaa;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;

}

.dark .stats {
  border-top-color: #555;

}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;

}

.dark .stat-label {
  color: #aaa;

}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;

}

.dark .stat-value {
  color: #e0e0e0;

}

.stat-value.positive {
  color: #27ae60;
}

.stat-value.negative {
  color: #e74c3c;
}
</style>
