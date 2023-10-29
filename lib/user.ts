import { decodeJwt } from "jose";
import { Session } from "~/types/session";
import { User } from "~/types/user";
import { getCookie } from "./utils";

export function getUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const session = getCookie("session");
  if (!session) {
    return null;
  }

  try {
    const payload = decodeJwt(session) as Session;
    const user: User = {
      id: payload.sub,
      name: payload.name,
      username: payload.username,
      email: payload.email,
      photo_url: payload.photo_url,
      two_factor_enabled: payload.two_factor_enabled,
    };

    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
}
