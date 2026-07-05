import { Navigate, useParams } from "react-router";
import { HubPage } from "@/components/seo/HubPage";
import { getRouteMeta } from "@/seo/meta";

export default function GenrePage() {
  const { genreSlug } = useParams();
  const meta = getRouteMeta(`/movies/genre/${genreSlug}`);
  if (!meta) return <Navigate to="/browse" replace />;
  return <HubPage meta={meta} />;
}
