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

  const firstName = truncate(body.firstName, 80).trim();
  const lastName = truncate(body.lastName, 80).trim();
  const email = truncate(body.email, 160).trim();
  const phone = truncate(body.phone, 20).replace(/\D/g, '');
  const city = truncate(body.city, 80).trim();
  const country = truncate(body.country, 2).trim().toLowerCase() || 'in';
  const occupation = truncate(body.occupation, 32).trim();

  if (!firstName || !lastName || !email || !phone || !city || !occupation) {
    return NextResponse.json({ ok: false, reason: 'missing-fields' }, { status: 400 });
  }

  const utm = (body.utm ?? {}) as Record<string, string | undefined>;

  /* RAZORPAY CAPS notes AT 15 KEY-VALUE PAIRS. This block is at 14, so there is
     exactly ONE slot spare: adding two more fields fails the order outright,
     it does not just drop the note.

     Two things were folded to make room. `name` is gone, because firstName and
     lastName now arrive as separate form fields and a joined copy is
     redundant. The three utm_* keys are packed into one pipe-delimited `utm`,
     which the webhook splits back apart in the same order. */
  const notes: Record<string, string> = {
    kind: 'kaizen_5day_reset',
    firstName: truncate(firstName),
    lastName: truncate(lastName),
    email: truncate(email),
    phone: truncate(phone),
    city: truncate(city),
    country: truncate(country),
    occupation: truncate(occupation),
    externalId: truncate(body.externalId, 64),
    fbc: truncate(body.fbc),
    fbp: truncate(body.fbp),
    gaCid: truncate(body.gaClientId, 64),
    /* Canonical, no query string: real URLs blow past 256 chars once utm and
       fbclid params are on them, and event_source_url is metadata for Meta
       rather than a matching signal, so trimming it costs no match quality. */
    esu: `${CHECKOUT_CONFIG.fallbackEventSourceUrl}/checkout`,
    utm: truncate(
      [utm.source ?? '', utm.medium ?? '', utm.campaign ?? ''].join('|'),
      250,
    ),
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
      /* Flattened onto ONE line on purpose. Logging the raw object makes the
         host's log viewer pretty-print it across many lines and truncate the
         tail, which is exactly where Razorpay puts `description` and `field`,
         the only two values that say what was actually wrong. */
      const err = order?.error ?? {};
      /* A 401 is never about the payload, so print the SHAPE of the credentials
         beside it. The key id is publishable by design (it is handed to the
         browser below), and a length plus a trimmed-flag says nothing about the
         secret's value while catching all four causes of a bad pair: mixed
         test/live modes, a stray space or quote pasted into the host's env UI,
         a regenerated secret, and the two values entered the wrong way round. */
      if (res.status === 401) {
        console.error(
          `[create-order] auth shape keyIdPrefix=${keyId.slice(0, 9)} ` +
            `keyIdLen=${keyId.length} (expect 23) secretLen=${keySecret.length} (expect 24) ` +
            `keyIdClean=${keyId === keyId.trim()} secretClean=${keySecret === keySecret.trim()} ` +
            `secretLooksLikeKeyId=${keySecret.startsWith('rzp_')}`,
        );
      }
      console.error(
        `[create-order] razorpay rejected http=${res.status} code=${err.code ?? '?'} ` +
          `step=${err.step ?? '?'} field=${err.field ?? '-'} desc=${err.description ?? JSON.stringify(order)}`,
      );
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
