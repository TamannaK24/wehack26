import { DoorOpen, DoorClosed, AlertCircle } from 'lucide-react';
import type { NavigateFn } from '../types/navigation';

const InquiryEstate = ({ onNavigate }: { onNavigate: NavigateFn }) => (
  <div className="max-w-7xl mx-auto">
    <nav className="flex items-center justify-center mb-20 space-x-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`flex items-center ${i > 1 ? 'opacity-40' : ''}`}>
          <div className={`w-12 h-16 border flex items-center justify-center ${i === 1 ? 'border-primary bg-surface-container-low' : 'border-outline-variant bg-surface-container-lowest'}`}>
            {i === 1 ? <DoorOpen className="text-primary" size={24} /> : <DoorClosed className="text-outline" size={24} />}
          </div>
          {i < 4 && <div className="h-[1px] w-8 bg-outline-variant/30"></div>}
        </div>
      ))}
    </nav>

    <section className="mb-16 text-center">
      <h1 className="text-5xl md:text-7xl font-headline uppercase tracking-tighter text-white mb-4">
        Asset <span className="text-red-400">sweep</span>
      </h1>
      <p className="font-label text-sm uppercase tracking-[0.3em] text-zinc-500">Phase I · Target profile</p>
    </section>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        { title: 'The Neoclassical', desc: 'Structures built between 1750–1850. Characterized by grandeur of scale and geometric forms.', img: 'https://picsum.photos/seed/arch1/600/800' },
        { title: 'The Gothic Revival', desc: '19th-century interpretations of medieval motifs. Features high pointed arches.', img: 'https://picsum.photos/seed/arch2/600/800', active: true },
        { title: 'The Modernist', desc: '20th-century functionalism. Emphasizes volume over mass and balance over symmetry.', img: 'https://picsum.photos/seed/arch3/600/800' },
      ].map((era, idx) => (
        <div key={idx} className={`group relative p-1 transition-all duration-700 ${era.active ? 'bg-surface-container-high ring-1 ring-secondary-container' : 'bg-surface-container-low hover:bg-primary/10'}`}>
          <div className="relative overflow-hidden aspect-[3/4] mb-6">
            <img 
              src={era.img} 
              alt={era.title} 
              className="arch-mask object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="px-4 pb-8">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-2xl font-headline text-primary">{era.title}</h3>
              {era.active && <span className="font-label text-[10px] bg-secondary-container text-white px-2 py-1 tracking-tighter">HIGH RISK</span>}
            </div>
            <p className="font-headline text-zinc-400 text-sm mb-6 leading-relaxed">{era.desc}</p>
            {era.active && (
              <div className="mb-6 p-4 bg-secondary-container/10 border-l-2 border-secondary-container">
                <div className="flex items-center gap-2 text-secondary mb-1">
                  <AlertCircle size={12} />
                  <span className="font-label text-[10px] uppercase tracking-widest">Appraisal Note</span>
                </div>
                <p className="text-xs font-headline italic text-secondary">Stone degradation and foundational subsidence common.</p>
              </div>
            )}
            <button 
              onClick={() => era.active && onNavigate('RESTORATION', 'push')}
              className={`w-full py-4 font-label text-xs tracking-widest uppercase transition-all duration-500 ${era.active ? 'bg-primary text-on-primary' : 'border border-primary/20 text-primary hover:bg-primary hover:text-on-primary'}`}
            >
              {era.active ? 'Era Selected' : 'Select This Era'}
            </button>
          </div>
        </div>
      ))}
    </div>

    <section className="mt-32 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
      <div className="md:col-span-5 order-2 md:order-1">
        <div className="relative group">
          <div className="absolute -top-4 -left-4 w-24 h-24 border-t border-l border-primary/30"></div>
          <img 
            src="https://picsum.photos/seed/ledger/800/600" 
            alt="Antique Ledger" 
            className="w-full shadow-2xl"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b border-r border-primary/30"></div>
        </div>
      </div>
      <div className="md:col-span-7 order-1 md:order-2">
        <h2 className="text-4xl font-headline text-primary mb-6 italic leading-snug">The record of your estate is the beginning of its preservation.</h2>
        <p className="font-headline text-lg text-zinc-400 mb-8 leading-relaxed max-w-lg">
          Each artifact selected informs the curatorial risk profile. Our appraisal engine cross-references historical architectural data with modern climatic shifts to ensure your legacy remains untarnished.
        </p>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 group cursor-pointer">
            <div className="w-2 h-2 bg-primary group-hover:scale-150 transition-transform"></div>
            <span className="font-label text-sm uppercase tracking-widest text-on-surface group-hover:text-primary transition-colors">Review Foundation Ethics</span>
          </div>
          <div className="flex items-center space-x-4 group cursor-pointer">
            <div className="w-2 h-2 bg-primary group-hover:scale-150 transition-transform"></div>
            <span className="font-label text-sm uppercase tracking-widest text-on-surface group-hover:text-primary transition-colors">Download Vault Protocol</span>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default InquiryEstate;
