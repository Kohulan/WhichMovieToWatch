import { NextResponse } from "next/server";
import { getTrending } from "@/lib/tmdb";

export async function GET() {
  try {
    const data = await getTrending();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch trending" }, { status: 502 });
  }
}
