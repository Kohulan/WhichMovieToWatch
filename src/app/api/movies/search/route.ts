import { NextRequest, NextResponse } from "next/server";
import { SearchParamsSchema } from "@/types/api";
import { searchMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const params = SearchParamsSchema.parse(
      Object.fromEntries(searchParams.entries())
    );

    const data = await searchMovies(params.query, params.page, params.year);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.message.includes("TMDB")) {
      return NextResponse.json({ error: "Failed to search movies" }, { status: 502 });
    }
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }
}
