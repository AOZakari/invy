import { z } from 'zod';

export const createRsvpSchema = z.object({
  name: z.string().max(200, 'Name is too long').optional().default(''),
  contact_info: z.string().email('Valid email is required').max(500, 'Email is too long'),
  status: z.enum(['yes', 'no', 'maybe', 'pending'], {
    message: 'Please select an RSVP status',
  }),
  plus_one: z.coerce.number().int().min(0).max(10).default(0),
  custom_field_values: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional().default({}),
});

export type CreateRsvpInput = z.infer<typeof createRsvpSchema>;

