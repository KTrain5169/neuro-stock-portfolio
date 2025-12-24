<script setup lang="ts">
import { onMounted } from 'vue';
import AccountSummary from './components/AccountSummary.vue';
import PortfolioChart from './components/PortfolioChart.vue';
import PositionsList from './components/PositionsList.vue';
import RecentActivities from './components/RecentActivities.vue';
import { usePortfolio } from './composables/usePortfolio';

const { data, loading, error, lastUpdated, fetchPortfolio, refreshPortfolio } = usePortfolio();

onMounted(() => {
  fetchPortfolio();
});

function formatLastUpdated(timestamp: string | null): string {
  if (!timestamp) return 'Never';
  return new Date(timestamp).toLocaleString();
}
</script>

<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <h1>Neuro Stock Exchange</h1>
        <div class="header-actions">
          <div v-if="lastUpdated" class="last-updated">
            Last updated: {{ formatLastUpdated(lastUpdated) }}
          </div>
          <button 
            @click="refreshPortfolio" 
            :disabled="loading"
            class="refresh-btn"
          >
            {{ loading ? '⟳ Refreshing...' : 'Refresh' }}
          </button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div v-if="error && !loading" class="global-error">
        <strong>Error:</strong> {{ error }}
        <button @click="fetchPortfolio" class="retry-btn">Retry</button>
      </div>

      <AccountSummary 
        :account="data?.account || null" 
        :loading="loading" 
        :error="error" 
      />

      <PortfolioChart 
        :history="data?.history || null" 
        :loading="loading" 
        :error="error" 
      />

      <PositionsList 
        :positions="data?.positions || null" 
        :loading="loading" 
        :error="error" 
      />

      <RecentActivities 
        :activities="data?.activities || null" 
        :loading="loading" 
        :error="error" 
      />
    </main>

    <footer class="footer">
      <p><a href="https://github.com/KTrain5169/neuro-stock-portfolio" target="_blank">Source code</a> | This site is not affiliated with VedalAI.</p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f0f0;
}

.header {
  background: #fff;
  border-bottom: 1px solid #ddd;
  padding: 1.5rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

h1 {
  margin: 0;
  font-size: 2rem;
  color: #8b0000;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.last-updated {
  font-size: 0.875rem;
  color: #666;
}

.refresh-btn {
  padding: 0.75rem 1.5rem;
  background: #db7093;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
}

.refresh-btn:hover:not(:disabled) {
  background: #c65d7f;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
}

.global-error {
  background: #ffe0e0;
  color: #8b0000;
  padding: 1.5rem;
  border-radius: 4px;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #db7093;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background: #8b0000;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.retry-btn:hover {
  background: #6b0000;
}

.footer {
  background: #fff;
  border-top: 1px solid #ddd;
  padding: 1.5rem 2rem;
  text-align: center;
  color: #666;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  h1 {
    font-size: 1.5rem;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .refresh-btn {
    width: 100%;
  }

  .main-content {
    padding: 1rem;
  }
}
</style>
