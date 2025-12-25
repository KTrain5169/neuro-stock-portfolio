<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import AccountSummary from './components/AccountSummary.vue';
import Banner from './components/Banner.vue';
import PortfolioChart from './components/PortfolioChart.vue';
import PositionsList from './components/PositionsList.vue';
import RecentActivities from './components/RecentActivities.vue';
import { usePortfolio } from './composables/usePortfolio';

const { data, loading, error, lastUpdated, fetchPortfolio, refreshPortfolio } = usePortfolio();

const isDarkMode = ref(false);
const hasManualPreference = ref(false);

onMounted(() => {
  fetchPortfolio();

  // Load dark mode preference from localStorage
  const savedMode = localStorage.getItem('darkMode');
  if (savedMode !== null) {
    isDarkMode.value = savedMode === 'true';
    hasManualPreference.value = true;
  } else {
    // Check system preference
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    hasManualPreference.value = false;
  }

  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleThemeChange = (e: MediaQueryListEvent) => {
    // Only auto-update if user hasn't manually set a preference
    if (!hasManualPreference.value) {
      isDarkMode.value = e.matches;
    }
  };

  mediaQuery.addEventListener('change', handleThemeChange);

  // Cleanup listener on unmount
  onUnmounted(() => {
    mediaQuery.removeEventListener('change', handleThemeChange);
  });
});

watch(isDarkMode, (newValue) => {
  if (newValue) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, { immediate: true });

function formatLastUpdated(timestamp: string | null): string {
  if (!timestamp) return 'Never';
  return new Date(timestamp).toLocaleString();
}

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value;
  // Mark as manual preference and save to localStorage
  hasManualPreference.value = true;
  localStorage.setItem('darkMode', String(isDarkMode.value));
}
</script>

<template>
  <div class="app" :class="{ dark: isDarkMode }">
    <header class="header">
      <div class="header-content">
        <h1>Neuro Stock Exchange</h1>
        <div class="header-actions">
          <div v-if="lastUpdated" class="last-updated">
            Last updated: {{ formatLastUpdated(lastUpdated) }}
          </div>
          <button @click="toggleDarkMode" class="dark-mode-btn"
            :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            {{ isDarkMode ? '☀️' : '🌙' }}
          </button>
          <button @click="refreshPortfolio" :disabled="loading" class="refresh-btn">
            {{ loading ? '⟳ Refreshing...' : 'Refresh' }}
          </button>
        </div>
      </div>
    </header>

    <div class="banner-container">
      <Banner :dark="isDarkMode" />
    </div>

    <main class="main-content">
      <div v-if="error && !loading" class="global-error">
        <strong>Error:</strong> {{ error }}
        <button @click="fetchPortfolio" class="retry-btn">Retry</button>
      </div>

      <AccountSummary :account="data?.account || null" :loading="loading" :error="error" :dark="isDarkMode" />

      <PortfolioChart :history="data?.history || null" :loading="loading" :error="error" :dark="isDarkMode" />

      <PositionsList :positions="data?.positions || null" :loading="loading" :error="error" :dark="isDarkMode" />

      <RecentActivities :activities="data?.activities || null" :loading="loading" :error="error" :dark="isDarkMode" />
    </main>

    <footer class="footer">
      <p><a href="https://github.com/KTrain5169/neuro-stock-portfolio" target="_blank">Source code</a> | This site is
        not affiliated with VedalAI.</p>
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

.app.dark {
  background: #1a1a1a;
}

.header {
  background: #fff;
  border-bottom: 1px solid #ddd;
  padding: 1.5rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.dark .header {
  background: #2d2d2d;
  border-bottom: 1px solid #444;
}

.banner-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
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

.dark h1 {
  color: #ff6b9d;
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

.dark .last-updated {
  color: #aaa;
}

.dark-mode-btn {
  padding: 0.5rem 0.75rem;
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1.25rem;
  cursor: pointer;
  line-height: 1;
}

.dark .dark-mode-btn {
  background: #3d3d3d;
  color: #fff;
  border-color: #555;
}

.dark-mode-btn:hover {
  background: #e0e0e0;
}

.dark .dark-mode-btn:hover {
  background: #4d4d4d;
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

.dark .refresh-btn {
  background: #a85577;
}

.dark .refresh-btn:hover:not(:disabled) {
  background: #9a4d6d;
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

.dark .global-error {
  background: #3d1f1f;
  color: #ff6b6b;
  border-color: #8b4d5d;
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

.dark .retry-btn {
  background: #a85577;
}

.retry-btn:hover {
  background: #6b0000;
}

.dark .retry-btn:hover {
  background: #9a4d6d;
}

.footer {
  background: #fff;
  border-top: 1px solid #ddd;
  padding: 1.5rem 2rem;
  text-align: center;
  color: #666;
  font-size: 0.875rem;
}

.dark .footer {
  background: #2d2d2d;
  border-top: 1px solid #444;
  color: #aaa;
}

.dark .footer a {
  color: #ff6b9d;
}

.dark .footer a:hover {
  color: #ff8db3;
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

  .banner-container {
    padding: 0 1rem;
  }
}
</style>
