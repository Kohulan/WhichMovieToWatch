import { HubPage } from "@/components/seo/HubPage";
import { getRouteMeta } from "@/seo/meta";

export default function TonightPage() {
  return <HubPage meta={getRouteMeta("/what-to-watch-tonight")!} />;
}
