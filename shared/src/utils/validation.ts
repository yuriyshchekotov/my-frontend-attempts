import { z } from 'zod';
import { ArticleSchema, NewArticleSchema, UpdateArticleSchema } from '../types/Article';
import { FileUploadSchema, FileMetadataSchema } from '../types/File';

// Валидация статей
export function validateArticle(data: unknown): z.infer<typeof ArticleSchema> {
  return ArticleSchema.parse(data);
}

export function validateNewArticle(data: unknown): z.infer<typeof NewArticleSchema> {
  return NewArticleSchema.parse(data);
}

export function validateUpdateArticle(data: unknown): z.infer<typeof UpdateArticleSchema> {
  return UpdateArticleSchema.parse(data);
}

// Валидация файлов
export function validateFileUpload(data: unknown): z.infer<typeof FileUploadSchema> {
  return FileUploadSchema.parse(data);
}

export function validateFileMetadata(data: unknown): z.infer<typeof FileMetadataSchema> {
  return FileMetadataSchema.parse(data);
}

// Безопасная валидация с обработкой ошибок
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
    }
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
}

// Валидация ID
export function validateId(id: unknown): number {
  const schema = z.number().int().positive();
  return schema.parse(id);
}

// Валидация строки запроса
export function validateQueryString(query: unknown): Record<string, string> {
  const schema = z.record(z.string());
  return schema.parse(query);
}
