import { decodeJwt } from "jose";
import { NextRequest } from "next/server";

export function isLoggedIn(request: NextRequest): boolean {
  const session = request.cookies.get("session");
  const refreshToken = request.cookies.get("refresh_token");

  if (!(session && refreshToken)) {
    return false;
  }

  const sessionJWT = decodeJwt(session.value);
  const refreshTokenJWT = decodeJwt(refreshToken.value);

  if (!(sessionJWT && refreshTokenJWT)) {
    return false;
  }

  if (!(isTimeValid(sessionJWT.exp, sessionJWT.iat) && isTimeValid(refreshTokenJWT.exp, refreshTokenJWT.iat))) {
    return false;
  }

  return true;
}

function isTimeValid(exp: number | undefined, iat: number | undefined): boolean {
  if (!(exp && iat)) {
    return false;
  }

  if (exp <= iat) {
    return false;
  }

  const now = Math.floor((new Date()).getTime() / 1000);
  if (exp <= now + 60) {
    return false;
  }

  return true;
}
