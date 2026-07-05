import { Navigate, useParams } from "react-router";
import { HubPage } from "@/components/seo/HubPage";
import { getRouteMeta } from "@/seo/meta";

export default function ProviderPage() {
  const { providerSlug } = useParams();
  const meta = getRouteMeta(`/streaming/${providerSlug}`);
  if (!meta) return <Navigate to="/browse" replace />;
  return <HubPage meta={meta} />;
}
