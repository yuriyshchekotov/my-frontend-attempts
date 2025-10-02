// Article interface
export interface Article {
  id: number;
  date: string;
  title: string;
  text: string | null;
  screenshot: string | null;
  source: string | null;
  content: string | null;
}

// New article interface (for creation)
export interface NewArticle {
  title: string;
  text?: string;
  screenshot?: string;
  source?: string;
}

// Update article interface (for updates)
export interface UpdateArticle {
  title?: string;
  text?: string;
  screenshot?: string;
  source?: string;
}

// Response interfaces
export interface ArticleListResponse {
  articles: Article[];
  total: number;
}

export interface ArticleCreateResponse {
  article: Article;
  success: boolean;
}

// File interface
export interface File {
  name: string;
  path: string;
  size: number;
  type: string;
}

// Storage interface
export interface StorageConfig {
  mode: 'local' | 'cloud';
  local?: {
    path: string;
  };
  cloud?: {
    projectId: string;
    credentials: string;
    collection: string;
    bucket: string;
  };
}

// File metadata interface
export interface FileMetadata {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified: Date;
}

// File upload interface
export interface FileUpload {
  name: string;
  filename: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

// Storage result interface
export interface StorageResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Progress Note interfaces and schemas
export * from './progress';
