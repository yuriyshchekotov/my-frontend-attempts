import * as fs from 'fs-extra';
import * as path from 'path';
import * as he from 'he';

/**
 * Проверяет существование файла
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Проверяет, что файл имеет допустимое расширение изображения
 */
export function isValidImageExtension(filePath: string): boolean {
  const validExtensions = ['.png', '.jpg', '.jpeg'];
  const ext = path.extname(filePath).toLowerCase();
  return validExtensions.includes(ext);
}

/**
 * Читает HTML файл и экранирует его содержимое
 */
export async function readAndEscapeHtml(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return he.encode(content);
  } catch (error) {
    throw new Error(`Не удалось прочитать файл ${filePath}: ${error}`);
  }
}

/**
 * Получает полный путь к файлу в директории data
 */
export function getDataFilePath(relativePath: string): string {
  return path.join(process.cwd(), 'data', relativePath);
}

