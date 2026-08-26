import { NextResponse } from 'next/server';

import { CHECKOUT_CONFIG } from '@/lib/checkout-config';

/**
 * Creates the Razorpay order the browser then pays.
 *
 * Called with the Razorpay REST API over fetch rather than the `razorpay` npm
 * package: order creation is one authenticated POST, and avoiding the package
 * keeps a dependency (and its transitive tree) out of this project.
 *
 * THE NOTES ARE THE POINT. Everything Meta needs to match the eventual
 * Purchase to a person and a campaign is written into the order here, because
 * the webhook that fires Purchase receives only what Razorpay stores. Signals
 * not written now are gone by then: the buyer may complete inside a bank app
 * and never return to a page that could report them.
 *
 * Razorpay allows 15 note keys at 256 chars each, so related fields are packed
 * into JSON blobs rather than spread across keys.
 */

const truncate = (v: unknown, max = 256) => {
  const s = v == null ? '' : String(v);
  return s.length > max ? s.slice(0, max) : s;
};

export async function POST(req: Request) {
  const { keyId, keySecret } = CHECKOUT_CONFIG.razorpay;
  if (!keyId || !keySecret) {
    console.error('[create-order] Razorpay keys not configured');
    return NextResponse.json(
      { ok: false, reason: 'not-configured' },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad-json' }, { status: 400 });
  }

  const name = truncate(body.name, 120).trim();
  const email = truncate(body.email, 160).trim();
  const phone = truncate(body.phone, 20).replace(/\D/g, '');
  if (!name || !email || !phone) {
    return NextResponse.json({ ok: false, reason: 'missing-fields' }, { status: 400 });
  }

  const utm = (body.utm ?? {}) as Record<string, string | undefined>;
  const [firstName, ...rest] = name.split(' ');

  const notes: Record<string, string> = {
    kind: 'kaizen_5day_reset',
    name: truncate(name),
    email: truncate(email),
    phone: truncate(phone),
    firstName: truncate(firstName),
    lastName: truncate(rest.join(' ')),
    externalId: truncate(body.externalId, 64),
    fbc: truncate(body.fbc),
    fbp: truncate(body.fbp),
    gaCid: truncate(body.gaClientId, 64),
    /* Canonical, no query string: real URLs blow past 256 chars once utm and
       fbclid params are on them, and event_source_url is metadata for Meta
       rather than a matching signal, so trimming it costs no match quality. */
    esu: `${CHECKOUT_CONFIG.fallbackEventSourceUrl}/checkout`,
    utm_source: truncate(utm.source, 100),
    utm_medium: truncate(utm.medium, 100),
    utm_campaign: truncate(utm.campaign, 100),
  };

  try {
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      },
      body: JSON.stringify({
        amount: CHECKOUT_CONFIG.amountPaise,
        currency: CHECKOUT_CONFIG.currency,
        receipt: `kz_${Date.now()}`,
        notes,
      }),
    });

    const order = await res.json();
    if (!res.ok || !order?.id) {
      console.error('[create-order] razorpay rejected', order);
      return NextResponse.json({ ok: false, reason: 'gateway' }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId, // publishable by design: the browser needs it to open the sheet
    });
  } catch (e) {
    console.error('[create-order] failed', e);
    return NextResponse.json({ ok: false, reason: 'network' }, { status: 502 });
  }
}
