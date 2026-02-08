import { NextRequest, NextResponse } from "next/server";
import { getExternalRatings } from "@/lib/omdb";

export async function GET(request: NextRequest) {
  try {
    const imdbId = request.nextUrl.searchParams.get("imdbId");

    if (!imdbId || !/^tt\d+$/.test(imdbId)) {
      return NextResponse.json({ error: "Invalid IMDB ID" }, { status: 400 });
    }

    const data = await getExternalRatings(imdbId);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch ratings" }, { status: 502 });
  }
}
