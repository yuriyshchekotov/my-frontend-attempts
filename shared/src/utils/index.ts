import { z } from 'zod';

// Validation schemas
export const ArticleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  text: z.string().optional(),
  screenshot: z.string().optional(),
  source: z.string().optional(),
});

export const CreateArticleSchema = ArticleSchema;
export const NewArticleSchema = ArticleSchema;
export const UpdateArticleSchema = ArticleSchema.partial();

// Constants
export const SUPPORTED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];
export const SUPPORTED_HTML_EXTENSIONS = ['.html', '.htm'];

// Validation functions
export function validateImageExtension(filename: string): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return SUPPORTED_IMAGE_EXTENSIONS.includes(ext);
}

export function validateHtmlExtension(filename: string): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return SUPPORTED_HTML_EXTENSIONS.includes(ext);
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
