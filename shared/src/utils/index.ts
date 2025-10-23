import { z } from 'zod';

// Validation schemas
export const ArticleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  text: z.string().optional(),
  screenshot: z.string().optional(),
  source: z.string().optional(),
  user_id: z.number().int().positive().optional(),
});

// Схема для создания статьи с файлами (multipart)
export const CreateArticleWithFilesSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  text: z.string().optional(),
  // Файлы обрабатываются отдельно в middleware
});

export const CreateArticleSchema = ArticleSchema;
export const NewArticleSchema = ArticleSchema;
export const UpdateArticleSchema = ArticleSchema.partial();

// Constants
export const SUPPORTED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];
export const SUPPORTED_HTML_EXTENSIONS = ['.html', '.htm'];
export const SUPPORTED_ZIP_EXTENSIONS = ['.zip'];

// MIME types
export const SUPPORTED_IMAGE_MIMES = ['image/png', 'image/jpeg', 'image/jpg'];
export const SUPPORTED_HTML_MIMES = ['text/html'];
export const SUPPORTED_ZIP_MIMES = ['application/zip', 'application/x-zip-compressed'];

// File size limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES_PER_REQUEST = 2;

// Validation functions
export function validateImageExtension(filename: string): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return SUPPORTED_IMAGE_EXTENSIONS.includes(ext);
}

export function validateHtmlExtension(filename: string): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return SUPPORTED_HTML_EXTENSIONS.includes(ext);
}

export function validateZipExtension(filename: string): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return SUPPORTED_ZIP_EXTENSIONS.includes(ext);
}

export function validateFileMimeType(mimetype: string, fieldName: string): boolean {
  if (fieldName === 'screenshot') {
    return SUPPORTED_IMAGE_MIMES.includes(mimetype);
  } else if (fieldName === 'source') {
    return SUPPORTED_HTML_MIMES.includes(mimetype) || SUPPORTED_ZIP_MIMES.includes(mimetype);
  }
  return false;
}

export function validateFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

// Validation functions
export function validateNewArticle(data: any): any {
  const result = NewArticleSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
  }
  return result.data;
}

export function validateUpdateArticle(data: any): any {
  const result = UpdateArticleSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
  }
  return result.data;
}

export function validateId(id: number): number {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('Validation error: ID must be a positive integer');
  }
  return id;
}


// Safe validation function
export function safeValidate<T>(schema: z.ZodSchema<T>, data: any): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { 
      success: false, 
      error: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    };
  }
}
