import express from 'express';
import { Request, Response, ErrorRequestHandler } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import { getAllArticles } from '../services/articleService';
import { renderBlogPage } from '../utils/renderUtils';
import articlesRouter from './routes/articles';

dotenv.config();

const app = express();

// Load OpenAPI specification
const swaggerDocument = YAML.load(path.join(process.cwd(), 'openapi.yml'));

const HOST = process.env.HOST || 'localhost';
const PORT = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/data', express.static(path.join(process.cwd(), 'data')));

// Serve OpenAPI documentation with Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API routes
app.use('/articles', articlesRouter);

// Главная страница - рендеринг блога
app.get('/', async (_req, res) => {
    try {
        const articles = await getAllArticles();
        const html = await renderBlogPage(articles);
        res.send(html);
    } catch (error) {
        console.error('❌ Ошибка при рендеринге главной страницы:', error);
        res.status(500).send(`
      <html>
        <head><title>Ошибка</title></head>
        <body>
          <h1>Ошибка сервера</h1>
          <p>Не удалось загрузить страницу блога</p>
        </body>
      </html>
    `);
    }
});

app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Страница не найдена' });
});

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error('🔥 Ошибка сервера:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
};
app.use(errorHandler)

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен (режим: ${NODE_ENV})`);
    console.log(`🏠 Главная страница: http://${HOST}:${PORT}`);
    console.log(`📚 API документация: http://${HOST}:${PORT}/api-docs`);
});

export default app;

