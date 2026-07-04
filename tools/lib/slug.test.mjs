import { test } from "node:test";
import assert from "node:assert/strict";
import { movieSlug, parseMovieIdFromSlug } from "./slug.mjs";

test("movieSlug kebab-cases the title and appends the id", () => {
  assert.equal(movieSlug({ id: 27205, title: "Inception" }), "inception-27205");
  assert.equal(movieSlug({ id: 603, title: "The Matrix" }), "the-matrix-603");
});

test("movieSlug strips punctuation, diacritics, and collapses dashes", () => {
  assert.equal(
    movieSlug({ id: 121, title: "The Lord of the Rings: The Two Towers" }),
    "the-lord-of-the-rings-the-two-towers-121",
  );
  assert.equal(movieSlug({ id: 194, title: "Amélie" }), "amelie-194");
  assert.equal(
    movieSlug({ id: 680, title: "Pulp  Fiction!!" }),
    "pulp-fiction-680",
  );
});

test("movieSlug survives empty/symbol-only titles", () => {
  assert.equal(movieSlug({ id: 42, title: "***" }), "movie-42");
});

test("parseMovieIdFromSlug extracts the trailing id", () => {
  assert.equal(parseMovieIdFromSlug("inception-27205"), 27205);
  assert.equal(parseMovieIdFromSlug("the-matrix-603"), 603);
  assert.equal(parseMovieIdFromSlug("movie-42"), 42);
});

test("parseMovieIdFromSlug returns null for garbage", () => {
  assert.equal(parseMovieIdFromSlug("no-id-here-abc"), null);
  assert.equal(parseMovieIdFromSlug(""), null);
  assert.equal(parseMovieIdFromSlug("12x"), null);
});
