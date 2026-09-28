import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { SHEETS_CACHE_TAG } from "@/lib/config";

/**
 * On-demand refresh after staff edit the sheet: GET or POST /api/revalidate?secret=REVALIDATE_SECRET
 * Called by the "Refresh website" button in the Apps Script menu.
 */
async function handle(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "invalid secret" }, { status: 401 });
  }
  revalidateTag(SHEETS_CACHE_TAG, { expire: 0 });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, revalidated: true, at: new Date().toISOString() });
}

export const GET = handle;
export const POST = handle;
