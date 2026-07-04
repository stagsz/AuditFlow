'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--text-body)] antialiased">

      {/* ===== NAV ===== */}
      <nav className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-[var(--border-subtle)] bg-[rgba(7,13,15,0.85)] px-6 md:px-10 backdrop-blur-md">
        <Link href="/" className="text-sm font-semibold tracking-tight text-[var(--text-strong)]">
          Audit<span className="text-[var(--brand)]">Flow</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]">Features</Link>
          <Link href="#how" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]">How it works</Link>
          <Link href="#pricing" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]">Pricing</Link>
          <Link href="/blog" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]">Blog</Link>
          <Link href="/register" className="btn-primary !px-4 !py-2">Start 30-day free trial</Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <div className="aurora-bg mx-auto max-w-7xl md:px-10">
        <div className="grid items-center gap-8 px-6 pt-28 pb-8 md:grid-cols-2 md:gap-12 md:pt-40 md:pb-14">
          <div>
            <div className="hero-eyebrow">
              ISO 9001 Quality Management
            </div>
            <h1 className="font-serif text-[clamp(36px,5vw,58px)] leading-[1.08] tracking-[-0.01em] text-[var(--text-strong)]">
              Audit with <em className="text-[var(--text-link)]">confidence,</em> not paperwork.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--text-muted)]">
              Replace spreadsheets and email chains with one platform for self-assessments, audits, NCR tracking, and CAPA.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/register" className="btn-primary">Start 30-day free trial</Link>
              <Link href="#how" className="inline-flex items-center gap-2 text-sm text-[var(--text-strong)] border-b border-[var(--border-default)] pb-[1px] hover:border-[var(--text-strong)]">
                See how it works <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-1 text-xs text-[var(--text-subtle)]">AuditFlow — Dashboard</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-[var(--border-subtle)] bg-white/[0.04] p-3">
                  <div className="text-lg font-semibold text-[var(--text-strong)] tracking-tight">94%</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Compliance score</div>
                  <div className="mt-1 text-[11px] text-[var(--brand)]">↑ 6% this quarter</div>
                </div>
                <div className="rounded-lg border border-[var(--border-subtle)] bg-white/[0.04] p-3">
                  <div className="text-lg font-semibold text-[var(--text-strong)] tracking-tight">12</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Open NCRs</div>
                  <div className="mt-1 text-[11px] text-[var(--brand)]">↓ 4 from last audit</div>
                </div>
                <div className="rounded-lg border border-[var(--border-subtle)] bg-white/[0.04] p-3">
                  <div className="text-lg font-semibold text-[var(--text-strong)] tracking-tight">3</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Audits this month</div>
                  <div className="mt-1 text-[11px] text-[var(--brand)]">On schedule</div>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 rounded-md bg-white/[0.03] border border-[var(--border-subtle)] px-3 py-2">
                  <span className="badge-open">Open</span>
                  <span className="flex-1 truncate text-xs text-[var(--text-body)]">Calibration records missing — Clause 7.1.5</span>
                  <span className="text-[11px] text-[var(--text-subtle)]">May 28</span>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-white/[0.03] border border-[var(--border-subtle)] px-3 py-2">
                  <span className="badge-review">Review</span>
                  <span className="flex-1 truncate text-xs text-[var(--text-body)]">Supplier qualification procedure update</span>
                  <span className="text-[11px] text-[var(--text-subtle)]">May 26</span>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-white/[0.03] border border-[var(--border-subtle)] px-3 py-2">
                  <span className="badge-closed">Closed</span>
                  <span className="flex-1 truncate text-xs text-[var(--text-body)]">Internal audit report Q1 — Clause 9.2</span>
                  <span className="text-[11px] text-[var(--text-subtle)]">May 20</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== FEATURES ===== */}
      <section id="features" className="border-t border-b border-[var(--border-subtle)] bg-[var(--ink-1)]">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
          <div className="mb-16">
            <div className="section-label">
              Platform capabilities
            </div>
            <h2 className="font-serif text-[clamp(28px,4vw,44px)] leading-[1.12] tracking-tight text-[var(--text-strong)]">Everything a QMS needs.<br />Nothing it doesn&apos;t.</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--text-muted)]">
              Built specifically for ISO 9001 — not a generic task tracker retrofitted with compliance labels.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <div className="feat-card rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6">
              <div className="text-xs font-medium tracking-[0.06em] text-[var(--brand)]">01</div>
              <div className="mt-4 text-sm font-medium text-[var(--text-strong)]">Self-Assessment Management</div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">Guided clause-by-clause workflows for ISO 9001 self-assessments with evidence collection, scoring, and gap analysis.</p>
            </div>
            <div className="feat-card rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6">
              <div className="text-xs font-medium tracking-[0.06em] text-[var(--brand)]">02</div>
              <div className="mt-4 text-sm font-medium text-[var(--text-strong)]">Audit Planning & Execution</div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">Schedule audits, assign auditors, define scope, and run structured sessions with real-time progress tracking.</p>
            </div>
            <div className="feat-card rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6">
              <div className="text-xs font-medium tracking-[0.06em] text-[var(--brand)]">03</div>
              <div className="mt-4 text-sm font-medium text-[var(--text-strong)]">Non-Conformity Tracking</div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">Document, grade, and assign NCRs with full audit trail from discovery through resolution.</p>
            </div>
            <div className="feat-card rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6">
              <div className="text-xs font-medium tracking-[0.06em] text-[var(--brand)]">04</div>
              <div className="mt-4 text-sm font-medium text-[var(--text-strong)]">Corrective Actions (CAPA)</div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">Root cause analysis, planning, owner assignment, and effectiveness verification in one closed loop.</p>
            </div>
            <div className="feat-card rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6">
              <div className="text-xs font-medium tracking-[0.06em] text-[var(--brand)]">05</div>
              <div className="mt-4 text-sm font-medium text-[var(--text-strong)]">Reporting & Analytics</div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">Executive dashboards, trend analysis, and compliance reports for management reviews and audits.</p>
            </div>
            <div className="feat-card rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6">
              <div className="text-xs font-medium tracking-[0.06em] text-[var(--brand)]">06</div>
              <div className="mt-4 text-sm font-medium text-[var(--text-strong)]">Role-Based Access Control</div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">Admin, Quality Manager, and Auditor roles with granular permissions — each user sees only what they need.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW ===== */}
      <section id="how" className="relative bg-[var(--surface-page)] overflow-hidden">
        <div className="pointer-events-none absolute -top-48 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(15,118,110,0.35)_0%,transparent_70%)]" aria-hidden />
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
          <div className="mb-16">
            <div className="section-label">
              Workflow
            </div>
            <h2 className="font-serif text-[clamp(28px,4vw,44px)] leading-[1.12] tracking-tight text-[var(--text-strong)]">From assessment to certification-ready.</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--text-muted)]">A structured four-step process that mirrors how your certification body evaluates your QMS.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              {title:'Plan your audit',desc:'Define scope, select ISO 9001 clauses, set the schedule, and assign the audit team with included templates.'},
              {title:'Execute & evidence',desc:'Run structured interviews and observations. Attach evidence to findings in real time, not after.'},
              {title:'Manage findings',desc:'Raise non-conformities and observations, assign owners, due dates, and corrective actions.'},
              {title:'Close the loop',desc:'Track CAPA completion, verify effectiveness, and generate the final audit report in one click.'},
            ].map((item, idx) => (
              <div key={item.title} className="relative rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold text-[var(--text-strong)]" style={{background: ['rgba(251,146,60,0.15)','rgba(96,165,250,0.15)','rgba(167,139,250,0.15)','rgba(52,211,153,0.15)'][idx], border: `1px solid ${['rgba(251,146,60,0.25)','rgba(96,165,250,0.25)','rgba(167,139,250,0.25)','rgba(52,211,153,0.25)'][idx]}`}}>
                  {idx + 1}
                </div>
                <div className="mt-3 h-1 w-5 rounded-full" style={{background: ['#fb923c','#60a5fa','#a78bfa','#34d399'][idx]}} />
                <div className="mt-3 text-sm font-medium text-[var(--text-strong)]">{item.title}</div>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-muted)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="bg-[var(--surface-page)]">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
          <div className="mb-16 text-center">
            <div className="section-label">
              Pricing
            </div>
            <h2 className="font-serif text-[clamp(28px,4vw,44px)] leading-[1.12] tracking-tight text-[var(--text-strong)]">Straightforward plans. No surprises.</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">All plans include full ISO 9001:2015 clause coverage. Free while in beta.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="plan-card">
              <div className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--text-muted)]">Free</div>
              <div className="mt-2 flex items-baseline gap-1">
                <div className="text-4xl font-semibold tracking-tight text-[var(--text-strong)]">€0</div>
                <div className="text-xs text-[var(--text-subtle)]">forever</div>
              </div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">Up to 10 users</div>
              <div className="plan-divider" />
              <ul className="flex flex-col gap-2 text-sm text-[var(--text-body)]">
                <li className="flex items-start gap-2"><span className="mt-0.5 text-[var(--brand)]">✓</span> Unlimited audits</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-[var(--brand)]">✓</span> Self-assessment module</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-[var(--brand)]">✓</span> NCR & CAPA tracking</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-[var(--brand)]">✓</span> Basic reporting & dashboards</li>
              </ul>
              <Link href="/register" className="mt-6 block w-full rounded-lg border border-[var(--border-default)] py-2.5 text-center text-sm font-medium text-[var(--text-strong)] hover:border-[var(--border-strong)] hover:bg-white/[0.04]">Start 30-day trial</Link>
            </div>

            <div className="plan-card plan-card-featured">
              <div className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--text-muted)]">Professional</div>
              <div className="mt-2 flex items-baseline gap-1">
                <div className="text-4xl font-semibold tracking-tight text-[var(--text-strong)]">€0</div>
                <div className="text-xs text-[var(--text-subtle)]">per month</div>
              </div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">Up to 50 users</div>
              <div className="plan-divider" />
              <ul className="flex flex-col gap-2 text-sm text-[var(--text-body)]">
                <li className="flex items-start gap-2"><span className="mt-0.5 text-[var(--brand)]">✓</span> Everything in Free</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-[var(--brand)]">✓</span> Advanced analytics & custom dashboards</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-[var(--brand)]">✓</span> Evidence attachment & storage</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-[var(--brand)]">✓</span> Audit report generation (PDF)</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-[var(--brand)]">✓</span> Role-based access control</li>
              </ul>
              <Link href="/register" className="btn-primary mt-6 w-full">Start 30-day trial</Link>
            </div>

            <div className="plan-card">
              <div className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--text-muted)]">Enterprise</div>
              <div className="mt-2 text-4xl font-semibold tracking-tight text-[var(--text-strong)]">Custom</div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">50+ users</div>
              <div className="plan-divider" />
              <ul className="flex flex-col gap-2 text-sm text-[var(--text-body)]">
                <li className="flex items-start gap-2"><span className="mt-0.5 text-[var(--brand)]">✓</span> SSO / SAML integration</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-[var(--brand)]">✓</span> Custom audit templates</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-[var(--brand)]">✓</span> API access</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-[var(--brand)]">✓</span> SLA-backed support</li>
              </ul>
              <a href="mailto:hello@auditflow.io" className="mt-6 block w-full rounded-lg border border-[var(--border-default)] py-2.5 text-center text-sm font-medium text-[var(--text-strong)] hover:border-[var(--border-strong)] hover:bg-white/[0.04]">Contact sales</a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-[var(--ink-1)]">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center md:px-10">
          <h2 className="font-serif text-[clamp(26px,4vw,38px)] leading-[1.12] tracking-tight text-[var(--text-strong)]">Ready to run your next audit with confidence?</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-[var(--text-muted)]">Set up in minutes. No consultants, no all-day training required.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="btn-primary">Start 30-day free trial</Link>
            <a href="mailto:hello@auditflow.io" className="inline-flex items-center gap-2 border-b border-[var(--border-default)] pb-[1px] text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]">Schedule a demo <span aria-hidden>→</span></a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--ink-1)]">
        <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <div className="text-sm font-semibold tracking-tight text-[var(--text-strong)]">Audit<span className="text-[var(--brand)]">Flow</span></div>
              <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">Enterprise-grade ISO 9001 quality management and audit platform for teams that take compliance seriously.</p>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--text-strong)]">Product</div>
              <ul className="mt-3 flex flex-col gap-2">
                <li><Link href="#features" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]">Features</Link></li>
                <li><Link href="#pricing" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]">Pricing</Link></li>
                <li><a className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]" href="#">Changelog</a></li>
                <li><a className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]" href="#">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--text-strong)]">Use cases</div>
              <ul className="mt-3 flex flex-col gap-2">
                <li><a className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]" href="#">Internal audits</a></li>
                <li><a className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]" href="#">Self-assessments</a></li>
                <li><a className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]" href="#">Supplier audits</a></li>
                <li><a className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]" href="#">Management review</a></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--text-strong)]">Legal</div>
              <ul className="mt-3 flex flex-col gap-2">
                <li><a className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]" href="#">Privacy policy</a></li>
                <li><a className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]" href="#">Terms of service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-5 text-xs text-[var(--text-muted)] md:flex-row">
            <span>© 2026 AuditFlow. All rights reserved.</span>
            <span>ISO 9001:2015 Quality Management Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
