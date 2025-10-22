import { Request, Response, NextFunction } from 'express';

/**
 * Middleware для логирования тел запросов и ответов
 */
export const apiDebugLogger = (req: Request, res: Response, next: NextFunction) => {
  // Логируем тело запроса
  console.log('API debug - Request:', {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // Перехватываем оригинальный res.json для логирования ответа
  const originalJson = res.json.bind(res);
  
  res.json = function(body: any) {
    console.log('API debug - Response:', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      body: body,
      timestamp: new Date().toISOString()
    });
    return originalJson(body);
  };

  next();
};


