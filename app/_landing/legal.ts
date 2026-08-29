/**
 * The business facts every legal page needs.
 *
 * Collected here rather than scattered through three pages so it is one edit,
 * and so a placeholder cannot hide in a paragraph.
 *
 * All values are the real registered facts. Kaizen Wellness is a sole
 * proprietorship, so `entity` is the proprietor and `tradeName` carries the
 * business name; the two are kept apart because the law wants the person named
 * and the buyer recognises the brand.
 */
export const LEGAL = {
  /** The proprietor. A sole proprietorship has no separate legal person, so
   *  the individual IS the entity and is what appears on the PAN record. */
  entity: 'Prerna Khetrapal',
  /** The registered trading name, used wherever the law wants "trading as". */
  tradeName: 'Kaizen Wellness',
  address:
    'Plot No. 104/1A, Hotel Neo Majestic, Opp. Azad Bhawan, Porvorim, North Goa, Goa 403521',
  phone: '+91 89061 34444',
  /** Digits only, for the tel: href. */
  phoneHref: '+918906134444',
  /** The monitored inbox. Refund requests and data requests both land here. */
  email: 'app@kaizengoa.com',
  /** Panaji is the seat of the North Goa district court, which covers
   *  Porvorim. ⚠️ Confirm before publishing if a specific forum is preferred. */
  jurisdiction: 'Panaji, Goa',
  effectiveDate: '29 August 2026',
  brand: 'Kaizen',
  product: '5-Day (Peri)Menopause Reset Challenge',
} as const;
