import { base64url } from "jose";
import { NextRequest, NextResponse, userAgent } from "next/server";
import { isLoggedIn } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const loggedIn = isLoggedIn(request);
  const { device, os } = userAgent(request);

  switch (path) {
    case "/":
      if (!loggedIn) {
        return NextResponse.rewrite(new URL("/login", request.url));
      }
      break;
    case "/login":
      if (loggedIn) {
        return NextResponse.rewrite(new URL("/", request.url));
      }
      break;
  }

  const ua = {
    device: {
      vendor: device.vendor ?? "",
      model: device.model ?? "",
    },
    os: {
      name: os.name ?? "",
      version: os.version ?? "",
    },
  };

  const response = NextResponse.next();
  if (request.cookies.get("ua") === undefined) {
    response.cookies.set({
      name: "ua",
      value: base64url.encode(JSON.stringify(ua)),
      path: "/",
      maxAge: 10 * 60,
      httpOnly: false,
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/login",
  ],
};
