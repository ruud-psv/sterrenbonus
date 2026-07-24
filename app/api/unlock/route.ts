import { NextResponse } from "next/server";
import { FANDAG_PASSWORD, AUTH_COOKIE, AUTH_TOKEN } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const password = (body as { password?: unknown }).password;

  if (password !== FANDAG_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, AUTH_TOKEN, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dagen
  });
  return res;
}
