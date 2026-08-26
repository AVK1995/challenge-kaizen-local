/**
 * The line items, and the one place they are defined.
 *
 * Values are numeric so the summary can sum them and show a real total rather
 * than a hard-coded "worth ₹5,485" string. These mirror the toolkit section on
 * the landing page exactly: if one changes, both must, or the checkout promises
 * something the page did not.
 */
export const RECAP: { title: string; value: number }[] = [
  { title: '5-Day Live (Peri)Menopause Reset Challenge', value: 2500 },
  { title: 'Seed Cycling Made Simple', value: 497 },
  { title: 'The One-Stretch Morning Mobility Reset', value: 497 },
  { title: 'The 4-7-8 Calm & Sleep Breathwork Guide', value: 497 },
  { title: 'The 5-Minute Facial De-Puffing Routine', value: 497 },
  { title: 'Guided Breathwork & Meditation Collection', value: 997 },
];

export const VALUE_TOTAL = RECAP.reduce((n, r) => n + r.value, 0);

export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
