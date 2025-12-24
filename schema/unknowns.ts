import { z } from "zod";

const position = z.object({
    symbol: z.string(),
    qty: z.string(),
    marketValue: z.string(),
    costBasis: z.string(),
    currentPrice: z.string(),
    lastdayPrice: z.string(),
    changeToday: z.string(),
});

export const positions = z.array(position);

const activity = z.object({
    activity_type: z.string(),
    transaction_time: z.string(),
    type: z.string(),
    price: z.string(),
    qty: z.string(),
    side: z.string(),
    symbol: z.string(),
    leaves_qty: z.string(),
    cum_qty: z.string(),
    order_status: z.string(),
});

export const activities = z.record(z.string(), z.array(activity));
