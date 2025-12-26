import { ref } from 'vue';

interface Account {
    cash: string;
    equity: string;
    portfolioValue: string;
    originalInvestment: number;
}

interface HistoryItem {
    timestamp: number;
    equity: number;
    change: number;
    changePercent: number;
}

interface PortfolioData {
    account: Account;
    history: HistoryItem[];
    positions: any[];
    activities: any;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    lastUpdated?: string;
    error?: string;
}

export function usePortfolio() {
    const data = ref<PortfolioData | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const lastUpdated = ref<string | null>(null);

    const ADJUSTMENT = 137.15;

    function adjustPortfolioData(portfolioData: PortfolioData): PortfolioData {
        return {
            ...portfolioData,
            account: {
                ...portfolioData.account,
                equity: (parseFloat(portfolioData.account.equity) - ADJUSTMENT).toFixed(2),
                portfolioValue: (parseFloat(portfolioData.account.portfolioValue) - ADJUSTMENT).toFixed(2),
            },
            history: portfolioData.history.map(item => ({
                ...item,
                equity: item.equity - ADJUSTMENT,
            })),
        };
    }

    async function fetchPortfolio() {
        loading.value = true;
        error.value = null;

        try {
            const response = await fetch('/api/portfolio');
            const result: ApiResponse<PortfolioData> = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch portfolio data');
            }

            data.value = adjustPortfolioData(result.data);
            lastUpdated.value = result.lastUpdated || null;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Unknown error occurred';
            console.error('Error fetching portfolio:', err);
        } finally {
            loading.value = false;
        }
    }

    async function refreshPortfolio() {
        loading.value = true;
        error.value = null;

        try {
            const response = await fetch('/api/refresh', { method: 'POST' });
            const result: ApiResponse<PortfolioData> = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to refresh portfolio data');
            }

            data.value = adjustPortfolioData(result.data);
            lastUpdated.value = new Date().toISOString();
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Unknown error occurred';
            console.error('Error refreshing portfolio:', err);
        } finally {
            loading.value = false;
        }
    }

    return {
        data,
        loading,
        error,
        lastUpdated,
        fetchPortfolio,
        refreshPortfolio,
    };
}
