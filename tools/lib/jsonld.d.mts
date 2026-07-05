interface Site {
  origin: string;
  name: string;
  defaultOgImage: string;
}
interface ListMovie {
  id: number;
  title: string;
  poster_path: string | null;
}
export function webSiteJsonLd(site: Site): object;
export function organizationJsonLd(site: Site): object;
export function itemListJsonLd(args: {
  movies: ListMovie[];
  pageUrl: string;
  origin: string;
}): object;
export function movieJsonLd(movie: object, origin: string): object;
export function breadcrumbJsonLd(
  crumbs: Array<{ name: string; path: string }>,
  origin: string,
): object;
