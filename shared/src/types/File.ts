import { z } from 'zod';

// Схемы валидации для файлов
export const FileUploadSchema = z.object({
  filename: z.string().min(1),
  mimetype: z.string(),
  size: z.number().int().positive().max(10 * 1024 * 1024), // 10MB max
  buffer: z.instanceof(Buffer),
});

export const FileMetadataSchema = z.object({
  id: z.string(),
  filename: z.string(),
  originalName: z.string(),
  mimetype: z.string(),
  size: z.number().int().positive(),
  path: z.string(),
  url: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// TypeScript типы
export type FileUpload = z.infer<typeof FileUploadSchema>;
export type FileMetadata = z.infer<typeof FileMetadataSchema>;

// Типы для операций с файлами
export interface FileUploadResponse {
  file: FileMetadata;
  success: boolean;
}

export interface FileDeleteResponse {
  success: boolean;
  id: string;
}

export interface FileListResponse {
  files: FileMetadata[];
  total: number;
}

// Типы для разных адаптеров файлов
export interface LocalFileConfig {
  basePath: string;
  maxSize: number;
  allowedTypes: string[];
}

export interface CloudStorageConfig {
  bucketName: string;
  projectId: string;
  credentialsPath?: string;
  maxSize: number;
  allowedTypes: string[];
}
