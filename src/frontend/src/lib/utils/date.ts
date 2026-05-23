import { differenceInDays } from "date-fns/differenceInDays";
import { format } from "date-fns/format";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";

export function formatCustomDate(targetDate: string) {
  const date = new Date(targetDate);
  const now = new Date();

  if (differenceInDays(now, date) < 7) {
    return formatDistanceToNow(date, { addSuffix: true });
  }

  // Fallback for 7 days or older
  // MMM: short month (Mar)
  // d: day without leading zero (30)
  // yyyy: 4-digit year (2026)
  return format(date, "MMM d, yyyy");
}

export function formatDateTime(targetDate: string) {
  const date = new Date(targetDate);
  return format(date, "MMM d, yyyy");
}