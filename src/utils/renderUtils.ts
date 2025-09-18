import * as fs from 'fs-extra';
import * as path from 'path';
import { Article } from '../types/Article';

/**
 * Рендерит HTML для одной статьи
 */
export function renderArticle(article: Article): string {
    let content = '';

    // Заголовок статьи
    content += `<h3>${escapeHtml(article.title)}</h3>\n`;

    // Текст статьи (экранируем)
    if (article.text) {
        content += `<p>${escapeHtml(article.text)}</p>\n`;
    }

    // Если есть source или content → вставляем iframe
    if (article.source || (article.content && article.content.trim().length > 0)) {
        // определяем, откуда брать документ
        const iframeSrc = article.source
            ? `/data/${article.source}`
            : `data:text/html;charset=utf-8,${encodeURIComponent(article.content!)}`;

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
export async function renderBlogPage(articles: Article[]): Promise<string> {
  try {
    // Читаем шаблон
    const templatePath = path.join(process.cwd(), 'src', 'templates', 'blog.html');
    const template = await fs.readFile(templatePath, 'utf-8');
    
    // Рендерим статьи
    const articlesContent = articles.map(renderArticle).join('\n');
    
    // Заменяем плейсхолдер
    const html = template.replace('{{ARTICLES_CONTENT}}', articlesContent);
    
    return html;
  } catch (error) {
    console.error('Ошибка при рендеринге страницы блога:', error);
    throw new Error('Не удалось отрендерить страницу блога');
  }
}

/**
 * Экранирует HTML символы
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

