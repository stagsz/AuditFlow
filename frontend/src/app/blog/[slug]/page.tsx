
import Link from 'next/link';
import { notFound } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';

const POSTS_DIR = path.join(process.cwd(), '..', 'marketing', 'blog');

const posts = [
  {
    slug: 'iso-9001-self-assessment-checklist',
    title: 'ISO 9001 self-assessment checklist for small teams',
    summary:
      'A practical checklist covering scope, interested parties, risk-based thinking, and operational controls for SMEs running internal audits.',
    date: '2026-06-18',
    theme: 'process',
  },
  {
    slug: 'ncr-tracking-best-practices',
    title: 'NCR tracking best practices that actually close the loop',
    summary:
      'Why most NCR registers become paper trails, and a lightweight workflow for root cause, action planning, and effectiveness verification.',
    date: '2026-05-29',
    theme: 'dev',
  },
  {
    slug: 'internal-audit-program',
    title: 'How to build a repeatable internal audit program',
    summary:
      'From clause mapping to schedule optimization and auditor assignment — the framework we use inside AuditFlow customers.',
    date: '2026-04-12',
    theme: 'product',
  },
];

const palette = {
  product: { fg: '#0e1117', bg: '#f9f8f6', accent: '#0f766e' },
  process: { fg: '#0e1117', bg: '#f9f8f6', accent: '#b45309' },
  dev: { fg: '#0e1117', bg: '#f9f8f6', accent: '#1d4ed8' },
} as const;

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) notFound();

  const c = palette[post.theme as keyof typeof palette] ?? palette.product;

  return (
    <div className="min-h-screen bg-[#f9f8f6] text-[#0e1117] antialiased">
      <nav className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-[#e4e2dd] bg-[#f9f8f6]/88 px-6 md:px-10 backdrop-blur-md">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Audit<span className="text-[#0f766e]">Flow</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm text-[#6b7280] hover:text-[#0e1117]">Features</Link>
          <Link href="#how" className="text-sm text-[#6b7280] hover:text-[#0e1117]">How it works</Link>
          <Link href="#pricing" className="text-sm text-[#6b7280] hover:text-[#0e1117]">Pricing</Link>
          <Link href="/blog" className="text-sm font-medium text-[#0e1117]">Blog</Link>
          <Link href="/register" className="rounded-md bg-[#0e1117] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f766e]">Start 30-day free trial</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 pt-28 pb-20 md:px-10">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#0e1117]">
          <span aria-hidden>←</span> Back to blog
        </Link>

        <article className="mt-8">
          <div className="text-xs font-medium uppercase tracking-[0.08em]" style={{ color: c.accent }}>
            {post.theme === 'product' && 'Product'}
            {post.theme === 'process' && 'Process'}
            {post.theme === 'dev' && 'Implementation'}
          </div>
          <h1 className="mt-3 font-serif text-[clamp(30px,4.5vw,44px)] leading-[1.1] tracking-tight">{post.title}</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#6b7280]">{post.summary}</p>
          <div className="mt-3 text-xs text-[#6b7280]">
            Published {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <hr className="mt-8 mb-8 border-[#e4e2dd]" />
          <BlogBody slug={post.slug} />
        </article>
      </main>
    </div>
  );
}

async function BlogBody({ slug }: { slug: string }) {
  const source = await readPostMarkdown(slug);
  return (
    <div className="prose prose-neutral max-w-none">
      <MDXRemote source={source.content} />
      <p className="mt-4 text-base leading-relaxed text-[#0e1117]">
        This post is published pending final Director approval. If you have feedback, contact the CMO office.
      </p>
    </div>
  );
}

async function readPostMarkdown(slug: string) {
  try {
    const filePath = path.join(POSTS_DIR, `${slug}.md`);
    const raw = await fs.readFile(filePath, 'utf8');
    return matter(raw);
  } catch (error) {
    console.error(`Failed to load blog post: ${slug}.md`, error);
    notFound();
  }
}

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}
