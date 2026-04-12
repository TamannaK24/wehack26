import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type Phase = 'idle' | 'opening' | 'done';

// Sizes (aspect ratio 208:360 preserved throughout)
// default (<640px): door 128×221px  fanlight 256×98px
// sm (640-1023px):  door 160×277px  fanlight 320×123px
// lg (1024px+):     door 192×332px  fanlight 384×148px

function Fanlight({ className }: { className?: string }) {
  const W = 416, H = 160, cx = W / 2, cy = H, r = H - 6, spokes = 9;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} style={{ display: 'block' }}>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z`} fill="#0d0606" />
      {Array.from({ length: spokes }).map((_, i) => {
        const t = i / (spokes - 1);
        const angle = Math.PI - t * Math.PI;
        return (
          <line key={i} x1={cx} y1={cy}
            x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)}
            stroke="#3f1515" strokeWidth="1" />
        );
      })}
      <path d={`M ${cx - 32} ${cy} A 32 32 0 0 1 ${cx + 32} ${cy} Z`}
        fill="none" stroke="#f87171" strokeWidth="0.8" strokeOpacity="0.4" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="#3f1515" strokeWidth="2" />
      <path d={`M ${cx - r + 12} ${cy} A ${r - 12} ${r - 12} 0 0 1 ${cx + r - 12} ${cy}`}
        fill="none" stroke="#2a0d0d" strokeWidth="1" />
    </svg>
  );
}

function DoorPanel({ side, isOpening, isHovered, onClick, onHover, onLeave }: {
  side: 'left' | 'right';
  isOpening: boolean; isHovered: boolean;
  onClick: () => void; onHover: () => void; onLeave: () => void;
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
      onClick={onClick} onMouseEnter={onHover} onMouseLeave={onLeave}
      className="relative w-32 h-[221px] sm:w-40 sm:h-[277px] lg:w-48 lg:h-[332px] cursor-pointer border border-[#3f1515]/60 select-none shrink-0"
    >
      {/* Molding frame */}
      <div className="absolute inset-[5px] sm:inset-[6px] border border-[#2a0d0d]/70">
        <div className="absolute top-[8px] inset-x-[6px] sm:inset-x-[8px] h-[42%] border border-[#3f1515]/50"
          style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.7), 0 1px 0 rgba(63,21,21,0.3)' }} />
        <div className="absolute top-[calc(42%+11px)] sm:top-[calc(42%+14px)] inset-x-0 h-[7px] sm:h-[9px] bg-[#100606] border-y border-[#2a0d0d]/40" />
        <div className="absolute bottom-[8px] inset-x-[6px] sm:inset-x-[8px] h-[43%] border border-[#3f1515]/50"
          style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.7), 0 1px 0 rgba(63,21,21,0.3)' }} />
      </div>

      {/* Corner medallions */}
      {[{ top: '9px', left: '9px' }, { top: '9px', right: '9px' }].map((pos, i) => (
        <div key={i} className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 border border-[#f87171]/20 rotate-45" style={pos} />
      ))}

      {/* Top ornament */}
      <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 sm:gap-1">
        <div className="w-3 h-3 sm:w-4 sm:h-4 border border-[#f87171]/25 rotate-45" />
        <div className="w-1 h-1 bg-[#f87171]/20 rotate-45" />
      </div>

      {/* Handle */}
      <div className="absolute top-1/2 -translate-y-1/2" style={{ [isLeft ? 'right' : 'left']: '9px' }}>
        <div className="w-2 h-9 sm:w-2.5 sm:h-11 bg-[#1a0808] border border-[#f87171]/25 flex flex-col items-center justify-between py-1 rounded-sm">
          <div className="w-1 h-1 rounded-full"
            style={{ background: isHovered ? '#f87171' : '#7f1d1d', transition: 'background 0.3s', boxShadow: isHovered ? '0 0 5px #f87171aa' : 'none' }} />
          <div className="w-0.5 h-4 sm:h-5 rounded-full"
            style={{
              background: isHovered ? 'linear-gradient(to bottom, #f87171, #dc2626)' : 'linear-gradient(to bottom, #7f1d1d, #4d0f0f)',
              transition: 'background 0.3s, box-shadow 0.3s',
              boxShadow: isHovered ? '0 0 6px #f8717188' : 'none',
            }} />
          <div className="w-1 h-1 rounded-full"
            style={{ background: isHovered ? '#f87171' : '#7f1d1d', transition: 'background 0.3s' }} />
        </div>
      </div>

      {/* Keyhole */}
      {isLeft && (
        <div className="absolute bottom-[28%] right-[10px] sm:right-[12px] flex flex-col items-center">
          <div className="w-1.5 h-1.5 rounded-full border border-[#f87171]/20" />
          <div className="w-0.5 h-1.5 bg-[#f87171]/10" style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)' }} />
        </div>
      )}

      {isHovered && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(248,113,113,0.04) 50%, transparent 60%)', animation: 'shimmer 2s linear infinite' }} />
      )}
    </motion.div>
  );
}

export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [hovered, setHovered] = useState(false);

  function handleEnter() {
    if (phase !== 'idle') return;
    setPhase('opening');
    setTimeout(() => { setPhase('done'); setTimeout(onEnter, 700); }, 1600);
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
          <div className="film-grain" style={{ opacity: 0.04 }} />

          {/* Glow */}
          <motion.div className="absolute inset-0 pointer-events-none"
            animate={isOpening
              ? { background: 'radial-gradient(ellipse 80% 80% at 50% 60%, rgba(248,113,113,0.18) 0%, transparent 70%)' }
              : { background: 'radial-gradient(ellipse 40% 40% at 50% 60%, rgba(248,113,113,0.06) 0%, transparent 70%)' }}
            transition={{ duration: 1.2 }} />

          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, #000 130%)' }} />

          {/* ── Title ── */}
          <motion.div
            className="relative z-10 text-center mb-3 sm:mb-4 px-6"
            animate={isOpening ? { y: -14, opacity: 0 } : { y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-2 sm:mb-3">
              <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#f87171]/30" />
              <div className="w-1 h-1 bg-[#f87171]/50 rotate-45" />
              <p className="font-label text-[8px] sm:text-[9px] uppercase tracking-[0.45em] text-white/30">
                Est. MMXXIV · Risk Intelligence
              </p>
              <div className="w-1 h-1 bg-[#f87171]/50 rotate-45" />
              <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#f87171]/30" />
            </div>

            <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl uppercase text-[#f87171] tracking-tight leading-none mb-2">
              Risk Radar
            </h1>

            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-10 sm:w-14 bg-[#f87171]/20" />
              <p className="font-label text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-white/30">
                Personalized Risk Intelligence
              </p>
              <div className="h-px w-10 sm:w-14 bg-[#f87171]/20" />
            </div>
          </motion.div>

          {/* ── Door Assembly ── */}
          <div className="relative z-10 flex flex-col items-center">

            {/* Fanlight  default:256×98  sm:320×123  lg:384×148 */}
            <div className="relative w-[256px] h-[98px] sm:w-[320px] sm:h-[123px] lg:w-[384px] lg:h-[148px]">
              <motion.div
                className="absolute inset-x-4 bottom-0 h-12 sm:h-14 blur-2xl pointer-events-none"
                animate={isOpening
                  ? { opacity: 0.5, background: 'radial-gradient(ellipse, rgba(248,113,113,0.35), transparent)' }
                  : { opacity: 0.12, background: 'radial-gradient(ellipse, rgba(248,113,113,0.15), transparent)' }}
                transition={{ duration: 0.8 }} />
              <Fanlight className="w-full h-full" />
            </div>

            {/* Lintel  default:264  sm:328  lg:392 */}
            <div className="w-[264px] h-4 sm:w-[328px] sm:h-[18px] lg:w-[392px] lg:h-5 border-x border-b border-[#3f1515]/60 bg-[#0d0606] flex items-center justify-center">
              <div className="h-px w-3/4 bg-[#3f1515]/40" />
            </div>

            {/* Doors + pilasters */}
            <div style={{ perspective: '900px', perspectiveOrigin: '50% 60%' }} className="relative">
              <div className="flex">
                <DoorPanel side="left" isOpening={isOpening} isHovered={hovered}
                  onClick={handleEnter} onHover={() => setHovered(true)} onLeave={() => setHovered(false)} />

                {/* Interior glow */}
                <motion.div className="absolute inset-0 pointer-events-none flex items-center justify-center"
                  animate={isOpening ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}>
                  <div className="w-20 sm:w-28 h-full blur-3xl"
                    style={{ background: 'radial-gradient(ellipse, rgba(248,113,113,0.4), transparent 80%)' }} />
                </motion.div>

                {/* Seam */}
                <motion.div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 pointer-events-none"
                  animate={isOpening ? { opacity: 0 }
                    : hovered
                      ? { opacity: 1, background: 'linear-gradient(to bottom, transparent, rgba(248,113,113,0.5), transparent)' }
                      : { opacity: 0.5, background: 'linear-gradient(to bottom, transparent, rgba(248,113,113,0.15), transparent)' }}
                  transition={{ duration: 0.3 }} />

                <DoorPanel side="right" isOpening={isOpening} isHovered={hovered}
                  onClick={handleEnter} onHover={() => setHovered(true)} onLeave={() => setHovered(false)} />
              </div>

              {/* Pilasters */}
              <div className="absolute -left-3 top-0 bottom-0 w-3 bg-[#0d0606] border-l border-[#3f1515]/50" />
              <div className="absolute -right-3 top-0 bottom-0 w-3 bg-[#0d0606] border-r border-[#3f1515]/50" />
            </div>

            {/* Plinth */}
            <div className="w-[284px] h-3 sm:w-[348px] sm:h-3.5 lg:w-[412px] bg-gradient-to-b from-[#130808] to-[#0d0606] border-x border-b border-[#3f1515]/40" />
            <div className="w-[298px] h-2.5 sm:w-[362px] lg:w-[428px] bg-gradient-to-b from-[#0d0606] to-[#080404] border-x border-b border-[#3f1515]/30" />
          </div>

          {/* ── Enter prompt ── */}
          <motion.div
            className="relative z-10 mt-4 sm:mt-5 flex flex-col items-center gap-1.5"
            animate={isOpening ? { opacity: 0, y: 6 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.p
              className="font-label text-[9px] sm:text-[10px] uppercase tracking-[0.5em] text-white/30"
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              — Step Inside —
            </motion.p>
            <motion.div
              className="w-px h-4 sm:h-5 bg-gradient-to-b from-[#f87171]/40 to-transparent"
              animate={{ scaleY: [1, 1.3, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
