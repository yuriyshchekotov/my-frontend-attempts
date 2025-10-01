// src/server/routes/articles.ts
import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs-extra';
import multer from 'multer';
import sanitize from 'sanitize-filename';

import { createArticle, getAllArticles } from '../../services/articleService';
import { NewArticle } from '../../types/Article';

const router = Router();

// Базовая папка для загрузок
const UPLOAD_DIR_ABS = path.join(process.cwd(), 'data', 'days', '.from-form');

// Убедимся, что папка существует
fs.ensureDirSync(UPLOAD_DIR_ABS);

// Настройка multer: безопасное имя + директория
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR_ABS),
    filename: (_req, file, cb) => {
        const safe = sanitize(file.originalname).replace(/\s+/g, '_');
        // на случай коллизии — добавим таймштамп
        const ext = path.extname(safe);
        const base = path.basename(safe, ext);
        const finalName = `${base}-${Date.now()}${ext}`;
        cb(null, finalName);
    }
});

const upload = multer({
    storage,
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const ok = ['.html', '.htm', '.png', '.jpg', '.jpeg'].includes(ext);
        if (!ok) return cb(new Error('Допустимы только .html/.htm/.png/.jpg/.jpeg'));
        cb(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

// GET /articles — без изменений
router.get('/', async (_req: Request, res: Response) => {
    try {
        const articles = await getAllArticles();
        res.json(articles);
    } catch (error) {
        console.error('Ошибка при получении статей:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// POST /articles — multipart
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
    try {
        // текстовые поля из multipart
        const title = String(req.body.title ?? '').trim();
        const text = (req.body.text ?? null) as string | null;

        if (!title) {
            return res.status(400).json({ error: 'Поле title обязательно и должно быть строкой' });
        }

        // подготовим объект для createArticle
        const payload: NewArticle = {
            title,
            text,
            screenshot: null,
            source: null
        };

        // если пришёл файл — определим тип и относительный путь
        if (req.file) {
            const rel = path.posix.join('days', '.from-form', req.file.filename); // относительный путь для статики
            const ext = path.extname(req.file.filename).toLowerCase();

            if (ext === '.html' || ext === '.htm') {
                payload.source = rel;          // html-файл: это source
            } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
                payload.screenshot = rel;      // картинка: это screenshot
            } else {
                return res.status(400).json({ error: 'Неподдерживаемый тип файла' });
            }
        } else {
            // файла нет — оставляем как есть (можно будет создать пост только с text/title)
        }

        // создаём статью
        const newArticle = await createArticle(payload);
        res.status(201).json(newArticle);

    } catch (error) {
        console.error('Ошибка при создании статьи:', error);
        if (error instanceof Error) {
            if (error.message.includes('обязательно') ||
                error.message.includes('не найден') ||
                error.message.includes('расширение') ||
                error.message.includes('Допустимы только')) {
                return res.status(400).json({ error: error.message });
            }
        }
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

export default router;
