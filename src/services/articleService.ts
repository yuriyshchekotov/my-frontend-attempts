import * as fs from 'fs-extra';
import * as path from 'path';
import { JSDOM } from 'jsdom';
import { Article, NewArticle } from '../types/Article';
import { fileExists, isValidImageExtension, getDataFilePath } from '../utils/fileUtils';

const ARTICLES_FILE = path.join(process.cwd(), 'data', 'articles.json');

/**
 * Загружает статьи из файла
 */
export async function loadArticles(): Promise<Article[]> {
    try {
        if (await fileExists(ARTICLES_FILE)) {
            const data = await fs.readFile(ARTICLES_FILE, 'utf-8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.error('Ошибка при загрузке статей:', error);
        return [];
    }
}

/**
 * Сохраняет статьи в файл
 */
export async function saveArticles(articles: Article[]): Promise<void> {
    try {
        await fs.ensureDir(path.dirname(ARTICLES_FILE));
        await fs.writeFile(ARTICLES_FILE, JSON.stringify(articles, null, 2));
    } catch (error) {
        console.error('Ошибка при сохранении статей:', error);
        throw new Error('Не удалось сохранить статьи');
    }
}

/**
 * Генерирует новый ID для статьи
 */
export async function generateNewId(): Promise<number> {
    const articles = await loadArticles();
    if (articles.length === 0) {
        return 1;
    }
    return Math.max(...articles.map(a => a.id)) + 1;
}

/**
 * Валидирует данные новой статьи
 */
export async function validateNewArticle(data: NewArticle): Promise<void> {
    if (!data.title || data.title.trim().length === 0) {
        throw new Error('Поле title обязательно для заполнения');
    }

    if (data.screenshot) {
        const screenshotPath = getDataFilePath(data.screenshot);
        if (!(await fileExists(screenshotPath))) {
            throw new Error(`Файл скриншота не найден: ${data.screenshot}`);
        }
        if (!isValidImageExtension(data.screenshot)) {
            throw new Error('Файл скриншота должен иметь расширение .png, .jpg или .jpeg');
        }
    }

    if (data.source) {
        const sourcePath = getDataFilePath(data.source);
        if (!(await fileExists(sourcePath))) {
            throw new Error(`Исходный файл не найден: ${data.source}`);
        }
    }
}

/**
 * Создает новую статью
 */
export async function createArticle(data: NewArticle): Promise<Article> {
    await validateNewArticle(data);
    const articles = await loadArticles();
    const id = await generateNewId();

    let content: string | null = null;

    if (data.source) {
        const sourcePath = getDataFilePath(data.source);
        const rawHtml = await fs.readFile(sourcePath, 'utf-8');

        // Парсим документ и берём только содержимое body
        const dom = new JSDOM(rawHtml);
        content = dom.window.document.body.innerHTML.trim();
    }

    const newArticle: Article = {
        id,
        date: new Date().toISOString(),
        title: data.title.trim(),
        text: data.text || null,
        screenshot: data.screenshot || null,
        source: data.source || null,
        content,
    };

    articles.push(newArticle);
    await saveArticles(articles);

    return newArticle;
}

/**
 * Получает все статьи
 */
export async function getAllArticles(): Promise<Article[]> {
    return await loadArticles();
}
