// Константы приложения
export const APP_CONSTANTS = {
  // Размеры файлов
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  
  // Разрешенные типы файлов
  ALLOWED_IMAGE_TYPES: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  ALLOWED_DOCUMENT_TYPES: ['.html', '.htm', '.txt', '.md'],
  
  // Пагинация
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // API
  API_VERSION: 'v1',
  DEFAULT_TIMEOUT: 30000, // 30 секунд
  
  // Хранилище
  LOCAL_DB_FILE: 'articles.json',
  LOCAL_FILES_DIR: 'days',
  FIREBASE_COLLECTION: 'articles',
} as const;

// Режимы работы Storage
export const STORAGE_MODES = {
  LOCAL: 'local',
  CLOUD: 'cloud',
} as const;

export type StorageMode = typeof STORAGE_MODES[keyof typeof STORAGE_MODES];

// HTTP статусы
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Типы ошибок
export const ERROR_TYPES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  FILE_ERROR: 'FILE_ERROR',
} as const;
