'use client';

import { useEffect, useRef } from 'react';

/**
 * PDCA cycle ring behind the ISO 9001 watermark. Four curved arrow segments
 * circle the centered word clockwise — the continuous-improvement loop ISO 9001
 * is built on. A light travels around the ring; every full lap calls onCycle()
 * so the parent pulses the word.
 *
 * viewBox 1000x1000, centre 500,500. Angles are degrees clockwise from 12 o'clock.
 */

const CX = 500, CY = 500, R = 440;
const polar = (a: number, r = R) => {
  const rad = (a * Math.PI) / 180;
  return { x: CX + r * Math.sin(rad), y: CY - r * Math.cos(rad) };
};

type Seg = { d: string; head: string; color: string };

const SEGMENTS: Seg[] = [
  { a0: 8, a1: 82, color: '#14b8a6' },
  { a0: 98, a1: 172, color: '#7ee8dc' },
  { a0: 188, a1: 262, color: '#c8a45c' },
  { a0: 278, a1: 352, color: '#5eb89a' },
].map(({ a0, a1, color }) => {
  const p0 = polar(a0), p1 = polar(a1);
  const d = `M ${p0.x} ${p0.y} A ${R} ${R} 0 0 1 ${p1.x} ${p1.y}`;

  // arrowhead at the clockwise-leading end (a1)
  const rad = (a1 * Math.PI) / 180;
  const t = { x: Math.cos(rad), y: Math.sin(rad) };   // clockwise tangent
  const n = { x: Math.sin(rad), y: -Math.cos(rad) };  // outward normal
  const tip = { x: p1.x + t.x * 34, y: p1.y + t.y * 34 };
  const b1 = { x: p1.x + n.x * 24 - t.x * 4, y: p1.y + n.y * 24 - t.y * 4 };
  const b2 = { x: p1.x - n.x * 24 - t.x * 4, y: p1.y - n.y * 24 - t.y * 4 };
  const head = `M ${tip.x} ${tip.y} L ${b1.x} ${b1.y} L ${b2.x} ${b2.y} Z`;

  return { d, head, color };
});

export default function ArrowTrail({ onCycle }: { onCycle?: () => void }) {
  const lightRef = useRef<SVGCircleElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const light = lightRef.current;
    if (reduced || !light) return;

    const duration = 14000; // ms per lap
    let start: number | null = null;
    let last = 0;

    const tick = (ts: number) => {
      if (start === null) start = ts;
      const progress = ((ts - start) % duration) / duration;
      const p = polar(progress * 360);
      light.setAttribute('cx', String(p.x));
      light.setAttribute('cy', String(p.y));
      if (progress < last) onCycle?.();
      last = progress;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onCycle]);

  return (
    <svg className="lp-arrows" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <filter id="lp-arrow-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g className="lp-ring">
        {SEGMENTS.map((s, i) => (
          <g key={i} style={{ color: s.color }}>
            <path className="lp-seg" d={s.d} />
            <path className="lp-seg-head" d={s.head} />
          </g>
        ))}
      </g>

      <circle ref={lightRef} className="lp-arrow-light" r="8" cx="500" cy="60" filter="url(#lp-arrow-glow)" />
    </svg>
  );
}