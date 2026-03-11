import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  end_time: z.string().optional().or(z.literal('')),
  location_text: z.string().min(1, 'Location is required').max(500, 'Location is too long'),
  location_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  organizer_email: z.string().email('Invalid email address'),
  theme: z.enum(['light', 'dark']).optional().default('light'),
  notify_on_rsvp: z.boolean().optional().default(true),
  capacity_limit: z.coerce.number().int().min(1).max(10000).optional().nullable(),
  rsvp_deadline_date: z.string().optional().or(z.literal('')),
  rsvp_deadline_time: z.string().optional().or(z.literal('')),
});

export const updateEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  end_time: z.string().optional().or(z.literal('')),
  location_text: z.string().min(1).max(500).optional(),
  location_url: z.string().url().optional().or(z.literal('')),
  theme: z.enum(['light', 'dark']).optional(),
  notify_on_rsvp: z.boolean().optional(),
  capacity_limit: z.coerce.number().int().min(1).max(10000).optional().nullable(),
  rsvp_deadline_date: z.string().optional().or(z.literal('')),
  rsvp_deadline_time: z.string().optional().or(z.literal('')),
  rsvp_open: z.boolean().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

