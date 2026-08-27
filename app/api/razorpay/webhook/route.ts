import crypto from 'crypto';

import { NextResponse } from 'next/server';

import { CHECKOUT_CONFIG, capiReady } from '@/lib/checkout-config';
import { ga4ServerReady, sendGa4Purchase } from '@/lib/ga4-server';
import { sendCapiEvent } from '@/lib/meta-capi';
import { pabblyReady, sendPabblyPurchase } from '@/lib/pabbly';

/**
 * Razorpay webhook → Meta CAPI Purchase.
 *
 * Purchase is sent from HERE and nowhere else. A browser-side Purchase would
 * miss every UPI payer who completes inside their bank app and never returns
 * to the tab, which in India is most of them. It is also the only place the
 * payment is proven rather than merely attempted.
 *
 * The signature check is not optional. Without it anyone who learns this URL
 * can post a fake payment and inflate Meta's conversion data, which then
 * teaches the ad account to buy the wrong people.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get('x-razorpay-signature') ?? '';
  const secret = CHECKOUT_CONFIG.razorpay.webhookSecret;

  if (!secret) {
    console.error('[rzp-webhook] no webhook secret configured');
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  const valid =
    sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);

  if (!valid) {
    console.warn('[rzp-webhook] bad signature, rejected');
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const parsed = JSON.parse(raw);
  if (parsed.event !== 'payment.captured') {
    // Razorpay sends many event types; only a captured payment is a Purchase.
    return NextResponse.json({ ok: true, ignored: parsed.event });
  }

  const payment = parsed.payload?.payment?.entity ?? {};
  const notes = payment.notes ?? {};
  const paymentId = String(payment.id ?? '');
  const amountRupees = Number(payment.amount ?? 0) / 100;

  const valueRupees = amountRupees || CHECKOUT_CONFIG.amountRupees;

  /* create-order packs the three utm_* values into one pipe-delimited note to
     stay under Razorpay's 15-pair cap. Unpack in the same order it packed. */
  const [utmSource = '', utmMedium = '', utmCampaign = ''] = String(
    notes.utm ?? '',
  ).split('|');
  const country = String(notes.country ?? '') || 'in';

  /* GA4 purchase, server side. The browser copy on /thank-you only counts
     buyers who return to the page, which most UPI payers do not. Both are
     keyed on the payment id, so GA4 collapses the pair rather than counting
     the sale twice when someone does come back. */
  const ga4 = ga4ServerReady()
    ? await sendGa4Purchase({
        clientId: String(notes.gaCid ?? ''),
        transactionId: paymentId,
        valueRupees,
        currency: CHECKOUT_CONFIG.currency,
        itemId: 'kaizen-5day-reset',
        itemName: CHECKOUT_CONFIG.contentName,
      })
    : { ok: false, status: 0 };

  /* Fulfilment hand-off, BEFORE the CAPI guard below: a missing Meta config
     must never stop a paying buyer from receiving what they bought. Its own
     failure is swallowed, because a non-200 here would make Razorpay retry the
     whole webhook and double-fire Meta and GA4. */
  const pabbly = pabblyReady()
    ? await sendPabblyPurchase({
        paymentId,
        orderId: String(payment.order_id ?? ''),
        name: String(notes.name ?? ''),
        firstName: String(notes.firstName ?? ''),
        lastName: String(notes.lastName ?? ''),
        email: String(payment.email ?? notes.email ?? ''),
        phone: String(payment.contact ?? notes.phone ?? ''),
        city: String(notes.city ?? ''),
        country,
        occupation: String(notes.occupation ?? ''),
        amountRupees: valueRupees,
        currency: CHECKOUT_CONFIG.currency,
        product: CHECKOUT_CONFIG.contentName,
        utmSource,
        utmMedium,
        utmCampaign,
      })
    : { ok: false, status: 0 };

  if (!capiReady()) {
    console.warn('[rzp-webhook] CAPI not configured, Meta Purchase not sent');
    return NextResponse.json({
      ok: true,
      capi: 'skipped',
      ga4: ga4.ok,
      pabbly: pabbly.ok,
    });
  }

  /* event_id is the payment id: unique per payment, and stable if Razorpay
     retries the webhook, so a retry cannot double-count the sale. */
  const result = await sendCapiEvent({
    pixelId: CHECKOUT_CONFIG.meta.pixelId,
    accessToken: CHECKOUT_CONFIG.meta.accessToken,
    eventName: 'Purchase',
    eventId: paymentId,
    eventSourceUrl:
      String(notes.esu ?? '') || CHECKOUT_CONFIG.fallbackEventSourceUrl,
    user: {
      email: payment.email || notes.email || undefined,
      phone: payment.contact || notes.phone || undefined,
      firstName: notes.firstName || undefined,
      lastName: notes.lastName || undefined,
      country,
      city: notes.city || undefined,
      externalId: notes.externalId || undefined,
      fbc: notes.fbc || undefined,
      fbp: notes.fbp || undefined,
    },
    valueRupees,
    currency: CHECKOUT_CONFIG.currency,
    contentName: CHECKOUT_CONFIG.contentName,
    utm: { source: utmSource, medium: utmMedium, campaign: utmCampaign },
    /* Not PII and not hashable, so it rides in custom_data rather than
       user_data: it is a segment, not an identifier. */
    ...(notes.occupation && { custom: { occupation: String(notes.occupation) } }),
    testEventCode: CHECKOUT_CONFIG.meta.testEventCode || undefined,
  });

  console.log(
    `[rzp-webhook] ${paymentId} Purchase capi=${result.ok} ga4=${ga4.ok} pabbly=${pabbly.ok}`,
  );
  return NextResponse.json({
    ok: true,
    capi: result.ok ? 'sent' : 'error',
    ga4: ga4.ok ? 'sent' : 'skipped',
    pabbly: pabbly.ok ? 'sent' : 'skipped',
  });
}
