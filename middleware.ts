import { NextRequest, NextResponse } from "next/server";
import { isLoggedIn } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const loggedIn = isLoggedIn(request);

  switch (path) {
    case "/":
      if (!loggedIn) {
        return NextResponse.rewrite(new URL("/login", request.url));
      }
    case "/login":
      if (loggedIn) {
        return NextResponse.rewrite(new URL("/", request.url));
      }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
  ],
};
