import { z } from 'zod';

export const account = z.object({
    cash: z.string(),
    equity: z.string(),
    portfolioValue: z.string(),
    originalInvestment: z.number(),
})

export interface _account {
    cash: string;
    equity: string;
    portfolioValue: string;
    originalInvestment: number
}
