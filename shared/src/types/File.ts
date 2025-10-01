import { z } from 'zod';

/**
 * Схема входных данных для загрузки файла.
 * Содержит бинарные данные и метаданные.
 */
export const FileUploadSchema = z.object({
  filename: z.string().min(1),
  mimetype: z.string(),
  size: z.number().int().positive().max(10 * 1024 * 1024), // 10MB max
  buffer: z.instanceof(Buffer),
});

/**
 * Схема метаданных файла, хранимых в системе.
 */
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

/** Тип входных данных загрузки файла. */
export type FileUpload = z.infer<typeof FileUploadSchema>;
/** Тип метаданных файла. */
export type FileMetadata = z.infer<typeof FileMetadataSchema>;

// Типы для операций с файлами
/** Ответ API при успешной загрузке файла. */
export interface FileUploadResponse {
  file: FileMetadata;
  success: boolean;
}

/** Ответ API при удалении файла. */
export interface FileDeleteResponse {
  success: boolean;
  id: string;
}

/** Ответ API со списком файлов. */
export interface FileListResponse {
  files: FileMetadata[];
  total: number;
}

// Типы для разных адаптеров файлов
/** Конфигурация локального файлового адаптера. */
export interface LocalFileConfig {
  basePath: string;
  maxSize: number;
  allowedTypes: string[];
}

/** Конфигурация облачного хранилища. */
export interface CloudStorageConfig {
  bucketName: string;
  projectId: string;
  credentialsPath?: string;
  maxSize: number;
  allowedTypes: string[];
}
