/* ═══════════════════════════════════════════════════
   MaaCheck — Breathing Waveform Visualization
   Real-time canvas rendering of tap-based respiratory
   pattern — makes the tap counter feel like a medical
   monitoring device
   ═══════════════════════════════════════════════════ */

import { useRef, useEffect } from "react";

export default function BreathingWaveform({
  taps,
  isRunning,
  seconds,
  maxSeconds = 60,
}) {
  const canvasRef = useRef(null);
  const dataRef = useRef([]); // recorded tap peaks
  const animRef = useRef(null); // rAF handle
  const sizeRef = useRef({ w: 0, h: 0 }); // logical px dimensions (pre-DPR)
  const prevTaps = useRef(0);

  // ── 1. Size canvas once on mount + whenever container resizes ──────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const applySize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      sizeRef.current = { w: rect.width, h: rect.height };
    };

    applySize();

    const ro = new ResizeObserver(applySize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // ── 2. Record a tap peak when taps count increases ─────────────────────
  useEffect(() => {
    if (taps > prevTaps.current && isRunning) {
      const elapsed = maxSeconds - seconds;
      dataRef.current.push({
        time: elapsed,
        amplitude: 0.85 + Math.random() * 0.15,
      });
    }
    prevTaps.current = taps;
  }, [taps, isRunning, seconds, maxSeconds]);

  // ── 3. Reset waveform data when a new session begins ───────────────────
  useEffect(() => {
    if (!isRunning && seconds === maxSeconds) {
      dataRef.current = [];
      prevTaps.current = 0;
    }
  }, [isRunning, seconds, maxSeconds]);

  // ── 4. Animation loop — always running, NEVER returns early ────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const { w: W, h: H } = sizeRef.current;

      // Skip drawing if canvas not yet sized — but keep the loop alive
      if (W === 0 || H === 0) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const ctx = canvas.getContext("2d");
      const midY = H / 2;

      // Clear without resizing (avoids context reset every frame)
      ctx.clearRect(0, 0, W * dpr, H * dpr);

      ctx.save();
      ctx.scale(dpr, dpr);

      // Background grid
      ctx.strokeStyle = "rgba(232,166,64,0.08)";
      ctx.lineWidth = 0.5;
      for (let y = 0; y < H; y += H / 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Time window
      const elapsed = isRunning ? maxSeconds - seconds : maxSeconds;
      const windowStart = Math.max(0, elapsed - 15);
      const windowEnd = elapsed;
      const timeScale = W / 15;

      const points = dataRef.current.filter(
        (p) => p.time >= windowStart && p.time <= windowEnd,
      );

      if (points.length === 0 && !isRunning) {
        // Idle state — flat line + hint text
        ctx.strokeStyle = "rgba(232,166,64,0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, midY);
        ctx.lineTo(W, midY);
        ctx.stroke();

        ctx.fillStyle = "rgba(232,166,64,0.3)";
        ctx.font = '11px "DM Sans", sans-serif';
        ctx.textAlign = "center";
        ctx.fillText("Waveform will appear here", W / 2, midY + 4);
        // ← NO early return here — fall through to rAF below ✓
      } else {
        const amplitude = H * 0.35;

        // Helper: compute y at pixel px
        const yAt = (px) => {
          const t = windowStart + px / timeScale;
          let y = midY;
          for (const p of points) {
            const dist = t - p.time;
            const sigma = 0.35;
            y -=
              p.amplitude *
              Math.exp(-(dist * dist) / (2 * sigma * sigma)) *
              amplitude;
          }
          return y;
        };

        // Waveform line
        ctx.beginPath();
        ctx.strokeStyle = "#E8A640";
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        for (let px = 0; px < W; px++) {
          px === 0 ? ctx.moveTo(px, yAt(px)) : ctx.lineTo(px, yAt(px));
        }
        ctx.stroke();

        // Glow pass
        ctx.beginPath();
        ctx.strokeStyle = "rgba(232,166,64,0.15)";
        ctx.lineWidth = 6;
        for (let px = 0; px < W; px++) {
          px === 0 ? ctx.moveTo(px, yAt(px)) : ctx.lineTo(px, yAt(px));
        }
        ctx.stroke();

        // Scanning line at right edge
        if (isRunning) {
          ctx.strokeStyle = "rgba(192,91,56,0.5)";
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(W, 0);
          ctx.lineTo(W, H);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Live BPM estimate
        if (taps > 0) {
          const currentElapsed = Math.max(1, maxSeconds - seconds);
          const estimatedBPM = Math.round((taps / currentElapsed) * 60);
          ctx.fillStyle = "rgba(232,166,64,0.6)";
          ctx.font = 'bold 11px "DM Sans", sans-serif';
          ctx.textAlign = "right";
          ctx.fillText(`~${estimatedBPM} br/min`, W - 8, 14);
        }
      }

      ctx.restore();

      // Always schedule the next frame — loop never dies
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isRunning, seconds, taps, maxSeconds]); // re-creates draw with fresh closure values

  return (
    <div className="waveform-container">
      <canvas ref={canvasRef} className="waveform-canvas" />
    </div>
  );
}
