import { Shield, Compass, AlertCircle, AlertTriangle, LockOpen, Droplets } from 'lucide-react';
import type { NavigateFn } from '../types/navigation';

const DeepLedger = ({ onNavigate }: { onNavigate: NavigateFn }) => (
  <div className="max-w-7xl mx-auto">
    <section className="mb-20 relative border-l-2 border-red-800/40 pl-8">
      <p className="font-label text-red-400/90 uppercase tracking-[0.3em] text-xs mb-4">Signal log · Encrypted</p>
      <h1 className="text-6xl md:text-8xl font-headline uppercase text-on-background tracking-tighter mb-6">
        Deep <span className="text-red-400">ledger</span>
      </h1>
      <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl leading-relaxed italic">
        A comprehensive cartography of institutional vulnerability. Every entry is a testament to the preservation of the intangible.
      </p>
    </section>

    <section className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-24">
      <div className="md:col-span-8 bg-surface-container-low p-1 rounded-none overflow-hidden group">
        <div className="h-32 bg-primary/5 flex items-end justify-center pb-4 mb-8 arch-mask">
          <h3 className="font-headline text-3xl text-primary tracking-widest uppercase">Environmental Decay</h3>
        </div>
        <div className="px-8 pb-12">
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-1">
              <p className="font-label text-xs text-zinc-500 uppercase tracking-widest">Atmospheric Stability</p>
              <p className="text-4xl font-headline italic">94.2% Consistency</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center shadow-lg">
              <Shield className="text-white/40" size={20} />
            </div>
          </div>
          <div className="h-48 w-full border-b border-primary/20 relative">
            <svg className="w-full h-full opacity-60" viewBox="0 0 400 100" preserveAspectRatio="none">
              <path d="M0,80 Q50,75 100,85 T200,60 T300,70 T400,20" fill="none" stroke="#f87171" strokeDasharray="5,3" strokeWidth="2" />
              <circle cx="400" cy="20" r="4" fill="#960711" />
            </svg>
            <div className="absolute top-0 right-0 text-[10px] font-label text-primary/40 uppercase rotate-90 translate-x-4">Ink Trace Index</div>
          </div>
          <p className="mt-6 text-sm text-zinc-400 italic leading-relaxed">
            Fluctuations in the western corridor noted during the winter solstice. Recommended recalibration of hydro-regulators in Wing B.
          </p>
        </div>
      </div>

      <div className="md:col-span-4 bg-surface-container-high p-8 flex flex-col justify-between border-t-4 border-primary/40">
        <div>
          <Compass className="text-primary mb-6" size={40} />
          <h3 className="font-headline text-2xl text-on-surface mb-4">Structural Integrity</h3>
          <ul className="space-y-6">
            <li className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary-container mt-1.5"></div>
              <div>
                <p className="font-label text-xs text-zinc-500 uppercase">Foundation Stress</p>
                <p className="text-sm italic">Nominal variance detected in the North Vault.</p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
              <div>
                <p className="font-label text-xs text-zinc-500 uppercase">Load Bearing</p>
                <p className="text-sm italic">Optimal across all primary pedestals.</p>
              </div>
            </li>
          </ul>
        </div>
        <div className="pt-8 border-t border-outline-variant/20">
          <div className="flex items-center justify-between">
            <p className="font-headline italic text-primary">Verified Status</p>
            <p className="font-label text-[10px] text-primary tracking-tighter italic">Signature: Risk Radar</p>
          </div>
        </div>
      </div>

      <div className="md:col-span-12 bg-secondary-container/10 p-12 border border-secondary-container/20 relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-secondary-container/5 rounded-full blur-3xl"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h3 className="font-headline text-4xl text-secondary mb-2">Critical Concerns</h3>
            <p className="font-label text-xs tracking-widest text-secondary uppercase">High-Tier Exposure Risks</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mt-6 md:mt-0 shadow-xl">
            <AlertCircle className="text-white/50" size={32} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: AlertTriangle, title: 'Light Exposure', desc: "Ultraviolet seepage in the 'Vignette Room' exceeds safety thresholds by 4%. Immediate shutter inspection required." },
            { icon: LockOpen, title: 'Access Breach', desc: "Unauthorized key-turn recorded at 03:42 in the Archive Sub-Level. No physical entry confirmed, digital ghosting suspected." },
            { icon: Droplets, title: 'Hydric Siphon', desc: "Condensation buildup behind the 17th-century tapestry wall. Risk of fungal spore activation: Elevated." },
          ].map((concern, idx) => (
            <div key={idx} className="space-y-4">
              <div className="flex items-center space-x-2">
                <concern.icon className="text-secondary" size={16} />
                <h4 className="font-headline text-lg text-on-surface uppercase tracking-wide">{concern.title}</h4>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed italic">{concern.desc}</p>
              <button className="text-primary text-[10px] font-label uppercase tracking-widest hover:underline">Draft Intervention</button>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
      <div className="arch-mask bg-surface-container-highest overflow-hidden aspect-[4/5] relative">
        <img 
          src="https://picsum.photos/seed/paper/800/1000" 
          alt="Archival Paper" 
          className="w-full h-full object-cover grayscale opacity-60 mix-blend-luminosity"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
      </div>
      <div className="space-y-8">
        <h2 className="text-5xl font-headline italic leading-tight">Preserving the <span className="text-primary">Untouchable</span></h2>
        <p className="text-zinc-400 leading-relaxed">
          The Archive is more than a record of damage—it is a map of our collective memory. Each scratch on a marble bust or fade in a pigment is a note in the symphony of time. Our role is not just to prevent, but to document the inevitable passage.
        </p>
        <div className="flex space-x-8">
          <button 
            onClick={() => onNavigate('INQUIRY', 'slide_up')}
            className="bg-primary-container text-on-primary font-label text-xs uppercase tracking-[0.2em] px-8 py-4 shadow-xl hover:shadow-primary/20 transition-all"
          >
            Request Transcript
          </button>
          <button className="text-primary font-label text-xs uppercase tracking-[0.2em] border-b border-primary/40 pb-2 hover:border-primary transition-all">
            Curator Guidelines
          </button>
        </div>
      </div>
    </section>
  </div>
);

export default DeepLedger;
