import { NextResponse } from "next/server";
import type { NextRequest } from "next/request";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Clone response and set modern disaster telemetry headers
  const response = NextResponse.next();
  response.headers.set("x-disaster-platform-region", "NER-INDIA");
  response.headers.set("x-failover-mesh-status", "STANDBY");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets|public).*)",
  ],
};
