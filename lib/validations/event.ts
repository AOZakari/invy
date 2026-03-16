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
  theme: z.enum(['light', 'dark', 'ocean', 'forest', 'sunset', 'midnight', 'rose', 'lavender']).optional().default('light'),
  notify_on_rsvp: z.boolean().optional().default(true),
  capacity_limit: z.coerce.number().int().min(1).max(10000).optional().nullable(),
  rsvp_deadline_date: z.string().optional().or(z.literal('')),
  rsvp_deadline_time: z.string().optional().or(z.literal('')),
  slug: z
    .union([
      z.string().min(3, 'Slug must be 3-50 characters').max(50).regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, 'Slug: lowercase, numbers, hyphens; cannot start/end with hyphen'),
      z.literal(''),
    ])
    .optional(),
});

export const updateEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  end_time: z.string().optional().or(z.literal('')),
  location_text: z.string().min(1).max(500).optional(),
  location_url: z.string().url().optional().or(z.literal('')),
  theme: z.enum(['light', 'dark', 'ocean', 'forest', 'sunset', 'midnight', 'rose', 'lavender']).optional(),
  notify_on_rsvp: z.boolean().optional(),
  capacity_limit: z.coerce.number().int().min(1).max(10000).optional().nullable(),
  rsvp_deadline_date: z.string().optional().or(z.literal('')),
  rsvp_deadline_time: z.string().optional().or(z.literal('')),
  rsvp_open: z.boolean().optional(),
  guest_list_visibility: z.enum(['host_only', 'public', 'attendees_only']).optional(),
  og_image_url: z.string().url().optional().or(z.literal('')),
  page_style: z.enum(['classic', 'modern', 'bold']).optional(),
  cover_image_url: z.union([z.string().url(), z.literal(''), z.null()]).optional(),
  poster_image_url: z.union([z.string().url(), z.literal(''), z.null()]).optional(),
  cover_image_position: z.enum(['top', 'center', 'bottom']).optional(),
  custom_rsvp_fields: z.array(z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(['text', 'select', 'checkbox', 'number']),
    required: z.boolean().optional(),
    options: z.array(z.string()).optional(),
  })).optional(),
  custom_share_message: z.string().max(500).optional().nullable(),
  hide_branding_in_share: z.boolean().optional(),
  send_reminder_1_day: z.boolean().optional(),
  hide_branding: z.boolean().optional(),
  rsvp_mode: z.enum(['instant', 'request']).optional(),
  hide_location_until_approved: z.boolean().optional(),
  hide_private_note_until_approved: z.boolean().optional(),
  private_note: z.string().max(2000).optional().nullable(),
  show_organizer_contact: z.boolean().optional(),
  organizer_contact_email: z.union([z.string().email('Invalid email'), z.literal('')]).optional(),
  organizer_contact_phone: z.string().max(50).optional(),
  organizer_contact_instagram: z.string().max(200).optional(),
  organizer_contact_whatsapp: z.string().max(100).optional(),
  organizer_contact_text: z.string().max(200).optional(),
  slug: z
    .union([
      z.string().min(3).max(50).regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, 'Slug: lowercase, numbers, hyphens; cannot start/end with hyphen'),
      z.literal(''),
    ])
    .optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

