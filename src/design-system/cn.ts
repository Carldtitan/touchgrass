// cn — merge conditional class names, resolving Tailwind conflicts.
// Standard shadcn/ui utility (task 7.2).
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
