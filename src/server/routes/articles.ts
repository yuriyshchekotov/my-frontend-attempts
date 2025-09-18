import { Router, Request, Response } from 'express';
import { createArticle, getAllArticles } from '../../services/articleService';
import { NewArticle } from '../../types/Article';

const router = Router();

/**
 * GET /articles - Получить все статьи
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const articles = await getAllArticles();
    res.json(articles);
  } catch (error) {
    console.error('Ошибка при получении статей:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

/**
 * POST /articles - Создать новую статью
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const articleData: NewArticle = req.body;
    
    // Валидация базовых полей
    if (!articleData.title || typeof articleData.title !== 'string') {
      return res.status(400).json({ 
        error: 'Поле title обязательно и должно быть строкой' 
      });
    }

    // Создаем статью
    const newArticle = await createArticle(articleData);
    
    res.status(201).json(newArticle);
  } catch (error) {
    console.error('Ошибка при создании статьи:', error);
    
    if (error instanceof Error) {
      // Ошибки валидации возвращаем с кодом 400
      if (error.message.includes('обязательно') || 
          error.message.includes('не найден') || 
          error.message.includes('расширение')) {
        return res.status(400).json({ error: error.message });
      }
    }
    
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router;

