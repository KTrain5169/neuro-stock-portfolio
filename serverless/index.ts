import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { zod_object_schema } from '../schema';

const app = new Hono<{ Bindings: Env }>();

// Add CORS for API access
app.use('/api/*', cors());

// Configuration - Update this URL with your actual GitHub raw URL
const GITHUB_DATA_URL = process.env.GITHUB_DATA_URL ?? 'https://raw.githubusercontent.com/VedalAI/neuro-stocks-data/refs/heads/main/portfolio.json';
const CACHE_TTL = 86400;

// Fetch and cache stock data from GitHub (only write if changed)
async function fetchAndCacheData(env: Env): Promise<any> {
    try {
        console.log('Fetching data from GitHub...');
        const response = await fetch(GITHUB_DATA_URL);

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Validate data against schema
        const validatedData = zod_object_schema.parse(data);
        const newDataString = JSON.stringify(validatedData);

        // Check if data has changed before writing to KV
        const existingData = await env.STOCKS_DATA.get('full_data');

        if (existingData === newDataString) {
            console.log('Data unchanged, skipping KV writes');
            return validatedData;
        }

        console.log('Data changed, updating KV cache');

        // Store each category in KV only if changed
        const categories = ['account', 'history', 'positions', 'activities'] as const;
        await Promise.all(
            categories.map(async category => {
                const categoryData = JSON.stringify(validatedData[category]);
                const existingCategoryData = await env.STOCKS_DATA.get(category);

                if (existingCategoryData !== categoryData) {
                    await env.STOCKS_DATA.put(
                        category,
                        categoryData,
                        { expirationTtl: CACHE_TTL }
                    );
                }
            })
        );

        // Store full data and timestamp
        await env.STOCKS_DATA.put('full_data', newDataString, { expirationTtl: CACHE_TTL });
        await env.STOCKS_DATA.put('last_updated', new Date().toISOString(), { expirationTtl: CACHE_TTL });

        return validatedData;
    } catch (error) {
        console.error('Error fetching/caching data:', error);
        throw error;
    }
}

// Get data from cache or fetch if not available
async function getData(env: Env): Promise<any> {
    const cachedData = await env.STOCKS_DATA.get('full_data');

    if (cachedData) {
        console.log('Returning cached data');
        return JSON.parse(cachedData);
    }

    console.log('Cache miss, fetching fresh data');
    return await fetchAndCacheData(env);
}

// API Routes
app.get('/api/portfolio', async (c) => {
    try {
        const data = await getData(c.env);
        const lastUpdated = await c.env.STOCKS_DATA.get('last_updated');

        // Set Cache-Control header with max-age of 60 seconds
        c.header('Cache-Control', 'public, max-age=60');

        return c.json({
            success: true,
            data,
            lastUpdated,
        });
    } catch (error) {
        console.error('Error in /api/portfolio:', error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }, 500);
    }
});

app.get('/api/account', async (c) => {
    try {
        const account = await c.env.STOCKS_DATA.get('account');

        if (!account) {
            // Trigger cache refresh
            await fetchAndCacheData(c.env);
            const refreshedAccount = await c.env.STOCKS_DATA.get('account');
            c.header('Cache-Control', 'public, max-age=60');
            return c.json({ success: true, data: JSON.parse(refreshedAccount!) });
        }

        c.header('Cache-Control', 'public, max-age=60');
        return c.json({ success: true, data: JSON.parse(account) });
    } catch (error) {
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }, 500);
    }
});

app.get('/api/history', async (c) => {
    try {
        const history = await c.env.STOCKS_DATA.get('history');

        if (!history) {
            await fetchAndCacheData(c.env);
            const refreshedHistory = await c.env.STOCKS_DATA.get('history');
            c.header('Cache-Control', 'public, max-age=60');
            return c.json({ success: true, data: JSON.parse(refreshedHistory!) });
        }

        c.header('Cache-Control', 'public, max-age=60');
        return c.json({ success: true, data: JSON.parse(history) });
    } catch (error) {
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }, 500);
    }
});

app.get('/api/positions', async (c) => {
    try {
        const positions = await c.env.STOCKS_DATA.get('positions');

        if (!positions) {
            await fetchAndCacheData(c.env);
            const refreshedPositions = await c.env.STOCKS_DATA.get('positions');
            c.header('Cache-Control', 'public, max-age=60');
            return c.json({ success: true, data: JSON.parse(refreshedPositions!) });
        }

        c.header('Cache-Control', 'public, max-age=60');
        return c.json({ success: true, data: JSON.parse(positions) });
    } catch (error) {
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }, 500);
    }
});

app.get('/api/activities', async (c) => {
    try {
        const activities = await c.env.STOCKS_DATA.get('activities');

        if (!activities) {
            await fetchAndCacheData(c.env);
            const refreshedActivities = await c.env.STOCKS_DATA.get('activities');
            c.header('Cache-Control', 'public, max-age=60');
            return c.json({ success: true, data: JSON.parse(refreshedActivities!) });
        }

        c.header('Cache-Control', 'public, max-age=60');
        return c.json({ success: true, data: JSON.parse(activities) });
    } catch (error) {
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }, 500);
    }
});

// Force refresh endpoint
app.post('/api/refresh', async (c) => {
    try {
        const data = await fetchAndCacheData(c.env);
        c.header('Cache-Control', 'no-cache');
        return c.json({
            success: true,
            message: 'Data refreshed successfully',
            data,
        });
    } catch (error) {
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }, 500);
    }
});

export default app
