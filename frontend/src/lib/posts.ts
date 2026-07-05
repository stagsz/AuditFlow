import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), '..', 'marketing', 'blog');

export interface PostMeta {
  slug: string;
  title: string;
  summary: string;
  date: string;
  theme: string;
}

const THEME_ALIASES: Record<string, string> = {
  process: 'process',
  implementation: 'dev',
  product: 'product',
  dev: 'dev',
};

function normalizeTheme(raw: string): string {
  const key = raw.trim().toLowerCase();
  return THEME_ALIASES[key] ?? key;
}

function excerptFromContent(content: string, max = 180): string {
  const cleaned = content
    .replace(/[#*_`>\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max).trim()}...`;
}

export async function readPostMarkdown(slug: string) {
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  const raw = await fs.readFile(filePath, 'utf8');
  return matter(raw);
}

export async function getPosts(): Promise<PostMeta[]> {
  const files = await fs.readdir(POSTS_DIR);
  const entries = await Promise.all(
    files
      .filter((f) => f.endsWith('.md'))
      .filter((f) => !/^APPROVAL-REVIEW/i.test(f))
      .map(async (file) => {
        const slug = file.slice(0, -3);
        const raw = await fs.readFile(path.join(POSTS_DIR, file), 'utf8');
        const { data, content } = matter(raw);
        const dateRaw =
          typeof data.date === 'string'
            ? data.date
            : data.publishedDate ??
              data.published ??
              (await fs.stat(path.join(POSTS_DIR, file))).mtime;
        const date =
          dateRaw instanceof Date
            ? dateRaw.toISOString().slice(0, 10)
            : typeof dateRaw === 'string'
              ? dateRaw
              : new Date(dateRaw).toISOString().slice(0, 10);
        const title =
          typeof data.title === 'string' && data.title.trim().length > 0
            ? data.title.trim()
            : content.split('\n').find((line) => line.trim().startsWith('# '))?.replace(/^#+\s*/, '').trim() ?? slug;
        const summary =
          typeof data.excerpt === 'string' && data.excerpt.trim().length > 0
            ? data.excerpt.trim()
            : typeof data.description === 'string' && data.description.trim().length > 0
              ? data.description.trim()
              : excerptFromContent(content);
        const theme = normalizeTheme(typeof data.theme === 'string' ? data.theme : 'product');
        return { slug, title, summary, date, theme };
      }),
  );

  return entries.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));
}
