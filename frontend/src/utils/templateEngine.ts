import * as fs from 'fs-extra';
import * as path from 'path';
import { Article } from '@frontend-learning/shared';

/**
 * Движок шаблонов для рендеринга HTML страниц
 */
export class TemplateEngine {
  private templatesDir: string;

  constructor(templatesDir: string) {
    this.templatesDir = templatesDir;
  }

  /**
   * Рендерит HTML для одной статьи
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
      const iframeSrc = `/data/${article.source}`;
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
      const screenshotPath = `/data/${article.screenshot}`;
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
   */
  async renderBlogPage(articles: Article[]): Promise<string> {
    try {
      // Читаем шаблон
      const templatePath = path.join(this.templatesDir, 'blog.html');
      const template = await fs.readFile(templatePath, 'utf-8');
      
      // Рендерим статьи
      const articlesContent = articles.map(article => this.renderArticle(article)).join('\n');
      
      // Заменяем плейсхолдер
      const html = template.replace('{{ARTICLES_CONTENT}}', articlesContent);
      
      return html;
    } catch (error) {
      console.error('Ошибка при рендеринге страницы блога:', error);
      throw new Error('Не удалось отрендерить страницу блога');
    }
  }

  /**
   * Рендерит страницу создания статьи
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
   * Экранирует HTML символы
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
