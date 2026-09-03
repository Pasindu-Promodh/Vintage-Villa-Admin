/**
 * Bookings and unavailable dates are stored as full ISO timestamps
 * (toISOString()), which encode a specific UTC instant. Parsing that
 * directly with `new Date(iso)` and then reading local day/month/year
 * can land on the wrong calendar day depending on the browser's
 * timezone relative to the villa's (e.g. an admin viewing from a
 * timezone west of Sri Lanka can see dates shifted a day earlier).
 *
 * This strips the stored value down to just its Y-M-D date part and
 * builds a Date in the browser's local timezone at local midnight, so
 * it always lines up with how the calendar itself renders local days.
 */
export const toLocalDateOnly = (dateString: string): Date => {
  const datePart = dateString.split("T")[0]; // "yyyy-MM-dd"
  const [year, month, day] = datePart.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};
