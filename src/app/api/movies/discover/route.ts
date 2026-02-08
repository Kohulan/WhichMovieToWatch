import { NextRequest, NextResponse } from "next/server";
import { DiscoverParamsSchema } from "@/types/api";
import { discoverMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const params = DiscoverParamsSchema.parse(
      Object.fromEntries(searchParams.entries())
    );

    const data = await discoverMovies({
      page: params.page,
      genre: params.genre,
      provider: params.provider,
      minRating: params.minRating,
      minVotes: params.minVotes,
      sortBy: params.sortBy,
      year: params.year,
      language: params.language,
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.message.includes("TMDB")) {
      return NextResponse.json({ error: "Failed to fetch movies" }, { status: 502 });
    }
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }
}
