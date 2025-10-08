import * as fs from 'fs-extra';
import * as path from 'path';
import { Article } from '@frontend-learning/shared';

/**
 * Движок шаблонов для рендеринга HTML страниц
 */
export class TemplateEngine {
  private templatesDir: string;

  /**
   * @param templatesDir Путь к директории с HTML шаблонами
   */
  constructor(templatesDir: string) {
    this.templatesDir = templatesDir;
  }

  /**
   * Рендерит HTML для одной статьи
   * @param article Объект статьи для рендеринга
   * @returns HTML-строка статьи
   */
  renderArticle(article: Article): string {
    let content = '';

    // Заголовок статьи
    content += `<h3>${this.escapeHtml(article.title)}</h3>\n`;

    // Текст статьи (экранируем)
    if (article.text) {
      content += `<p>${this.escapeHtml(article.text)}</p>\n`;
    }

    // HTML из source или content
    if (article.source) {
      // Убираем ведущий слэш если есть, чтобы избежать двойных слэшей
      const cleanSource = article.source.startsWith('/') ? article.source.slice(1) : article.source;
      const iframeSrc = `/data/${cleanSource}`;
      content += `
        <div class="inner-html-block">
            <div class="inner-html-label">HTML из урока:</div>
            <iframe
                src="${iframeSrc}"
                class="inner-html-preview"
                width="100%"
                frameborder="0"
                onload="this.style.height = this.contentWindow.document.documentElement.scrollHeight + 'px'">
            </iframe>
        </div>\n`;
    } else if (article.content && article.content.trim().length > 0) {
      const dataUri = `data:text/html;charset=utf-8,${encodeURIComponent(article.content)}`;
      content += `
        <div class="inner-html-block">
            <div class="inner-html-label">HTML из урока:</div>
            <iframe
                src="${dataUri}"
                class="inner-html-preview"
                width="100%"
                frameborder="0"
                onload="this.style.height = this.contentWindow.document.documentElement.scrollHeight + 'px'">
            </iframe>
        </div>\n`;
    }

    // Скриншот
    if (article.screenshot) {
      // Убираем ведущий слэш если есть, чтобы избежать двойных слэшей
      const cleanScreenshot = article.screenshot.startsWith('/') ? article.screenshot.slice(1) : article.screenshot;
      const screenshotPath = `/data/${cleanScreenshot}`;
      content += `<img src="${screenshotPath}" alt="Скриншот статьи" />\n`;
    }

    // Подвал
    const date = new Date(article.date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    content += `<footer>\n`;
    content += `    <small>Опубликовано: ${date}</small>\n`;
    content += `</footer>\n`;

    return `<article>\n${content}</article>\n`;
  }

  /**
   * Рендерит полную HTML страницу блога
   * @param articles Массив статей для отображения
   * @returns HTML-строка страницы блога
   */
  async renderBlogPage(articles: Article[], apiUrl: string): Promise<string> {
      try {
          const templatePath = path.join(this.templatesDir, 'blog.html');
          let template = await fs.readFile(templatePath, 'utf-8');

          // Рендерим статьи
          const articlesContent = articles.map(article => this.renderArticle(article)).join('\n');

          // Подставляем плейсхолдеры (в нормальных проектах так не делают)
          // TODO: Кэшировать шаблон
          template = template.replace('{{ARTICLES_CONTENT}}', articlesContent);
          template = template.replace(/\{\{API_URL\}\}/g, apiUrl);

          return template;
      } catch (error) {
          console.error('Ошибка при рендеринге страницы блога:', error);
          throw new Error('Не удалось отрендерить страницу блога');
      }
  }

  /**
   * Рендерит страницу создания статьи
   * @returns HTML-строка страницы создания
   */
  async renderCreatePage(): Promise<string> {
    try {
      const templatePath = path.join(this.templatesDir, 'create.html');
      return await fs.readFile(templatePath, 'utf-8');
    } catch (error) {
      console.error('Ошибка при рендеринге страницы создания:', error);
      throw new Error('Не удалось отрендерить страницу создания статьи');
    }
  }

  /**
   * Рендерит страницу записей прогресса
   * @param apiUrl URL API сервиса для подстановки в шаблон
   * @returns HTML-строка страницы записей прогресса
   */
  async renderProgressNotesPage(apiUrl: string): Promise<string> {
    try {
      const templatePath = path.join(this.templatesDir, 'progress-notes.html');
      let template = await fs.readFile(templatePath, 'utf-8');
      
      // Подставляем API_URL в шаблон (заменяем все вхождения)
      template = template.replace(/\{\{API_URL\}\}/g, apiUrl);
      
      return template;
    } catch (error) {
      console.error('Ошибка при рендеринге страницы записей прогресса:', error);
      throw new Error('Не удалось отрендерить страницу записей прогресса');
    }
  }

  /**
   * Рендерит HTML шаблон с данными
   * @param templateName Имя шаблона (например, 'login.html')
   * @param data Данные для подстановки в шаблон
   * @returns HTML-строка
   */
  async renderTemplate(templateName: string, data: Record<string, any> = {}): Promise<string> {
    try {
      const templatePath = path.join(this.templatesDir, templateName);
      let template = await fs.readFile(templatePath, 'utf-8');

      // Простая подстановка данных в шаблон
      // Заменяем {{key}} на значение из data
      for (const [key, value] of Object.entries(data)) {
        const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        template = template.replace(placeholder, String(value || ''));
      }

      return template;
    } catch (error) {
      console.error(`Ошибка при рендеринге шаблона ${templateName}:`, error);
      throw new Error(`Не удалось отрендерить шаблон ${templateName}`);
    }
  }

  /**
   * Экранирует HTML символы для безопасности
   * @param text Исходный текст
   * @returns Экранированный текст
   */
  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}

