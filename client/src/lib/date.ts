import { format } from "date-fns";

export function toInputDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}
