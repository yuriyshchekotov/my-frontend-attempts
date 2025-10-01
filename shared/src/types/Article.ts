import { z } from 'zod';

/**
 * Схема полноценной статьи.
 * Содержит идентификатор, дату ISO и текстовые поля.
 */
export const ArticleSchema = z.object({
  id: z.number().int().positive(),
  date: z.string().datetime(),
  title: z.string().min(1).max(200),
  text: z.string().nullable(),
  screenshot: z.string().nullable(),
  source: z.string().nullable(),
  content: z.string().nullable(),
});

/**
 * Схема создания новой статьи.
 * Отсутствуют id и date, допускаются опциональные поля.
 */
export const NewArticleSchema = z.object({
  title: z.string().min(1).max(200),
  text: z.string().nullable().optional(),
  screenshot: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
});

/**
 * Схема обновления статьи: все поля опциональны.
 */
export const UpdateArticleSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  text: z.string().nullable().optional(),
  screenshot: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
});

/** Тип полноценной сущности статьи. */
export type Article = z.infer<typeof ArticleSchema>;
/** Тип данных для создания статьи. */
export type NewArticle = z.infer<typeof NewArticleSchema>;
/** Тип данных для частичного обновления статьи. */
export type UpdateArticle = z.infer<typeof UpdateArticleSchema>;

/** Ответ API со списком статей. */
export interface ArticleListResponse {
  articles: Article[];
  total: number;
  page?: number;
  limit?: number;
}

/** Ответ API для создания статьи. */
export interface ArticleCreateResponse {
  article: Article;
  success: boolean;
}

/** Ответ API для обновления статьи. */
export interface ArticleUpdateResponse {
  article: Article;
  success: boolean;
}

/** Ответ API для удаления статьи. */
export interface ArticleDeleteResponse {
  success: boolean;
  id: number;
}
