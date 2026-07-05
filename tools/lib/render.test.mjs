import { test } from "node:test";
import assert from "node:assert/strict";
import { renderListBody, renderMovieBody } from "./render.mjs";

const site = {
  origin: "https://whichmovietowatch.online",
  name: "Which Movie To Watch",
};
const movies = [
  {
    id: 27205,
    title: "Inception",
    poster_path: "/a.jpg",
    release_date: "2010-07-15",
    vote_average: 8.4,
  },
  {
    id: 603,
    title: "The Matrix",
    poster_path: null,
    release_date: "1999-03-30",
    vote_average: 8.2,
  },
];

test("renderListBody renders h1, intro, links, posters, nav", () => {
  const html = renderListBody({
    entry: {
      path: "/trending",
      h1: "Trending movies right now",
      intro: "The intro text.",
    },
    movies,
    site,
  });
  assert.ok(html.includes("<h1>Trending movies right now</h1>"));
  assert.ok(html.includes("The intro text."));
  assert.ok(html.includes('href="/movie/inception-27205"'));
  assert.ok(html.includes("image.tmdb.org/t/p/w342/a.jpg"));
  assert.ok(html.includes('href="/what-to-watch-tonight"'), "site nav present");
  assert.ok(html.includes("Inception (2010)") || html.includes("Inception"));
});

test("renderMovieBody renders movie facts and breadcrumbs", () => {
  const html = renderMovieBody({
    movie: {
      id: 27205,
      title: "Inception",
      overview: "A thief who steals corporate secrets…",
      poster_path: "/a.jpg",
      release_date: "2010-07-15",
      runtime: 148,
      vote_average: 8.4,
      vote_count: 34000,
      genres: [{ id: 878, name: "Science Fiction" }],
    },
    site,
  });
  assert.ok(html.includes("<h1>Inception (2010)</h1>"));
  assert.ok(html.includes("Science Fiction"));
  assert.ok(html.includes("148 min"));
  assert.ok(html.includes("A thief who steals corporate secrets"));
  assert.ok(html.includes('href="/"'));
  assert.ok(html.includes("8.4"));
});

test("bodies escape HTML in titles", () => {
  const html = renderListBody({
    entry: { path: "/x", h1: "X", intro: "i" },
    movies: [
      {
        id: 1,
        title: `<script>alert("x")</script>`,
        poster_path: null,
        release_date: "",
        vote_average: 0,
      },
    ],
    site,
  });
  assert.ok(!html.includes("<script>alert"));
});

test("movie posters escape the poster_path so it cannot break the src attribute", () => {
  const html = renderListBody({
    entry: { path: "/x", h1: "X", intro: "i" },
    movies: [
      {
        id: 2,
        title: "Quote Test",
        poster_path: '/x".jpg',
        release_date: "2020-01-01",
        vote_average: 5,
      },
    ],
    site,
  });
  assert.ok(html.includes("&quot;"));
  assert.ok(!html.includes('/x".jpg'));
});

test("renderMovieBody rating has no NaN when vote_average is missing but vote_count is set", () => {
  const html = renderMovieBody({
    movie: {
      id: 5,
      title: "No Rating Data",
      overview: "test",
      poster_path: null,
      release_date: "2021-01-01",
      runtime: 100,
      vote_average: undefined,
      vote_count: 10,
      genres: [],
    },
    site,
  });
  assert.ok(!html.includes("NaN"));
});
