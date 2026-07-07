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
    <div className="
      prose prose-neutral max-w-none
      prose-headings:font-serif prose-headings:tracking-tight prose-headings:text-[var(--text-strong)]
      prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
      prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
      prose-p:text-[var(--text-body)] prose-p:leading-relaxed
      prose-a:text-[var(--text-link)] prose-a:no-underline hover:prose-a:underline
      prose-strong:text-[var(--text-strong)] prose-strong:font-semibold
      prose-code:before:content-none prose-code:after:content-none
      prose-code:bg-[var(--surface-sunken)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
      prose-pre:bg-[var(--surface-sunken)] prose-pre:border prose-pre:border-[var(--border-subtle)] prose-pre:rounded-xl
      prose-blockquote:border-l-[var(--brand)] prose-blockquote:bg-[var(--surface-sunken)] prose-blockquote:rounded-r-lg prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:not-italic
      prose-table:border prose-table:border-[var(--border-subtle)] prose-table:rounded-xl prose-table:overflow-hidden
      prose-th:bg-[var(--surface-sunken)] prose-th:text-[var(--text-strong)] prose-th:font-semibold prose-th:text-sm prose-th:uppercase prose-th:tracking-wide
      prose-td:border-t prose-td:border-[var(--border-subtle)] prose-td:text-[var(--text-body)]
      prose-li:text-[var(--text-body)] prose-li:marker:text-[var(--text-muted)]
      prose-hr:border-[var(--border-subtle)] prose-hr:my-10
    ">
      <MDXRemote source={source.content} />
    </div>
  );
}

export async function generateStaticParams() {
  try {
    const posts = await getPosts();
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const posts = await getPosts();
    const post = posts.find((p) => p.slug === params.slug);
    if (!post) return { title: 'Post not found — AuditFlow' };
    return { title: `${post.title} — AuditFlow`, description: post.summary };
  } catch {
    return { title: 'Post not found — AuditFlow' };
  }
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  let post;
  try {
    const posts = await getPosts();
    post = posts.find((p) => p.slug === params.slug);
  } catch {
    post = undefined;
  }
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
