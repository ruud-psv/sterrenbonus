import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, AUTH_TOKEN, PROTECTED_THEMES } from "@/lib/auth";

// Gate the protected (FANdag) theme behind a password — pages AND their API,
// so the trekking can't be triggered by hitting /api/draw directly. Enter the
// password once per device; a cookie keeps it unlocked. Other themes are open.
export function middleware(req: NextRequest) {
  const { pathname, searchParams, search } = req.nextUrl;

  // Never gate the unlock page or its endpoint (would loop).
  if (pathname === "/unlock" || pathname === "/api/unlock") {
    return NextResponse.next();
  }

  const theme = searchParams.get("theme") ?? "psv";
  const isProtected = pathname === "/handleiding" || PROTECTED_THEMES.has(theme);
  if (!isProtected) {
    return NextResponse.next();
  }

  const unlocked = req.cookies.get(AUTH_COOKIE)?.value === AUTH_TOKEN;
  if (unlocked) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Wachtwoord vereist" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/unlock";
  url.search = `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/", "/admin", "/handleiding", "/api/:path*"],
};
