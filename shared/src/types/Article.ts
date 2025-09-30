import { z } from 'zod';

// Схемы валидации с Zod
export const ArticleSchema = z.object({
  id: z.number().int().positive(),
  date: z.string().datetime(),
  title: z.string().min(1).max(200),
  text: z.string().nullable(),
  screenshot: z.string().nullable(),
  source: z.string().nullable(),
  content: z.string().nullable(),
});

export const NewArticleSchema = z.object({
  title: z.string().min(1).max(200),
  text: z.string().nullable().optional(),
  screenshot: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
});

export const UpdateArticleSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  text: z.string().nullable().optional(),
  screenshot: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
});

// TypeScript типы, выведенные из схем
export type Article = z.infer<typeof ArticleSchema>;
export type NewArticle = z.infer<typeof NewArticleSchema>;
export type UpdateArticle = z.infer<typeof UpdateArticleSchema>;

// Дополнительные типы для API
export interface ArticleListResponse {
  articles: Article[];
  total: number;
  page?: number;
  limit?: number;
}

export interface ArticleCreateResponse {
  article: Article;
  success: boolean;
}

export interface ArticleUpdateResponse {
  article: Article;
  success: boolean;
}

export interface ArticleDeleteResponse {
  success: boolean;
  id: number;
}
