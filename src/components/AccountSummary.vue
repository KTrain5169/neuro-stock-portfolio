<template>
  <div class="account-summary" :class="{ dark }">
    <h2>Account Summary</h2>
    <div v-if="loading" class="loading">Loading account data...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="account" class="summary-grid">
      <div class="summary-card">
        <div class="label">Portfolio Value</div>
        <div class="value primary">${{ formatNumber(account.portfolioValue) }}</div>
      </div>
      <div class="summary-card">
        <div class="label">Equity</div>
        <div class="value">${{ formatNumber(account.equity) }}</div>
      </div>
      <div class="summary-card">
        <div class="label">Cash</div>
        <div class="value">${{ formatNumber(account.cash) }}</div>
      </div>
      <div class="summary-card">
        <div class="label">Original Investment</div>
        <div class="value">${{ formatNumber(account.originalInvestment) }}</div>
      </div>
      <div class="summary-card gain-loss">
        <div class="label">Total Gain/Loss</div>
        <div class="value" :class="gainLossClass">
          ${{ formatNumber(Math.abs(totalGainLoss)) }}
          <span class="percentage">({{ gainLossPercentage }}%)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Account {
  cash: string;
  equity: string;
  portfolioValue: string;
  originalInvestment: number;
}

interface Props {
  account: Account | null;
  loading?: boolean;
  error?: string | null;
  dark?: boolean;
}

const props = defineProps<Props>();

const totalGainLoss = computed(() => {
  if (!props.account) return 0;
  return parseFloat(props.account.portfolioValue) - props.account.originalInvestment;
});

const gainLossPercentage = computed(() => {
  if (!props.account) return '0.00';
  const percentage = (totalGainLoss.value / props.account.originalInvestment) * 100;
  return percentage.toFixed(2);
});

const gainLossClass = computed(() => {
  return totalGainLoss.value >= 0 ? 'positive' : 'negative';
});

function formatNumber(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
</script>

<style scoped>
.account-summary {
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
.error {
  padding: 2rem;
  text-align: center;
  border-radius: 4px;
  background: #f5f5f5;
}

.dark .loading {
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

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-card {
  background: white;
  padding: 1.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.dark .summary-card {
  background: #2d2d2d;
  border-color: #444;
}

.summary-card.gain-loss {
  grid-column: 1 / -1;
}

.label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dark .label {
  color: #aaa;
}

.value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
}

.dark .value {
  color: #e0e0e0;
}

.value.primary {
  color: #db7093;
  font-size: 2rem;
}

.dark .value.primary {
  color: #ff6b9d;
}

.value.positive {
  color: #27ae60;
}

.value.negative {
  color: #e74c3c;
}

.percentage {
  font-size: 1.25rem;
  margin-left: 0.5rem;
}
</style>
