import { z } from 'zod';

const history = z.object({
    timestamp: z.number(),
    equity: z.number(),
    change: z.number(),
    changePercent: z.number(),
})

export const historyArray = z.array(history)
