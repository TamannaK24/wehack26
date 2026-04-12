import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type Phase = 'idle' | 'opening' | 'done';

// --- Fanlight SVG (semicircle with radiating spokes) ---
function Fanlight() {
  const W = 416;
  const H = 160;
  const cx = W / 2;
  const cy = H;
  const r = H - 6;
  const spokes = 9;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      style={{ display: 'block' }}
    >
      {/* Arch background fill */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z`}
        fill="#0d0606"
      />
      {/* Spoke lines */}
      {Array.from({ length: spokes }).map((_, i) => {
        const t = i / (spokes - 1); // 0..1
        const angle = Math.PI - t * Math.PI; // PI → 0 (left to right)
        const x2 = cx + r * Math.cos(angle);
        const y2 = cy + r * Math.sin(angle);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x2}
            y2={y2}
            stroke="#3f1515"
            strokeWidth="1"
          />
        );
      })}
      {/* Inner ring */}
      <path
        d={`M ${cx - 32} ${cy} A 32 32 0 0 1 ${cx + 32} ${cy} Z`}
        fill="none"
        stroke="#f87171"
        strokeWidth="0.8"
        strokeOpacity="0.4"
      />
      {/* Outer arch border */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="#3f1515"
        strokeWidth="2"
      />
      {/* Inner arch border */}
      <path
        d={`M ${cx - r + 12} ${cy} A ${r - 12} ${r - 12} 0 0 1 ${cx + r - 12} ${cy}`}
        fill="none"
        stroke="#2a0d0d"
        strokeWidth="1"
      />
    </svg>
  );
}

// --- Door Panel ---
function DoorPanel({
  side,
  isOpening,
  isHovered,
  onClick,
  onHover,
  onLeave,
}: {
  side: 'left' | 'right';
  isOpening: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  const isLeft = side === 'left';
  const rotateY = isOpening ? (isLeft ? -108 : 108) : 0;
  const origin = isLeft ? '0% 50%' : '100% 50%';
  const gradient = isLeft
    ? 'linear-gradient(to right, #130808, #180c0c, #130808)'
    : 'linear-gradient(to left,  #130808, #180c0c, #130808)';

  return (
    <motion.div
      style={{ transformOrigin: origin, background: gradient }}
      animate={{ rotateY }}
      transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="relative w-52 h-[360px] cursor-pointer border border-[#3f1515]/60 select-none"
    >
      {/* Outer molding frame */}
      <div className="absolute inset-[7px] border border-[#2a0d0d]/70">
        {/* Upper raised panel */}
        <div
          className="absolute top-[10px] inset-x-[10px] h-[42%] border border-[#3f1515]/50"
          style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.7), 0 1px 0 rgba(63,21,21,0.3)' }}
        />
        {/* Middle rail */}
        <div className="absolute top-[calc(42%+18px)] inset-x-0 h-[10px] bg-[#100606] border-y border-[#2a0d0d]/40" />
        {/* Lower raised panel */}
        <div
          className="absolute bottom-[10px] inset-x-[10px] h-[43%] border border-[#3f1515]/50"
          style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.7), 0 1px 0 rgba(63,21,21,0.3)' }}
        />
      </div>

      {/* Decorative corner medallions */}
      {[
        { top: '12px', left: '12px' },
        { top: '12px', right: '12px' },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 border border-[#f87171]/20 rotate-45"
          style={pos}
        />
      ))}

      {/* Top center ornament */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <div className="w-5 h-5 border border-[#f87171]/25 rotate-45" />
        <div className="w-1.5 h-1.5 bg-[#f87171]/20 rotate-45" />
      </div>

      {/* Door handle */}
      <div
        className="absolute top-1/2 -translate-y-1/2"
        style={{ [isLeft ? 'right' : 'left']: '14px' }}
      >
        {/* Back plate */}
        <div className="w-3 h-14 bg-[#1a0808] border border-[#f87171]/25 flex flex-col items-center justify-between py-1.5 rounded-sm">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: isHovered ? '#f87171' : '#7f1d1d',
              transition: 'background 0.3s',
              boxShadow: isHovered ? '0 0 6px #f87171aa' : 'none',
            }}
          />
          {/* Handle bar */}
          <div
            className="w-1 h-7 rounded-full"
            style={{
              background: isHovered
                ? 'linear-gradient(to bottom, #f87171, #dc2626)'
                : 'linear-gradient(to bottom, #7f1d1d, #4d0f0f)',
              transition: 'background 0.3s, box-shadow 0.3s',
              boxShadow: isHovered ? '0 0 8px #f8717188' : 'none',
            }}
          />
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: isHovered ? '#f87171' : '#7f1d1d',
              transition: 'background 0.3s',
            }}
          />
        </div>
      </div>

      {/* Keyhole (left door only) */}
      {isLeft && (
        <div className="absolute bottom-[28%] right-[18px] flex flex-col items-center">
          <div className="w-2 h-2 rounded-full border border-[#f87171]/20" />
          <div className="w-1 h-2 bg-[#f87171]/10" style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)' }} />
        </div>
      )}

      {/* Shimmer on hover */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(248,113,113,0.04) 50%, transparent 60%)',
            animation: 'shimmer 2s linear infinite',
          }}
        />
      )}
    </motion.div>
  );
}

// --- Main Landing Page ---

export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [hovered, setHovered] = useState(false);

  function handleEnter() {
    if (phase !== 'idle') return;
    setPhase('opening');
    setTimeout(() => {
      setPhase('done');
      setTimeout(onEnter, 700);
    }, 1600);
  }

  const isOpening = phase === 'opening' || phase === 'done';

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          key="landing"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: '#030203' }}
        >
          {/* Film grain */}
          <div className="film-grain" style={{ opacity: 0.04 }} />

          {/* Radial atmospheric glow – expands when opening */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={
              isOpening
                ? { background: 'radial-gradient(ellipse 80% 80% at 50% 60%, rgba(248,113,113,0.18) 0%, transparent 70%)' }
                : { background: 'radial-gradient(ellipse 40% 40% at 50% 60%, rgba(248,113,113,0.06) 0%, transparent 70%)' }
            }
            transition={{ duration: 1.2 }}
          />

          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, #000 130%)' }}
          />

          {/* ── Header: museum title ── */}
          <motion.div
            className="relative z-10 text-center mb-6 px-4"
            animate={isOpening ? { y: -16, opacity: 0 } : { y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Decorative line */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#f87171]/30" />
              <div className="w-1.5 h-1.5 bg-[#f87171]/50 rotate-45" />
              <p className="font-label text-[10px] uppercase tracking-[0.6em] text-white/30">
                Est. MMXXIV · Fine Arts Insurance
              </p>
              <div className="w-1.5 h-1.5 bg-[#f87171]/50 rotate-45" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#f87171]/30" />
            </div>

            <h1 className="font-headline text-6xl md:text-8xl uppercase text-[#f87171] tracking-tight leading-none mb-3">
              The Nocturne Gallery
            </h1>

            <div className="flex items-center justify-center gap-4 mt-3">
              <div className="h-px w-20 bg-[#f87171]/20" />
              <p className="font-label text-[10px] uppercase tracking-[0.35em] text-white/30">
                Personalized Risk Intelligence
              </p>
              <div className="h-px w-20 bg-[#f87171]/20" />
            </div>
          </motion.div>

          {/* ── Door Assembly ── */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Fanlight arch */}
            <div className="w-[416px] h-[160px] relative">
              {/* Arch glow pulse */}
              <motion.div
                className="absolute inset-x-8 bottom-0 h-20 blur-2xl pointer-events-none"
                animate={
                  isOpening
                    ? { opacity: 0.5, background: 'radial-gradient(ellipse, rgba(248,113,113,0.35), transparent)' }
                    : { opacity: 0.12, background: 'radial-gradient(ellipse, rgba(248,113,113,0.15), transparent)' }
                }
                transition={{ duration: 0.8 }}
              />
              <Fanlight />
            </div>

            {/* Entablature / lintel between arch and doors */}
            <div className="w-[432px] h-5 border-x border-t-0 border-b border-[#3f1515]/60 bg-[#0d0606] flex items-center justify-center">
              <div className="h-px w-3/4 bg-[#3f1515]/40" />
            </div>

            {/* Perspective wrapper */}
            <div style={{ perspective: '900px', perspectiveOrigin: '50% 60%' }} className="relative">
              <div className="flex">
                {/* Left door */}
                <DoorPanel
                  side="left"
                  isOpening={isOpening}
                  isHovered={hovered}
                  onClick={handleEnter}
                  onHover={() => setHovered(true)}
                  onLeave={() => setHovered(false)}
                />

                {/* Interior glow between doors (revealed when opening) */}
                <motion.div
                  className="absolute inset-0 pointer-events-none flex items-center justify-center"
                  animate={isOpening ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div
                    className="w-32 h-full blur-3xl"
                    style={{ background: 'radial-gradient(ellipse, rgba(248,113,113,0.4), transparent 80%)' }}
                  />
                </motion.div>

                {/* Seam line between closed doors */}
                <motion.div
                  className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 pointer-events-none"
                  animate={
                    isOpening
                      ? { opacity: 0 }
                      : hovered
                      ? { opacity: 1, background: 'linear-gradient(to bottom, transparent, rgba(248,113,113,0.5), transparent)' }
                      : { opacity: 0.5, background: 'linear-gradient(to bottom, transparent, rgba(248,113,113,0.15), transparent)' }
                  }
                  transition={{ duration: 0.3 }}
                />

                {/* Right door */}
                <DoorPanel
                  side="right"
                  isOpening={isOpening}
                  isHovered={hovered}
                  onClick={handleEnter}
                  onHover={() => setHovered(true)}
                  onLeave={() => setHovered(false)}
                />
              </div>

              {/* Side pilasters */}
              <div className="absolute -left-4 top-0 bottom-0 w-4 bg-[#0d0606] border-l border-[#3f1515]/50" />
              <div className="absolute -right-4 top-0 bottom-0 w-4 bg-[#0d0606] border-r border-[#3f1515]/50" />
            </div>

            {/* Bottom step / plinth */}
            <div className="w-[460px] h-4 bg-gradient-to-b from-[#130808] to-[#0d0606] border-x border-b border-[#3f1515]/40" />
            <div className="w-[480px] h-3 bg-gradient-to-b from-[#0d0606] to-[#080404] border-x border-b border-[#3f1515]/30" />
          </div>

          {/* ── Enter Prompt ── */}
          <motion.div
            className="relative z-10 mt-8 flex flex-col items-center gap-2"
            animate={isOpening ? { opacity: 0, y: 6 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.p
              className="font-label text-[11px] uppercase tracking-[0.5em] text-white/30"
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              — Step Inside —
            </motion.p>
            <motion.div
              className="w-px h-6 bg-gradient-to-b from-[#f87171]/40 to-transparent"
              animate={{ scaleY: [1, 1.3, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
