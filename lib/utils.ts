import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCookie(name: string) {
  function escape(s: string) {
    return s.replace(/([.*+?\^$(){}|\[\]\/\\])/g, "\\$1");
  }
  var match = document.cookie.match(RegExp("(?:^|;\\s*)" + escape(name) + "=([^;]*)"));
  return match ? match[1] : null;
}
