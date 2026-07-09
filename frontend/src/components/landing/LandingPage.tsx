'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import './landing.css';

const FEATURES = [
  { icon: '◫', title: 'Self-assessment management', desc: 'Guided clause-by-clause workflows with evidence collection, scoring and gap analysis in one place.' },
  { icon: '◔', title: 'Audit planning & execution', desc: 'Schedule audits, assign internal auditors, define scope, and run structured audit sessions with real-time progress.' },
  { icon: '⚑', title: 'Non-conformity tracking', desc: 'Document, categorize and assign NCRs with severity grading. Full audit trail from discovery through resolution.' },
  { icon: '✎', title: 'Corrective actions (CAPA)', desc: 'Root cause analysis, action planning, owner assignment and effectiveness verification — closed-loop CAPA.' },
  { icon: '▤', title: 'Reporting & analytics', desc: 'Executive dashboards, trend analysis and compliance reports ready for management review and certification bodies.' },
  { icon: '◎', title: 'Role-based access', desc: 'Admin, quality manager and auditor roles with granular permissions. Each user sees exactly what they need to act on.' },
];

const STORY_STEPS = [
  { title: 'Plan your audit', desc: 'Define scope, select ISO 9001 clauses, set the schedule, and assign the audit team. Templates included.' },
  { title: 'Execute & evidence', desc: 'Run structured interviews and observations. Attach evidence directly to findings while you work, not after.' },
  { title: 'Manage findings', desc: 'Raise non-conformities and observations. Assign owners, due dates, and corrective actions immediately.' },
  { title: 'Close the loop', desc: 'Track CAPA completion, verify effectiveness, and generate the final audit report in one click.' },
];

const CLAUSES = [
  ['Clause 4', 'Context of the Organization'],
  ['Clause 5', 'Leadership'],
  ['Clause 6', 'Planning'],
  ['Clause 7', 'Support'],
  ['Clause 8', 'Operation'],
  ['Clause 9', 'Performance Evaluation'],
  ['Clause 9.2', 'Internal Audit'],
  ['Clause 9.3', 'Management Review'],
  ['Clause 10', 'Improvement & CAPA'],
  ['10.2', 'Nonconformity & Corrective Action'],
];

const BAR_HEIGHTS = ['38%', '52%', '46%', '61%', '57%', '70%', '66%', '78%', '84%', '92%'];

function handleCardGlow(e: React.MouseEvent<HTMLDivElement>) {
  const card = e.currentTarget;
  const r = card.getBoundingClientRect();
  card.style.setProperty('--mx', `${e.clientX - r.left}px`);
  card.style.setProperty('--my', `${e.clientY - r.top}px`);
}

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);

  /* Nav elevation + scroll progress + sticky story index */
  useEffect(() => {
    let ticking = false;
    const mobile = window.matchMedia('(max-width: 900px)');

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);
        if (progressRef.current) {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          progressRef.current.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
        }
        if (storyRef.current && !mobile.matches) {
          const rect = storyRef.current.getBoundingClientRect();
          const total = storyRef.current.offsetHeight - window.innerHeight;
          const p = Math.min(Math.max(-rect.top / total, 0), 0.999);
          setStoryIndex(Math.floor(p * STORY_STEPS.length));
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Reveals + count-up stats + chart bars via IntersectionObserver */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const countUp = (el: HTMLElement) => {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      const target = parseInt(el.dataset.count ?? '0', 10);
      if (reduced || target === 0) {
        el.textContent = String(target);
        return;
      }
      let start: number | null = null;
      const dur = 1400;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          entry.target.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.25 }
    );
    root.querySelectorAll('.reveal, .bars').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* 3D tilt on the hero glass card */
  useEffect(() => {
    const stage = stageRef.current;
    const tilt = tiltRef.current;
    if (!stage || !tilt) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const onMove = (ev: MouseEvent) => {
      const r = stage.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width - 0.5;
      const py = (ev.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = `rotateY(${px * 7}deg) rotateX(${-py * 6}deg) translateZ(0)`;
    };
    const onLeave = () => {
      tilt.style.transform = '';
    };
    stage.addEventListener('mousemove', onMove);
    stage.addEventListener('mouseleave', onLeave);
    return () => {
      stage.removeEventListener('mousemove', onMove);
      stage.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div className="lp" ref={rootRef}>
      <div className="lp-progress" ref={progressRef} />
      <div className="grain" />

      <nav className={scrolled ? 'scrolled' : undefined}>
        <Link className="logo" href="/">
          Audit<b>Flow</b>
        </Link>
        <div className="nav-links">
          <a href="#features">Platform</a>
          <a href="#story">How it works</a>
          <a href="#pricing">Pricing</a>
          <Link href="/blog">Blog</Link>
          <Link className="btn-quiet" href="/login">
            Sign in
          </Link>
          <Link className="btn" href="/register">
            Start free →
          </Link>
        </div>
      </nav>

      <header className="hero">
        <div className="aurora" />
        <div>
          <span className="eyebrow">ISO 9001:2015 · Built for European SMEs</span>
          <h1>
            Walk into your audit <em>already certain</em> of the outcome.
          </h1>
          <p className="hero-sub">
            AuditFlow maps your entire quality system to clauses 4–10, tracks every NCR to closure, and shows you
            exactly where you stand — months before the auditor does.
          </p>
          <div className="hero-actions">
            <Link className="btn" href="/register">
              Start 30-day free trial →
            </Link>
            <a className="btn-quiet" href="#story">
              See how it works ↓
            </a>
          </div>
          <p className="hero-note">
            <span className="seal">✓</span> Built on the full ISO 9001:2015 clause structure
          </p>
        </div>

        <div className="stage" ref={stageRef}>
          <div className="lp-glass" ref={tiltRef} aria-hidden="true">
            <span className="float-chip chip-a">
              Clause <b>8.5.1</b> — Control of production
            </span>
            <span className="float-chip chip-b">
              NCR <b>−32%</b> this quarter
            </span>
            <div className="gc-head">
              <div className="gc-title">
                Audit readiness
                <small>Example workspace · Surveillance audit in 41 days</small>
              </div>
              <span className="gc-live">Live</span>
            </div>
            <div className="kpis">
              <div className="kpi">
                <b className="up">87%</b>
                <span>Readiness</span>
              </div>
              <div className="kpi">
                <b>3</b>
                <span>Open NCRs</span>
              </div>
              <div className="kpi">
                <b className="warn">2</b>
                <span>Overdue actions</span>
              </div>
            </div>
            <div className="bars">
              {BAR_HEIGHTS.map((h, i) => (
                <i key={i} style={{ height: h }} />
              ))}
            </div>
            <div className="ncr-row">
              <code>NCR-041</code>
              <span className="grow">Calibration records missing for torque tools</span>
              <span className="pill major">Major</span>
            </div>
            <div className="ncr-row">
              <code>NCR-039</code>
              <span className="grow">Supplier evaluation overdue</span>
              <span className="pill minor">Minor</span>
            </div>
            <div className="ncr-row">
              <code>NCR-036</code>
              <span className="grow">Management review minutes — approved &amp; closed</span>
              <span className="pill ok">Closed</span>
            </div>
          </div>
        </div>
      </header>

      <section className="stats">
        <div className="wrap stats-grid">
          <div className="stat reveal">
            <b>
              <span data-count="7">0</span>
              <i>clauses</i>
            </b>
            <span>full coverage of ISO 9001:2015 clauses 4 through 10 — every requirement mapped</span>
          </div>
          <div className="stat reveal" data-d="1">
            <b>
              <span data-count="4">0</span>
              <i>audit types</i>
            </b>
            <span>internal, external, surveillance and certification audits planned in one place</span>
          </div>
          <div className="stat reveal" data-d="2">
            <b>
              <span data-count="0">0</span>
              <i>spreadsheets</i>
            </b>
            <span>NCRs, corrective actions and evidence live in one system — not in Excel</span>
          </div>
        </div>
      </section>

      <section className="sec-pad" id="features">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">The platform</span>
            <h2>Everything the auditor will ask for. Nothing you have to hunt down.</h2>
            <p>Built specifically for ISO 9001 — not a generic task tracker retrofitted with compliance labels.</p>
          </div>
          <div className="feat-grid">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="lp-feat reveal" data-d={i % 3 || undefined} onMouseMove={handleCardGlow}>
                <div className="feat-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="story" id="story" ref={storyRef}>
        <div className="story-sticky">
          <div className="story-copy">
            <span className="eyebrow">How it works</span>
            <h2>From first gap to signed certificate.</h2>
            {STORY_STEPS.map((s, i) => (
              <div key={s.title} className={`story-step${i === storyIndex ? ' active' : ''}`}>
                <span className="story-num">{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="story-panels">
            <div className={`story-panel${storyIndex === 0 ? ' active' : ''}`}>
              <div className="sp-label">Audit plan · Scope &amp; team</div>
              <div className="sp-row">
                <span>Scope — clauses 4–10, production site</span>
                <span className="sp-check">✓ Defined</span>
              </div>
              <div className="sp-row">
                <span>Lead auditor — assigned</span>
                <span className="sp-check">✓ Ready</span>
              </div>
              <div className="sp-row">
                <span>Checklist shared with team</span>
                <span className="sp-check">✓ Sent</span>
              </div>
              <div className="sp-row">
                <span>Schedule — 12–14 May</span>
                <span className="sp-check">✓ Booked</span>
              </div>
            </div>
            <div className={`story-panel${storyIndex === 1 ? ' active' : ''}`}>
              <div className="sp-label">Self-assessment · Clause coverage</div>
              <div className="sp-clause">Clause 4 — Context of the organization</div>
              <div className="sp-bar">
                <i style={{ width: '92%' }} />
              </div>
              <div className="sp-clause">Clause 7 — Support</div>
              <div className="sp-bar">
                <i style={{ width: '64%' }} />
              </div>
              <div className="sp-clause">Clause 8 — Operation</div>
              <div className="sp-bar">
                <i style={{ width: '48%' }} />
              </div>
              <div className="sp-clause">Clause 9 — Performance evaluation</div>
              <div className="sp-bar">
                <i style={{ width: '71%' }} />
              </div>
            </div>
            <div className={`story-panel${storyIndex === 2 ? ' active' : ''}`}>
              <div className="sp-label">NCR board · This week</div>
              <div className="sp-row">
                <span>Calibration records — torque tools</span>
                <span className="pill major">Major</span>
              </div>
              <div className="sp-row">
                <span>Supplier evaluation overdue</span>
                <span className="pill minor">Minor</span>
              </div>
              <div className="sp-row">
                <span>Training matrix — welding certs</span>
                <span className="pill minor">Minor</span>
              </div>
              <div className="sp-row">
                <span>Document control — obsolete SOP v3</span>
                <span className="pill ok">Closed</span>
              </div>
            </div>
            <div className={`story-panel${storyIndex === 3 ? ' active' : ''}`}>
              <div className="sp-label">Close-out · Certification audit</div>
              <div className="sp-row">
                <span>Corrective actions verified</span>
                <span className="sp-check">✓ Done</span>
              </div>
              <div className="sp-row">
                <span>Internal audit reports (12 mo)</span>
                <span className="sp-check">✓ Ready</span>
              </div>
              <div className="sp-row">
                <span>Management review minutes</span>
                <span className="sp-check">✓ Ready</span>
              </div>
              <div className="sp-row">
                <span>Final audit report</span>
                <span className="sp-check">✓ Generated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec-pad">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">Coverage</span>
            <h2>Full ISO 9001:2015 clause coverage.</h2>
            <p>
              Every requirement mapped — from organizational context to management review, operations, and continuous
              improvement.
            </p>
          </div>
          <div className="clause-grid reveal">
            {CLAUSES.map(([id, name]) => (
              <div key={id} className="clause">
                <div className="clause-id">{id}</div>
                <div className="clause-name">{name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="paper-sec sec-pad" id="pricing">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">Pricing</span>
            <h2>Straightforward plans. No surprises.</h2>
            <p>All plans include full ISO 9001:2015 clause coverage. Free while in beta.</p>
          </div>
          <div className="pricing-grid">
            <div className="plan featured reveal">
              <div className="plan-name">Free</div>
              <div className="plan-price">€0</div>
              <div className="plan-per">forever — up to 10 users</div>
              <div className="plan-divider" />
              <ul className="plan-features">
                <li>Unlimited audits</li>
                <li>Self-assessment module</li>
                <li>NCR &amp; CAPA tracking</li>
                <li>Full ISO 9001:2015 clause coverage</li>
                <li>Basic reporting &amp; dashboards</li>
                <li>Email support</li>
              </ul>
              <Link href="/register" className="plan-btn plan-btn-glow">
                Start 30-day trial
              </Link>
            </div>
            <div className="plan reveal" data-d="1">
              <div className="plan-name">Professional</div>
              <div className="plan-price">Coming soon</div>
              <div className="plan-per">up to 50 users — join the waitlist</div>
              <div className="plan-divider" />
              <ul className="plan-features">
                <li>Everything in Free</li>
                <li>Advanced analytics &amp; custom dashboards</li>
                <li>Evidence attachment &amp; storage</li>
                <li>Audit report generation (PDF)</li>
                <li>Role-based access control</li>
                <li>Multi-department &amp; division support</li>
                <li>Priority support</li>
              </ul>
              <Link href="/register" className="plan-btn plan-btn-dark">
                Start 30-day trial
              </Link>
            </div>
            <div className="plan reveal" data-d="2">
              <div className="plan-name">Enterprise</div>
              <div className="plan-price">Custom</div>
              <div className="plan-per">50+ users — tailored to your org</div>
              <div className="plan-divider" />
              <ul className="plan-features">
                <li>Everything in Professional</li>
                <li>SSO / SAML integration</li>
                <li>Custom audit templates</li>
                <li>API access</li>
                <li>Multi-site management</li>
                <li>Dedicated onboarding &amp; training</li>
                <li>SLA-backed support</li>
              </ul>
              <a href="mailto:hello@auditflow.io" className="plan-btn plan-btn-outline">
                Contact sales
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>
          Your next audit could be <em>the calm one</em>.
        </h2>
        <p>Set up in minutes. No consultants, no training day required.</p>
        <Link className="btn" href="/register">
          Start 30-day free trial →
        </Link>
      </section>

      <footer>
        <div className="wrap">
          <div className="footer-inner">
            <div className="footer-brand">
              <div className="footer-logo">
                Audit<span>Flow</span>
              </div>
              <div className="footer-tagline">
                ISO 9001 quality management and audit platform. Built for teams that take compliance seriously.
              </div>
            </div>
            <div className="footer-links-group">
              <div className="footer-links-title">Product</div>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <Link href="/blog">Blog</Link>
            </div>
            <div className="footer-links-group">
              <div className="footer-links-title">Use cases</div>
              <a href="#features">Internal audits</a>
              <a href="#features">Self-assessments</a>
              <a href="#story">Management review</a>
            </div>
            <div className="footer-links-group">
              <div className="footer-links-title">Company</div>
              <a href="mailto:hello@auditflow.io">Contact</a>
              <a href="#">Privacy policy</a>
              <a href="#">Terms of service</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 AuditFlow. All rights reserved.</span>
            <span>ISO 9001:2015 Quality Management Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
