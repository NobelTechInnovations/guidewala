/**
 * Booking ID format matches the source system: PREFIX + DDMMYY + zero-padded sequence.
 * e.g. TB2212210002, HB0201220001, GW2012210001
 */
export function formatBookingId(prefix: string, sequence: number) {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const seq = String(sequence).padStart(4, "0");
  return `${prefix}${dd}${mm}${yy}${seq}`;
}

/** Random tracking token matching the source's GWT-prefixed hex ID style. */
export function generateTrackingId(prefix = "GWT") {
  const hex = Array.from({ length: 20 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  )
    .join("")
    .toUpperCase();
  return `${prefix}${hex}`;
}
