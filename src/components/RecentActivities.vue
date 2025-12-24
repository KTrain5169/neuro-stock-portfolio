<template>
  <div class="recent-activities" :class="{ dark }">
    <h2>Recent Trading Activity</h2>
    <div v-if="loading" class="loading">Loading activities...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="activitiesArray && activitiesArray.length > 0" class="activities-container">
      <div class="activities-list">
        <div v-for="(activity, index) in activitiesArray" :key="index" class="activity-item" :class="activity.side">
          <div class="activity-header">
            <span class="symbol">{{ activity.symbol }}</span>
            <span class="side" :class="activity.side">{{ activity.side.toUpperCase() }}</span>
            <span class="time">{{ formatTime(activity.transaction_time) }}</span>
          </div>
          <div class="activity-details">
            <div class="detail">
              <span class="label">Quantity:</span>
              <span class="value">{{ activity.qty }}</span>
            </div>
            <div class="detail">
              <span class="label">Price:</span>
              <span class="value">${{ formatNumber(activity.price) }}</span>
            </div>
            <div class="detail">
              <span class="label">Total:</span>
              <span class="value">${{ formatNumber(parseFloat(activity.qty) * parseFloat(activity.price)) }}</span>
            </div>
            <div class="detail">
              <span class="label">Status:</span>
              <span class="value status">{{ activity.order_status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-data">No recent activity</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Activity {
  activity_type: string;
  transaction_time: string;
  type: string;
  price: string;
  qty: string;
  side: string;
  symbol: string;
  leaves_qty: string;
  cum_qty: string;
  order_status: string;
}

interface Props {
  activities: Record<string, Activity[]> | null;
  loading?: boolean;
  error?: string | null;
  dark?: boolean;
}

const props = defineProps<Props>();

const activitiesArray = computed(() => {
  if (!props.activities) return [];

  const allActivities: Activity[] = [];
  for (const key in props.activities) {
    const activities = props.activities[key];
    if (activities && Array.isArray(activities)) {
      allActivities.push(...activities);
    }
  }

  // Sort by transaction time, most recent first
  return allActivities.sort((a, b) =>
    new Date(b.transaction_time).getTime() - new Date(a.transaction_time).getTime()
  ).slice(0, 10); // Show last 10 activities
});

function formatNumber(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
</script>

<style scoped>
.recent-activities {
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
  border-radius: 4px;
  background: #f5f5f5;
}

.dark .loading,
.dark .no-data {
  background: #2d2d2d;
  color: #aaa;
}

.error {
  background: #ffe0e0;
  color: #8b0000;
}

.dark .error {
  background: #3d1f1f;
  color: #ff6b6b;
}

.activities-container {
  background: white;
  border-radius: 4px;
  border: 1px solid #ddd;
  overflow: hidden;
}

.dark .activities-container {
  background: #2d2d2d;
  border-color: #444;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.activity-item {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.dark .activity-item {
  border-bottom-color: #3d3d3d;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item.buy {
  border-left: 4px solid #228b22;
}

.activity-item.sell {
  border-left: 4px solid #8b0000;
}

.activity-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.symbol {
  font-size: 1.125rem;
  font-weight: 700;
  color: #db7093;
}

.dark .symbol {
  color: #ff6b9d;
}

.side {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.side.buy {
  background: #e8f5e9;
  color: #228b22;
}

.side.sell {
  background: #ffe0e0;
  color: #8b0000;
}

.time {
  margin-left: auto;
  font-size: 0.875rem;
  color: #666;
}

.dark .time {
  color: #aaa;
}

.activity-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.detail {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dark .label {
  color: #aaa;
}

.value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
}

.dark .value {
  color: #e0e0e0;
}

.value.status {
  color: #228b22;
  text-transform: capitalize;
}

@media (max-width: 768px) {
  .activity-header {
    flex-wrap: wrap;
  }

  .time {
    margin-left: 0;
    width: 100%;
  }

  .activity-details {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
