import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getPosts, readPostMarkdown } from '@/lib/posts';

const palette = {
  product: { fg: 'var(--text-strong)', bg: 'var(--surface-page)', accent: 'var(--brand)' },
  process: { fg: 'var(--text-strong)', bg: 'var(--surface-page)', accent: 'var(--status-obs-fg)' },
  dev: { fg: 'var(--text-strong)', bg: 'var(--surface-page)', accent: 'var(--text-link)' },
} as const;

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

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const posts = await getPosts();
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) return { title: 'Post not found — AuditFlow' };
  return { title: `${post.title} — AuditFlow`, description: post.summary };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const posts = await getPosts();
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) notFound();

  const c = palette[post.theme as keyof typeof palette] ?? palette.product;

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--text-body)] antialiased">
      <nav className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-[var(--border-subtle)] bg-[rgba(7,13,15,0.85)] px-6 md:px-10 backdrop-blur-md">
        <Link href="/" className="text-sm font-semibold tracking-tight text-[var(--text-strong)]">
          Audit<span className="text-[var(--brand)]">Flow</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]">Features</Link>
          <Link href="#how" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]">How it works</Link>
          <Link href="#pricing" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]">Pricing</Link>
          <Link href="/blog" className="text-sm font-medium text-[var(--text-strong)]">Blog</Link>
          <Link href="/register" className="btn-primary">Start 30-day free trial</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 pt-28 pb-20 md:px-10">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]">
          <span aria-hidden>←</span> Back to blog
        </Link>

        <article className="mt-8">
          <div className="text-xs font-medium uppercase tracking-[0.08em]" style={{ color: c.accent }}>
            {post.theme === 'product' && 'Product'}
            {post.theme === 'process' && 'Process'}
            {post.theme === 'dev' && 'Implementation'}
          </div>
          <h1 className="mt-3 font-serif text-[clamp(30px,4.5vw,44px)] leading-[1.1] tracking-tight text-[var(--text-strong)]">{post.title}</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--text-muted)]">{post.summary}</p>
          <div className="mt-3 text-xs text-[var(--text-muted)]">
            Published {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <hr className="mt-8 mb-8 border-[var(--border-subtle)]" />
          <BlogBody slug={post.slug} />
        </article>
      </main>
    </div>
  );
}
