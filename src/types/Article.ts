export interface Article {
  id: number;              // автоинкремент
  date: string;            // ISO
  title: string;
  text: string | null;
  screenshot: string | null;
  source: string | null;
  content: string | null;  // экранированный HTML, если source найден
}

export interface NewArticle {
  title: string;
  text?: string | null;
  screenshot?: string | null;
  source?: string | null;
  //TODO: нужно добавить флаг render_from_source, который будет определять просто, записывается ли source в базу, или просто служит инструкцией, куда один раз посмотреть, чтобы записать html
}

