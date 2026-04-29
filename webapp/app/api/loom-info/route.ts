import { NextRequest, NextResponse } from "next/server";
import { fetchLoomMeta } from "@/lib/loom";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  try {
    const meta = await fetchLoomMeta(url);
    return NextResponse.json(meta);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch Loom metadata";
    return NextResponse.json({ error: msg }, { status: 422 });
  }
}
