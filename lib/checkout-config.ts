import { PRICE_PAISE, PRICE_RUPEES } from '@/app/_landing/offer';

/**
 * Every server-side constant the payment and tracking routes need, in one
 * place. The price comes from offer.ts, which reads it from a single env var,
 * so the amount charged can never drift from the amount displayed.
 */
export const CHECKOUT_CONFIG = {
  amountRupees: PRICE_RUPEES,
  amountPaise: PRICE_PAISE,
  currency: 'INR',
  contentName: '5-Day (Peri)Menopause Reset Challenge',
  /* The launch domain as the fallback, not example.com: this value is sent to
     Meta as event_source_url and written into every Razorpay order, so an
     unset env var would quietly attribute live events to a domain we do not
     own.

     `||`, not `??`. A host that defines the key with a blank value yields an
     empty string, which `??` passes straight through, and an empty
     event_source_url is silently worthless to Meta. */
  fallbackEventSourceUrl:
    (process.env.NEXT_PUBLIC_SITE_URL || '').trim() ||
    'https://challenge.kaizengoa.com',
  meta: {
    pixelId: process.env.META_PIXEL_ID ?? '',
    accessToken: process.env.META_CAPI_ACCESS_TOKEN ?? '',
    testEventCode: process.env.META_CAPI_TEST_EVENT_CODE ?? '',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID ?? '',
    keySecret: process.env.RAZORPAY_KEY_SECRET ?? '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? '',
  },
} as const;

/** True only when a real CAPI call can be made. Routes check this and skip
 *  quietly rather than posting to Meta with an empty pixel id. */
export const capiReady = () =>
  Boolean(CHECKOUT_CONFIG.meta.pixelId && CHECKOUT_CONFIG.meta.accessToken);
