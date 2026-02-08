import { NextRequest, NextResponse } from "next/server";
import { getMovieDetail } from "@/lib/tmdb";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const movieId = parseInt(id, 10);

    if (isNaN(movieId) || movieId <= 0) {
      return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
    }

    const data = await getMovieDetail(movieId);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch movie" }, { status: 502 });
  }
}
