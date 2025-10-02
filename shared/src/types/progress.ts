import { z } from 'zod';

// Progress Note interface
export interface ProgressNote {
  id: number;
  user_id: string | null;
  date: string;
  day: string;
  topic: string;
  sessionType: 'чтение' | 'кодинг' | 'мини-проект' | 'повторение';
  practice: string;
  files: string[];
  confidence: number;
  repeat: boolean;
  comment: string | null;
}

// New progress note interface (for creation)
export interface NewProgressNote {
  user_id?: string | null;
  date?: string;
  day: string;
  topic: string;
  sessionType: 'чтение' | 'кодинг' | 'мини-проект' | 'повторение';
  practice: string;
  files?: string[];
  confidence: number;
  repeat: boolean;
  comment?: string | null;
}

// Update progress note interface (for updates)
export interface UpdateProgressNote {
  user_id?: string | null;
  date?: string;
  day?: string;
  topic?: string;
  sessionType?: 'чтение' | 'кодинг' | 'мини-проект' | 'повторение';
  practice?: string;
  files?: string[];
  confidence?: number;
  repeat?: boolean;
  comment?: string | null;
}

// Response interfaces
export interface ProgressNoteListResponse {
  progressNotes: ProgressNote[];
  total: number;
}

export interface ProgressNoteCreateResponse {
  progressNote: ProgressNote;
  success: boolean;
}

// Zod schemas for validation
export const ProgressNoteSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.string().nullable(),
  date: z.string().datetime(),
  day: z.string().min(1, 'Day is required'),
  topic: z.string().min(1, 'Topic is required'),
  sessionType: z.enum(['чтение', 'кодинг', 'мини-проект', 'повторение']),
  practice: z.string().min(1, 'Practice is required'),
  files: z.array(z.string()),
  confidence: z.number().int().min(1).max(5),
  repeat: z.boolean(),
  comment: z.string().nullable(),
});

export const NewProgressNoteSchema = z.object({
  user_id: z.string().nullable().optional(),
  date: z.string().datetime().optional(),
  day: z.string().min(1, 'Day is required'),
  topic: z.string().min(1, 'Topic is required'),
  sessionType: z.enum(['чтение', 'кодинг', 'мини-проект', 'повторение']),
  practice: z.string().min(1, 'Practice is required'),
  files: z.array(z.string()).optional(),
  confidence: z.number().int().min(1).max(5),
  repeat: z.boolean(),
  comment: z.string().nullable().optional(),
});

export const UpdateProgressNoteSchema = NewProgressNoteSchema.partial();

// Validation functions
export function validateNewProgressNote(data: any): any {
  const result = NewProgressNoteSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
  }
  return result.data;
}

export function validateUpdateProgressNote(data: any): any {
  const result = UpdateProgressNoteSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
  }
  return result.data;
}
