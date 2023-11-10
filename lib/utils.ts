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

export const HOST_SETTINGS = {
  expectedOrigin: process.env.VERCEL_URL ?? "http://localhost:3000",
  expectedRPID: process.env.RPID ?? "localhost",
};

export function binaryToBase64url(bytes: Uint8Array) {
  let str = "";

  bytes.forEach((charCode) => {
    str += String.fromCharCode(charCode);
  });

  return btoa(str);
}

export function clean(str: string) {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
