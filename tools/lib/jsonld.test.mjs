import { test } from "node:test";
import assert from "node:assert/strict";
import {
  webSiteJsonLd,
  organizationJsonLd,
  itemListJsonLd,
  movieJsonLd,
  breadcrumbJsonLd,
  videoObjectJsonLd,
} from "./jsonld.mjs";

const site = {
  origin: "https://whichmovietowatch.online",
  name: "Which Movie To Watch",
  defaultOgImage: "https://whichmovietowatch.online/og.png",
};

test("webSiteJsonLd", () => {
  const ld = webSiteJsonLd(site);
  assert.equal(ld["@type"], "WebSite");
  assert.equal(ld.url, site.origin + "/");
  assert.equal(ld.name, site.name);
});

test("organizationJsonLd", () => {
  const ld = organizationJsonLd(site);
  assert.equal(ld["@type"], "Organization");
  assert.equal(ld.url, site.origin + "/");
  assert.ok(ld.logo.startsWith(site.origin));
});

test("itemListJsonLd links each movie page by slug", () => {
  const ld = itemListJsonLd({
    movies: [
      { id: 27205, title: "Inception", poster_path: "/a.jpg" },
      { id: 603, title: "The Matrix", poster_path: null },
    ],
    pageUrl: site.origin + "/trending",
    origin: site.origin,
  });
  assert.equal(ld["@type"], "ItemList");
  assert.equal(ld.itemListElement.length, 2);
  assert.equal(ld.itemListElement[0]["@type"], "ListItem");
  assert.equal(ld.itemListElement[0].position, 1);
  assert.equal(
    ld.itemListElement[0].url,
    site.origin + "/movie/inception-27205",
  );
});

test("movieJsonLd includes aggregateRating, trailer, and image", () => {
  const ld = movieJsonLd(
    {
      id: 27205,
      title: "Inception",
      overview: "Dreams.",
      poster_path: "/a.jpg",
      release_date: "2010-07-15",
      vote_average: 8.4,
      vote_count: 34000,
      genres: [{ id: 878, name: "Science Fiction" }],
      credits: {
        crew: [{ name: "Christopher Nolan", job: "Director" }],
        cast: [],
      },
      videos: {
        results: [
          { site: "YouTube", type: "Trailer", key: "YoHD9XEInc0" },
        ],
      },
    },
    site.origin,
  );
  assert.equal(ld["@type"], "Movie");
  assert.equal(ld.url, site.origin + "/movie/inception-27205");
  assert.equal(ld.aggregateRating.ratingValue, 8.4);
  assert.equal(ld.aggregateRating.ratingCount, 34000);
  assert.ok(ld.image.includes("image.tmdb.org"));
  assert.equal(ld.director[0].name, "Christopher Nolan");
  assert.equal(ld.datePublished, "2010-07-15");
  assert.equal(ld.trailer["@type"], "VideoObject");
  assert.equal(ld.trailer.contentUrl, "https://www.youtube.com/watch?v=YoHD9XEInc0");
});

test("movieJsonLd omits aggregateRating when votes are zero", () => {
  const ld = movieJsonLd(
    {
      id: 1,
      title: "X",
      overview: "",
      poster_path: null,
      release_date: "",
      vote_average: 0,
      vote_count: 0,
    },
    site.origin,
  );
  assert.equal(ld.aggregateRating, undefined);
  assert.equal(ld.trailer, undefined);
});

test("videoObjectJsonLd", () => {
  const ld = videoObjectJsonLd(
    { title: "Dune", overview: "Spice.", release_date: "2021-10-22" },
    { key: "n9xhJrPXop4" },
    site.origin,
  );
  assert.equal(ld["@type"], "VideoObject");
  assert.equal(ld.name, "Dune — Official Trailer");
  assert.equal(ld.contentUrl, "https://www.youtube.com/watch?v=n9xhJrPXop4");
  assert.equal(ld.embedUrl, "https://www.youtube.com/embed/n9xhJrPXop4");
  assert.ok(ld.thumbnailUrl[0].includes("n9xhJrPXop4"));
});

test("breadcrumbJsonLd", () => {
  const ld = breadcrumbJsonLd(
    [
      { name: "Home", path: "/" },
      { name: "Trending", path: "/trending" },
    ],
    site.origin,
  );
  assert.equal(ld["@type"], "BreadcrumbList");
  assert.equal(ld.itemListElement[1].position, 2);
  assert.equal(ld.itemListElement[1].item, site.origin + "/trending");
});
