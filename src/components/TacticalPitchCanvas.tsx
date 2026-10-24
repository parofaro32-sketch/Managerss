import React, { useEffect, useRef } from 'react';

interface TacticalPitchCanvasProps {
  className?: string;
  interactive?: boolean;
  intensity?: 'full' | 'ambient';
}

export const TacticalPitchCanvas: React.FC<TacticalPitchCanvasProps> = ({
  className = '',
  interactive = true,
  intensity = 'full',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let W = 0;
    let H = 0;
    let dpr = 1;

    // Tactical pitch colors - dark football gaming palette
    const colors = {
      grassA: intensity === 'ambient' ? '#071610' : '#0a2317',
      grassB: intensity === 'ambient' ? '#040d09' : '#071c12',
      chalk: 'rgba(210, 245, 225, 0.35)',
      chalkBold: 'rgba(235, 255, 245, 0.75)',
      ball: '#facc15',
      ballGlow: 'rgba(250, 204, 21, 0.3)',
      dotHome: '#22c55e',
      dotAway: '#38bdf8',
    };

    function resize() {
      if (!cv) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
    }

    // 11 tactical formation positions
    const F: [number, number][] = [
      [6, 34],
      [24, 10], [22, 26], [22, 42], [24, 58],
      [42, 18], [38, 34], [42, 50],
      [62, 12], [70, 34], [62, 56],
    ];

    const P = F.map((p, i) => ({
      bx: p[0],
      by: p[1],
      x: p[0],
      y: p[1],
      ph: i * 1.7,
      ax: 1.5 + (i % 3),
      ay: 1.5 + ((i + 1) % 3),
    }));

    let hold = 0;
    let forceShot = false;
    let leg: { sx: number; sy: number; to?: number; tx?: number; ty?: number; t0: number; d: number; shot?: boolean } | null = null;
    let fixed: { x: number; y: number } | null = null;
    let nextAt = 0;
    let goalAt = -1e9;
    const trail: Array<{ x: number; y: number }> = [];
    let pulses: Array<{ x: number; y: number; t: number }> = [];

    const cl = (v: number) => Math.max(0, Math.min(1, v));
    const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const out3 = (t: number) => 1 - Math.pow(1 - t, 3);

    function plan(now: number) {
      const h = P[hold];
      if (forceShot || (h.bx > 58 && Math.random() < 0.45)) {
        forceShot = false;
        leg = {
          sx: h.x,
          sy: h.y,
          tx: 105.5,
          ty: 30 + Math.random() * 8,
          t0: now,
          d: 700,
          shot: true,
        };
        return;
      }
      let c = P.map((q, i) => ({
        i,
        d: Math.hypot(q.x - h.x, q.y - h.y),
        fw: q.bx - h.bx,
      })).filter((o) => o.i !== hold && o.d < 32 && o.d > 8);

      if (!c.length) c = [{ i: 0, d: 20, fw: 0 }];
      const fwd = c.filter((o) => o.fw > -4);
      const pool = fwd.length && Math.random() < 0.75 ? fwd : c;
      const o = pool[Math.floor(Math.random() * pool.length)];
      leg = { sx: h.x, sy: h.y, to: o.i, t0: now, d: 600 + o.d * 14 };
    }

    function lines() {
      if (!ctx) return;
      ctx.beginPath();
      // Pitch boundary
      ctx.rect(0, 0, 105, 68);
      // Halfway line
      ctx.moveTo(52.5, 0);
      ctx.lineTo(52.5, 68);
      // Center circle
      ctx.moveTo(61.65, 34);
      ctx.arc(52.5, 34, 9.15, 0, Math.PI * 2);
      // Penalty boxes
      ctx.rect(0, 13.84, 16.5, 40.32);
      ctx.rect(0, 24.84, 5.5, 18.32);
      ctx.rect(88.5, 13.84, 16.5, 40.32);
      ctx.rect(99.5, 24.84, 5.5, 18.32);
      // Arcs
      ctx.moveTo(11 + 9.15 * Math.cos(-0.9273), 34 + 9.15 * Math.sin(-0.9273));
      ctx.arc(11, 34, 9.15, -0.9273, 0.9273);
      ctx.moveTo(94 + 9.15 * Math.cos(Math.PI - 0.9273), 34 + 9.15 * Math.sin(Math.PI - 0.9273));
      ctx.arc(94, 34, 9.15, Math.PI - 0.9273, Math.PI + 0.9273);
      // Goal mouths
      ctx.rect(-2, 30.34, 2, 7.32);
      ctx.rect(105, 30.34, 2, 7.32);
      ctx.stroke();

      // Penalty spots & center spot
      [[52.5, 34], [11, 34], [94, 34]].forEach((s) => {
        ctx.beginPath();
        ctx.arc(s[0], s[1], 0.45, 0, Math.PI * 2);
        ctx.fillStyle = colors.chalkBold;
        ctx.fill();
      });
    }

    let t0 = 0;

    function render(now: number) {
      if (!ctx || !cv) return;
      if (!t0) {
        t0 = now;
        nextAt = now + 1500;
      }
      const el = now - t0;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Pitch background
      ctx.fillStyle = colors.grassB;
      ctx.fillRect(0, 0, W, H);

      const portrait = H > W;
      ctx.save();
      ctx.translate(W / 2, H / 2);

      let s: number;
      if (portrait) {
        ctx.rotate(Math.PI / 2);
        s = Math.min((H * 0.94) / 105, (W * 0.9) / 68);
      } else {
        s = Math.min((W * 0.94) / 105, (H * 0.9) / 68);
      }

      ctx.scale(s, s);
      ctx.translate(-52.5, -34);

      // Grass striping
      for (let i = -10; i < 20; i++) {
        ctx.fillStyle = i % 2 ? colors.grassA : colors.grassB;
        ctx.fillRect(i * 10.5, -90, 10.5, 250);
      }

      // Chalk lines
      ctx.save();
      ctx.strokeStyle = colors.chalk;
      ctx.lineWidth = 0.28;
      lines();
      ctx.restore();

      // Players
      P.forEach((q) => {
        q.x = q.bx + q.ax * Math.sin(now * 0.0006 + q.ph);
        q.y = q.by + q.ay * Math.cos(now * 0.0005 + q.ph * 1.3);
      });

      P.forEach((q, idx) => {
        ctx.beginPath();
        ctx.arc(q.x, q.y, 1.25, 0, Math.PI * 2);
        ctx.fillStyle = idx === hold ? '#4ade80' : colors.dotHome;
        ctx.fill();
        ctx.lineWidth = 0.2;
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.stroke();

        // Player tactical aura ring
        if (idx === hold) {
          ctx.beginPath();
          ctx.arc(q.x, q.y, 2.2, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(74, 222, 128, 0.4)';
          ctx.lineWidth = 0.15;
          ctx.stroke();
        }
      });

      // Ball physics & passing
      let bx: number;
      let by: number;

      if (leg) {
        const k = cl((now - leg.t0) / leg.d);
        const e = ease(k);
        const tx = leg.shot ? leg.tx! : P[leg.to!].x;
        const ty = leg.shot ? leg.ty! : P[leg.to!].y;
        bx = leg.sx + (tx - leg.sx) * e;
        by = leg.sy + (ty - leg.sy) * e;

        if (k >= 1) {
          if (leg.shot) {
            goalAt = now;
            fixed = { x: bx, y: by };
            hold = 0;
            nextAt = now + 1200;
          } else {
            hold = leg.to!;
            nextAt = now + 400;
            pulses.push({ x: P[hold].x, y: P[hold].y, t: now });
          }
          leg = null;
        }
      } else if (fixed && now < nextAt) {
        bx = fixed.x;
        by = fixed.y;
      } else {
        if (fixed) {
          fixed = null;
          trail.length = 0;
        }
        bx = P[hold].x + 1.4;
        by = P[hold].y;
        if (now >= nextAt) plan(now);
      }

      // Goal flash
      const ga = now - goalAt;
      if (ga < 900) {
        ctx.globalAlpha = (1 - ga / 900) * 0.85;
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(105, 30.34, 3, 7.32);
        ctx.globalAlpha = 1;
      }

      // Reception pulses
      pulses = pulses.filter((p) => now - p.t < 500);
      pulses.forEach((p) => {
        const a = (now - p.t) / 500;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2 + a * 3, 0, Math.PI * 2);
        ctx.globalAlpha = 1 - a;
        ctx.strokeStyle = colors.chalkBold;
        ctx.lineWidth = 0.2;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      // Ball trail
      trail.push({ x: bx, y: by });
      if (trail.length > 14) trail.shift();
      trail.forEach((t, i) => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, 0.55, 0, Math.PI * 2);
        ctx.globalAlpha = (i / trail.length) * 0.45;
        ctx.fillStyle = colors.ball;
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Ball
      ctx.beginPath();
      ctx.arc(bx, by, 0.88, 0, Math.PI * 2);
      ctx.fillStyle = colors.ball;
      ctx.fill();
      ctx.lineWidth = 0.16;
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.stroke();

      ctx.restore();
      animId = requestAnimationFrame(render);
    }

    const handleCanvasClick = () => {
      if (!interactive) return;
      forceShot = true;
    };

    window.addEventListener('resize', resize);
    cv.addEventListener('click', handleCanvasClick);
    resize();
    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (cv) cv.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animId);
    };
  }, [interactive, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full h-full pointer-events-auto ${className}`}
      title={interactive ? 'Interactive Tactical Simulation - Click to force a strike!' : undefined}
    />
  );
};
