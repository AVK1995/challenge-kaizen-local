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
  { title: 'Kaizen Menopause Nutrition Playbook', value: 997 },
  { title: 'Kaizen Morning Mobility Reset', value: 497 },
  { title: 'Pranayam for Better Sleep', value: 497 },
  { title: 'Nervous System Reset with Prerna', value: 497 },
  /* Added with the landing page's bonus stack. A buyer who reads seven items
     on the page and six in the order summary is being shown two offers at the
     moment they are asked to pay. (Spec PRIORITY 4.) */
  { title: 'Your (Peri)Menopause Symptom Score', value: 900 },
  { title: 'Your Movement Readiness Check', value: 900 },
];

export const VALUE_TOTAL = RECAP.reduce((n, r) => n + r.value, 0);

export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
