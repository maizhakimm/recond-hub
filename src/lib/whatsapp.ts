/** Normalise a Malaysian phone number to the wa.me format 60XXXXXXXXX. Returns "" if unusable. */
export function normalizeMsisdn(input: string | number | undefined | null): string {
  if (input === undefined || input === null) return "";
  let digits = String(input).replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `6${digits}`;
  if (!digits.startsWith("60")) digits = `60${digits}`;
  return digits.length >= 10 && digits.length <= 13 ? digits : "";
}

export function waLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
