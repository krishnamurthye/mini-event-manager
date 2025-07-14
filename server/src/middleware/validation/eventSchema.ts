// server/src/middleware/validation/createEventSchema.ts
import { z } from 'zod';

export const eventSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
    }),
    tagIds: z.array(z.string()),
});
