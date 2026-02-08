import { z } from "zod";

export const DiscoverParamsSchema = z.object({
  page: z.coerce.number().min(1).max(500).default(1),
  genre: z.string().optional(),
  provider: z.string().optional(),
  minRating: z.coerce.number().min(0).max(10).default(6.0),
  minVotes: z.coerce.number().min(0).default(500),
  sortBy: z.string().default("popularity.desc"),
  year: z.coerce.number().optional(),
  language: z.string().optional(),
});

export const SearchParamsSchema = z.object({
  query: z.string().min(1).max(200),
  page: z.coerce.number().min(1).max(500).default(1),
  year: z.coerce.number().optional(),
});

export const MovieIdSchema = z.object({
  id: z.coerce.number().positive(),
});

export type DiscoverParams = z.infer<typeof DiscoverParamsSchema>;
export type SearchParams = z.infer<typeof SearchParamsSchema>;
