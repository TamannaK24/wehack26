import { useEffect } from 'react';
import type { NavigateFn } from '../types/navigation';

const CuratorsGallery = ({ onNavigate }: { onNavigate: NavigateFn }) => {
  useEffect(() => {
    const link1 = document.createElement('link');
    link1.rel = 'stylesheet';
    link1.href =
      'https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Manrope:wght@300;400;600&family=Public+Sans:wght@300;400;600&display=swap';
    document.head.appendChild(link1);

    const link2 = document.createElement('link');
    link2.rel = 'stylesheet';
    link2.href =
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    document.head.appendChild(link2);

    return () => {
      document.head.removeChild(link1);
      document.head.removeChild(link2);
    };
  }, []);

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 overflow-x-hidden dark">
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
        }
        .parchment-texture {
          background-color: #f4e4bc;
          background-image: radial-gradient(#dcc99e 1px, transparent 0);
          background-size: 20px 20px;
        }
        .gold-glow { box-shadow: 0 0 15px 2px rgba(233, 195, 73, 0.4); }
        .red-glow  { box-shadow: 0 0 15px 2px rgba(239, 68, 68, 0.5); }
        .amber-glow { box-shadow: 0 0 15px 2px rgba(245, 158, 11, 0.5); }
        .museum-spotlight {
          background: radial-gradient(circle at center, rgba(51,53,57,0.4) 0%, rgba(17,19,23,1) 70%);
        }
        .isometric-view {
          transform: perspective(1000px) rotateX(45deg) rotateZ(-45deg) translateX(-3%);
          transform-origin: center center;
        }
      `}</style>

    
      {/* Main Canvas */}
      <main className="pt-12 min-h-screen museum-spotlight relative">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12 grid grid-cols-12 gap-8 xl:gap-10 relative z-10">

          {/* Left Column: Header, Score Gauge, Alert Card */}
          <div className="col-span-12 lg:col-span-5 xl:col-span-4 flex flex-col gap-10">

            <section>
              <h2 className="font-label text-[10px] uppercase tracking-[0.3em] text-primary/60 mb-2">Exhibit 01</h2>
              <h1 className="font-headline text-5xl font-light text-on-surface leading-tight">
                Residence <br />
                <span className="italic text-primary">Master Plan</span>
              </h1>
            </section>

            {/* Risk Score Gauge */}
            <div className="relative w-60 h-60 mx-auto lg:mx-0">
              <div className="absolute inset-0 border-[10px] border-surface-container-high rounded-full" />
              <div className="absolute -inset-2 border border-primary/30 rounded-full" />
              <div className="absolute inset-4 border-2 border-primary rounded-full flex flex-col items-center justify-center bg-surface-container-low shadow-2xl">
                <span className="font-label text-[10px] uppercase tracking-widest text-primary/70 mb-1">Safety Rating</span>
                <div className="font-headline text-6xl font-bold text-primary">84</div>
                <span className="font-serif italic text-on-surface-variant text-sm mt-1">High Security</span>
              </div>
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  className="text-primary"
                  cx="50%"
                  cy="50%"
                  fill="transparent"
                  r="110"
                  stroke="currentColor"
                  strokeDasharray="691"
                  strokeDashoffset="110"
                  strokeLinecap="square"
                  strokeWidth="10"
                />
              </svg>
            </div>

            {/* Alert Card */}
            <div className="relative">
              <div className="parchment-texture p-8 shadow-2xl border-l-4 border-red-700 relative z-20">
                <div className="flex items-center gap-2 mb-4 border-b border-surface/10 pb-2">
                  <span className="material-symbols-outlined text-red-700 text-lg">priority_high</span>
                  <h3 className="font-headline text-xl italic font-bold text-surface">
                    Archival Alert: High-Priority Risk
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="font-label text-[10px] uppercase tracking-widest text-red-800 font-bold mb-1">
                      Incident Report 402-A
                    </p>
                    <h4 className="font-serif text-lg text-surface leading-tight font-semibold italic">
                      Thermal Spike: East Wing Kitchen
                    </h4>
                  </div>
                  <p className="font-body text-xs text-surface/90 leading-relaxed italic">
                    Sensors in the Primary Kitchen (Zone 3) have registered unprecedented thermal fluctuations
                    exceeding standard archival safety thresholds. This suggests a potential failure in the
                    automated climate suppression system.
                  </p>
                  <div className="bg-white/30 p-3 border border-red-700/20">
                    <p className="font-label text-[9px] uppercase tracking-[0.2em] text-red-900 font-bold mb-1">
                      Recommended Action
                    </p>
                    <p className="font-body text-[11px] text-surface font-medium italic">
                      Execute immediate vault-lock override and dispatch a physical appraisal team to
                      recalibrate primary thermal sensors.
                    </p>
                  </div>
                </div>
              </div>
              {/* Connector line toward red pin on blueprint */}
              <div
                className="absolute top-1/2 left-[calc(100%-8px)] w-[40vw] h-[1px] bg-red-700/40 hidden lg:block origin-left pointer-events-none z-10"
                style={{ transform: 'translateY(-50%) rotate(2deg)' }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-700 rotate-45 opacity-60" />
              </div>
            </div>
          </div>

          {/* Right Column: Isometric Blueprint Map */}
          <div className="col-span-12 lg:col-span-7 xl:col-span-8 relative flex items-center justify-center min-h-[420px] lg:min-h-[500px]">
            <div className="relative w-full max-w-xl lg:max-w-2xl aspect-[4/3] flex items-center justify-center">
              <div className="relative w-full h-full isometric-view transition-transform duration-1000 hover:scale-[1.02]">

                {/* Blueprint base */}
                <div className="absolute inset-0 bg-surface-container-low/10 border border-primary/10 rounded-sm shadow-2xl overflow-hidden backdrop-blur-sm">
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{
                      backgroundImage:
                        'linear-gradient(#e9c349 1px, transparent 1px), linear-gradient(90deg, #e9c349 1px, transparent 1px)',
                      backgroundSize: '30px 30px',
                    }}
                  />
                </div>

                <div className="relative w-full h-full p-8 flex items-center justify-center">
                  <img
                    alt="architectural floor plan"
                    className="max-w-[90%] max-h-[90%] object-contain filter grayscale invert brightness-[0.5] contrast-125 opacity-40"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCH01Yc65ZlyC8QvX7W90YkZ6_L-2zO9QfM5e5QoN3Z9G4r_oM7vU8_y9lD_r7YmE6f7n8m9p0q1r2s3t4u5v6w7x8y9z0_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6"
                  />

                  {/* Red Pin — High Priority */}
                  <div className="absolute top-[38%] left-[32%] z-20 group">
                    <div className="w-5 h-5 bg-red-500 rounded-full red-glow animate-pulse cursor-pointer border-2 border-white/20" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-700 rounded-full border border-white" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-60 parchment-texture p-4 shadow-2xl border border-[#c5b38a] rounded-sm transform origin-bottom scale-0 group-hover:scale-100 transition-all duration-300 z-30">
                      <h4 className="font-headline text-lg text-surface font-bold border-b border-surface/20 mb-2 pb-1">
                        Primary Kitchen
                      </h4>
                      <p className="font-body text-[11px] text-surface leading-relaxed italic mb-2">
                        High Priority: Sensor recalibration required immediately due to thermal spikes.
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="font-label text-[9px] uppercase tracking-widest text-red-700 font-bold">
                          Critical Alert
                        </span>
                        <span className="material-symbols-outlined text-red-700 text-base">priority_high</span>
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 parchment-texture rotate-45 -mt-1.5 border-r border-b border-[#c5b38a]" />
                    </div>
                  </div>

                  {/* Amber Pin — Medium Priority */}
                  <div className="absolute top-[22%] left-[55%] z-10 group">
                    <div className="w-3.5 h-3.5 bg-amber-500 rounded-full amber-glow cursor-pointer border border-background" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-60 parchment-texture p-4 shadow-2xl border border-[#c5b38a] rounded-sm transform origin-bottom scale-0 group-hover:scale-100 transition-all duration-300 z-30">
                      <h4 className="font-headline text-lg text-surface font-bold border-b border-surface/20 mb-2 pb-1">
                        Master Suite
                      </h4>
                      <p className="font-body text-[11px] text-surface leading-relaxed italic mb-2">
                        Medium Priority: Vault entry log shows unusual activity timing.
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="font-label text-[9px] uppercase tracking-widest text-amber-700 font-bold">
                          Inquiry Required
                        </span>
                        <span className="material-symbols-outlined text-amber-700 text-base">info</span>
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 parchment-texture rotate-45 -mt-1.5 border-r border-b border-[#c5b38a]" />
                    </div>
                  </div>

                  {/* Gold Pin — Low Priority */}
                  <div className="absolute top-[68%] left-[42%] z-10 group">
                    <div className="w-3 h-3 bg-primary rounded-full gold-glow cursor-pointer border border-background" />
                  </div>

                  {/* Gold Pin — Low Priority */}
                  <div className="absolute top-[52%] left-[68%] z-10 group">
                    <div className="w-3 h-3 bg-primary/80 rounded-full border border-primary/40 hover:bg-primary transition-all cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>

            {/* Ambient glows */}
            <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
            <div className="absolute top-[-5%] left-[-5%] w-72 h-72 bg-primary/5 rounded-full blur-[100px]" />
          </div>
        </div>
      </main>

      {/* Chatbot FAB */}
      <div className="fixed bottom-10 right-10 z-[60] group">
        <div className="relative">
          <div className="absolute bottom-full right-0 mb-4 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap translate-y-2 group-hover:translate-y-0 duration-300">
            <span className="bg-surface-container-high text-primary px-6 py-3 font-serif italic text-base border border-primary/20 shadow-2xl block">
              Inquire with the Assistant
            </span>
          </div>
          <button className="w-16 h-16 bg-surface-container-high border-2 border-primary rounded-sm shadow-[0_0_30px_rgba(233,195,73,0.3)] flex items-center justify-center transition-all hover:scale-105 active:scale-95">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-primary text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                history_edu
              </span>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-background" />
            </div>
          </button>
        </div>
      </div>

      {/* Background Vignette */}
      <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_250px_rgba(0,0,0,0.9)] z-0" />
    </div>
  );
};

export default CuratorsGallery;