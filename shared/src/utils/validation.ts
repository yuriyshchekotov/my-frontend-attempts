import { z } from 'zod';
import { ArticleSchema, NewArticleSchema, UpdateArticleSchema, FileUploadSchema, FileMetadataSchema  } from '../types';


/**
 * Валидирует объект как полноценную статью согласно ArticleSchema.
 * @param data Неизвестные входные данные
 * @returns Валидный объект Article
 * @throws ZodError если данные не соответствуют схеме
 */
export function validateArticle(data: unknown): z.infer<typeof ArticleSchema> {
  return ArticleSchema.parse(data);
}

/**
 * Валидирует объект как новую статью (без обязательного id и date).
 * @param data Неизвестные входные данные
 * @returns Валидный объект NewArticle
 * @throws ZodError если данные не соответствуют схеме
 */
export function validateNewArticle(data: unknown): z.infer<typeof NewArticleSchema> {
  return NewArticleSchema.parse(data);
}

/**
 * Валидирует объект как частичное обновление статьи.
 * @param data Неизвестные входные данные
 * @returns Валидный объект UpdateArticle
 * @throws ZodError если данные не соответствуют схеме
 */
export function validateUpdateArticle(data: unknown): z.infer<typeof UpdateArticleSchema> {
  return UpdateArticleSchema.parse(data);
}

/**
 * Валидирует входные данные для загрузки файла.
 * Ожидает бинарное содержимое и метаданные файла.
 * @param data Неизвестные входные данные
 * @returns Валидный объект FileUpload
 * @throws ZodError если данные не соответствуют схеме
 */
export function validateFileUpload(data: unknown): z.infer<typeof FileUploadSchema> {
  return FileUploadSchema.parse(data);
}

/**
 * Валидирует метаданные файла из хранилища.
 * @param data Неизвестные входные данные
 * @returns Валидный объект FileMetadata
 * @throws ZodError если данные не соответствуют схеме
 */
export function validateFileMetadata(data: unknown): z.infer<typeof FileMetadataSchema> {
  return FileMetadataSchema.parse(data);
}

/**
 * Безопасная валидация: не выбрасывает исключение, а возвращает результат.
 * Полезно для обработчиков запросов, где нужно вернуть сообщение об ошибке.
 * @param schema Zod-схема для проверки
 * @param data Проверяемые данные
 * @returns Результат с флагом success и данными либо сообщением об ошибке
 */
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

/**
 * Валидирует параметр идентификатора как положительное целое число.
 * @param id Значение идентификатора из запроса/параметров
 * @returns Валидный числовой идентификатор
 * @throws ZodError если значение не число или не положительное целое
 */
export function validateId(id: unknown): number {
  const schema = z.number().int().positive();
  return schema.parse(id);
}

/**
 * Валидирует объект строки запроса как словарь строковых значений.
 * @param query Объект query (например, req.query)
 * @returns Словарь строковых значений
 * @throws ZodError если значения не строки
 */
export function validateQueryString(query: unknown): Record<string, string> {
  const schema = z.record(z.string());
  return schema.parse(query);
}

