import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDate, formatDistanceToNowStrict } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeDate(from: Date) {
  const currentDate = new Date();
  // if the from is less than a day ago
  if (currentDate.getTime() - from.getTime() < 1000 * 60 * 60 * 24) {
    return formatDistanceToNowStrict(from, { addSuffix: true });
  } else {
    // the from is more than a day ago
    if (currentDate.getFullYear() === from.getFullYear()) {
      return formatDate(from, "MMM dd");
    } else {
      // if the difference is more than a year
      return formatDate(from, "MMM  d, yyy");
    }
  }
}
