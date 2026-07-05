import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Blog — AuditFlow',
  description: 'ISO 9001 quality management notes, audit tips, and product updates from AuditFlow.',
};

const palette = {
  product: { fg: '#0e1117', bg: '#f9f8f6', accent: '#0f766e' },
  process: { fg: '#0e1117', bg: '#f9f8f6', accent: '#b45309' },
  dev: { fg: '#0e1117', bg: '#f9f8f6', accent: '#1d4ed8' },
} as const;

export default async function BlogIndex() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-[#f9f8f6] text-[#0e1117] antialiased">
      {/* Global topbar */}
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

      <main className="mx-auto max-w-7xl px-6 pt-28 pb-20 md:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#0f766e]">
            <span className="block h-px w-5 bg-[#0f766e]" />
            Blog
          </div>
          <h1 className="font-serif text-[clamp(36px,5vw,52px)] leading-[1.08] tracking-tight">Notes from the audit world.</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#6b7280]">
            Practical guides, frameworks, and updates for quality managers and internal auditors running ISO 9001 programs.
          </p>

          <div className="mt-10 flex flex-col gap-6">
            {posts.map((post) => {
              const c = palette[post.theme as keyof typeof palette] ?? palette.product;
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group rounded-xl border border-[#e4e2dd] bg-[var(--surface-card)] p-5 transition-colors hover:border-[#d6d3cc]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-medium uppercase tracking-[0.08em]" style={{ color: c.accent }}>
                        {post.theme === 'product' && 'Product'}
                        {post.theme === 'process' && 'Process'}
                        {post.theme === 'dev' && 'Implementation'}
                      </div>
                      <div className="mt-2 text-base font-semibold tracking-tight text-[#0e1117] group-hover:text-[#0f766e]">
                        {post.title}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#6b7280]">{post.summary}</p>
                      <div className="mt-3 text-xs text-[#6b7280]">
                        Published {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="hidden flex-shrink-0 text-sm text-[#6b7280] md:block">
                      Read <span aria-hidden className="text-[#0e1117]">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
