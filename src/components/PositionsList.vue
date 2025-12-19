<template>
  <div class="positions-list">
    <h2>Current Positions</h2>
    <div v-if="loading" class="loading">Loading positions...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="positions && positions.length > 0" class="positions-container">
      <div class="positions-table">
        <div class="table-header">
          <div class="col-symbol">Symbol</div>
          <div class="col-qty">Quantity</div>
          <div class="col-price">Price</div>
          <div class="col-value">Value</div>
          <div class="col-change">Change</div>
        </div>
        <div
          v-for="(position, index) in positions"
          :key="index"
          class="position-row"
        >
          <div class="col-symbol">
            <strong>{{ position.symbol || 'N/A' }}</strong>
          </div>
          <div class="col-qty">{{ position.qty || 0 }}</div>
          <div class="col-price">${{ formatNumber(position.price || 0) }}</div>
          <div class="col-value">${{ formatNumber(position.value || 0) }}</div>
          <div class="col-change" :class="getChangeClass(position.change)">
            {{ formatChange(position.change || 0) }}
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-data">No positions available</div>
  </div>
</template>

<script setup lang="ts">
interface Position {
  symbol?: string;
  qty?: number;
  price?: number;
  value?: number;
  change?: number;
  changePercent?: number;
  [key: string]: any;
}

interface Props {
  positions: Position[] | null;
  loading?: boolean;
  error?: string | null;
}

defineProps<Props>();

function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatChange(change: number): string {
  const prefix = change >= 0 ? '+' : '';
  return `${prefix}$${formatNumber(Math.abs(change))}`;
}

function getChangeClass(change?: number): string {
  if (!change) return '';
  return change >= 0 ? 'positive' : 'negative';
}
</script>

<style scoped>
.positions-list {
  margin-bottom: 2rem;
}

h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.loading,
.error,
.no-data {
  padding: 2rem;
  text-align: center;
  border-radius: 4px;
  background: #f5f5f5;
}

.error {
  background: #ffe0e0;
  color: #8b0000;
}

.positions-container {
  background: white;
  border-radius: 4px;
  border: 1px solid #ddd;
  overflow: hidden;
}

.positions-table {
  width: 100%;
}

.table-header,
.position-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr 1.5fr 1.5fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  align-items: center;
}

.table-header {
  background: #f8f9fa;
  font-weight: 600;
  font-size: 0.875rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e0e0e0;
}

.position-row {
  border-bottom: 1px solid #f0f0f0;
}

.position-row:last-child {
  border-bottom: none;
}

.col-symbol strong {
  color: #db7093;
  font-size: 1.125rem;
}

.col-qty,
.col-price,
.col-value {
  color: #333;
}

.col-change.positive {
  color: #228b22;
  font-weight: 600;
}

.col-change.negative {
  color: #8b0000;
  font-weight: 600;
}

@media (max-width: 768px) {
  .table-header,
  .position-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .table-header {
    display: none;
  }
  
  .position-row {
    padding: 1rem;
  }
  
  .position-row > div::before {
    content: attr(class);
    font-weight: 600;
    color: #666;
    margin-right: 0.5rem;
    text-transform: uppercase;
    font-size: 0.75rem;
  }
}
</style>
