/**
 * Central pricing configuration for INVY
 * Single source of truth for tiers, prices, copy, and feature allocation
 */

export type PlanId = 'free' | 'plus' | 'pro_event' | 'organizer_hub';

export interface PlanConfig {
  id: PlanId;
  name: string;
  price: number;
  period: 'event' | 'month';
  eyebrow: string;
  description: string;
  cta: string;
  ctaHref?: string;
  badge?: string;
  features: string[];
}

export const PLANS: PlanConfig[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'event',
    eyebrow: 'For one-off events',
    description: 'Create and share an RSVP page in seconds.',
    cta: 'Start free',
    ctaHref: '/create',
    features: [
      'Create events & collect RSVPs',
      'Light/dark themes',
      'Event expires 7 days after date',
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 2.99,
    period: 'event',
    eyebrow: 'Keep it live',
    description: 'Save the page, export your guest list, and add one useful custom question.',
    cta: 'Upgrade this event',
    features: [
      'Event stays live',
      'CSV export',
      'QR code download',
      '1 custom RSVP field/question',
    ],
  },
  {
    id: 'pro_event',
    name: 'Pro Event',
    price: 5.99,
    period: 'event',
    eyebrow: 'Make it yours',
    description: 'Premium themes, custom link, RSVP customization, analytics, and host controls.',
    cta: 'Go Pro',
    badge: 'Most popular',
    features: [
      'Event stays live',
      'Custom slug',
      'Advanced themes (8 themes)',
      'Page style (Classic / Modern / Bold)',
      'Cover & poster images',
      'CSV export',
      'Guest list controls',
      'Capacity limits',
      'Link preview cards',
      'Analytics',
      'Full custom RSVP fields',
      'QR code download',
      'Request-to-attend mode',
      'Host contact section',
    ],
  },
  {
    id: 'organizer_hub',
    name: 'Organizer Hub',
    price: 15.99,
    period: 'month',
    eyebrow: 'For repeat hosts',
    description: 'All Pro features on every event, reminders, white label, and better sharing.',
    cta: 'Start Organizer Hub',
    ctaHref: '/dashboard/billing',
    badge: 'For repeat hosts',
    features: [
      'All Pro Event features',
      'Share controls',
      'Email reminders',
      'White label',
    ],
  },
];

export const COMPARISON_ROWS: { feature: string; free: boolean; plus: boolean; pro: boolean; hub: boolean }[] = [
  { feature: 'Create events & collect RSVPs', free: true, plus: true, pro: true, hub: true },
  { feature: 'Light/dark themes', free: true, plus: true, pro: true, hub: true },
  { feature: 'Event stays live', free: false, plus: true, pro: true, hub: true },
  { feature: 'CSV export', free: false, plus: true, pro: true, hub: true },
  { feature: 'QR code download', free: false, plus: true, pro: true, hub: true },
  { feature: '1 custom RSVP field/question', free: false, plus: true, pro: true, hub: true },
  { feature: 'Custom slug', free: false, plus: false, pro: true, hub: true },
  { feature: 'Advanced themes', free: false, plus: false, pro: true, hub: true },
  { feature: 'Page style & cover/poster images', free: false, plus: false, pro: true, hub: true },
  { feature: 'Guest list controls', free: false, plus: false, pro: true, hub: true },
  { feature: 'Capacity limits', free: false, plus: false, pro: true, hub: true },
  { feature: 'Link preview cards / custom OG', free: false, plus: false, pro: true, hub: true },
  { feature: 'Analytics', free: false, plus: false, pro: true, hub: true },
  { feature: 'Full custom RSVP fields', free: false, plus: false, pro: true, hub: true },
  { feature: 'Request-to-attend mode', free: false, plus: false, pro: true, hub: true },
  { feature: 'Host contact section', free: false, plus: false, pro: true, hub: true },
  { feature: 'Share controls', free: false, plus: false, pro: false, hub: true },
  { feature: 'Email reminders', free: false, plus: false, pro: false, hub: true },
  { feature: 'White label', free: false, plus: false, pro: false, hub: true },
];

export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Can I use INVY for free?',
    a: 'Yes. You can create and share an RSVP page for free in seconds.',
  },
  {
    q: 'What happens when a free event expires?',
    a: 'Free event pages expire 7 days after the event date. Upgrade to Plus or Pro to keep them live.',
  },
  {
    q: 'Who is Organizer Hub for?',
    a: 'People and teams who host events regularly and want all Pro features on every event, plus reminders, white label, and better sharing.',
  },
  {
    q: 'Do I need an account to create an event?',
    a: 'No. Add your email and you get a manage link by email. You can sign up later and claim events if you want.',
  },
  {
    q: 'Is INVY for large ticketed events?',
    a: 'No. INVY is built for fast RSVP pages, social events, small organizers, and lightweight event hosting.',
  },
  {
    q: 'Can I upgrade later?',
    a: 'Yes. Start free and upgrade any event when you want more control or customization.',
  },
];
