import { NextResponse, type NextRequest } from "next/server";
import { REF_COOKIE, REF_COOKIE_MAX_AGE, UTM_COOKIE } from "@/lib/config";

/**
 * - ?ref=<agent_id> on any link stores the agent for 30 days, so that visitor's leads go to that agent.
 * - First-touch utm_source / utm_campaign are kept for the session and written onto lead rows.
 */
export function proxy(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const ref = searchParams.get("ref");
  const utmSource = searchParams.get("utm_source");
  if (!ref && !utmSource) return NextResponse.next();

  const res = NextResponse.next();
  if (ref && /^[A-Za-z0-9_-]{1,20}$/.test(ref)) {
    res.cookies.set(REF_COOKIE, ref.toUpperCase(), { maxAge: REF_COOKIE_MAX_AGE, path: "/", sameSite: "lax", httpOnly: true, secure: req.nextUrl.protocol === "https:" });
  }
  if (utmSource && !req.cookies.get(UTM_COOKIE)) {
    const value = JSON.stringify({ utm_source: utmSource.slice(0, 120), utm_campaign: (searchParams.get("utm_campaign") ?? "").slice(0, 120) });
    res.cookies.set(UTM_COOKIE, value, { path: "/", sameSite: "lax", httpOnly: true, secure: req.nextUrl.protocol === "https:" });
  }
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sample/|.*\\.(?:svg|png|jpg|jpeg|webp|avif|ico|txt|xml)$).*)"],
};
