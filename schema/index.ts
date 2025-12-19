import { z } from 'zod';
import { account } from './account';
import { historyArray } from './history';
import { activities, positions } from './unknowns';

export const zod_object_schema = z.object({
    account,
    history: historyArray,
    positions,
    activities,
})

export const json_zod = {
    account,
    history: historyArray,
    positions,
    activities,
}
