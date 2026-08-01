import { twMerge } from "tailwind-merge";

type ClassValue = string | false | null | undefined | Record<string, boolean>;

export function cn(...inputs: ClassValue[]) {
  const classes: string[] = [];
  for (const input of inputs) {
    if (typeof input === "string") {
      classes.push(input);
    } else if (input && typeof input === "object") {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }
  return twMerge(classes.join(" "));
}
