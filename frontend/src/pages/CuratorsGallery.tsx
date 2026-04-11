import { AlertTriangle, Activity, Flower, ShieldCheck, ScrollText, ArrowRight, Info, Circle } from 'lucide-react';
import type { NavigateFn } from '../types/navigation';

const CuratorsGallery = ({ onNavigate }: { onNavigate: NavigateFn }) => (
  <div className="max-w-7xl mx-auto space-y-12">
    <section className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-outline-variant/10 pb-8">
      <div>
        <span className="font-label text-xs tracking-[0.3em] uppercase text-primary mb-2 block">Current Exhibition</span>
        <h1 className="text-6xl font-headline font-extrabold tracking-tighter text-on-surface">The Curator's Gallery</h1>
      </div>
      <div className="text-right">
        <div className="bg-secondary-container/10 border border-secondary-container/30 px-6 py-3 flex items-center gap-4">
          <AlertTriangle className="text-secondary" size={20} />
          <div className="text-left">
            <p className="font-label text-[10px] uppercase tracking-widest text-secondary font-bold">Active Threat Alert</p>
            <p className="font-headline italic text-secondary text-sm">Integrity breach detected in West Wing</p>
          </div>
        </div>
      </div>
    </section>

    <section className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-b from-primary/30 via-primary/5 to-transparent blur-xl opacity-20"></div>
      <div className="relative bg-surface-container-low border-[12px] border-primary-container shadow-[0_50px_100px_rgba(0,0,0,0.9),inset_0_0_20px_rgba(0,0,0,0.8)] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black/40">
          <img 
            src="https://picsum.photos/seed/blueprint/1920/1080?blur=10" 
            alt="Estate Blueprint" 
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="relative z-10 w-full h-full p-12 flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#e9c176]"></div>
                  <span className="font-label text-xs text-primary/80 uppercase tracking-widest">Structural Node: 04-A</span>
                </div>
                <div className="bg-black/60 backdrop-blur-md p-4 border-l border-primary/40 space-y-1">
                  <p className="font-label text-[10px] text-zinc-400 uppercase tracking-widest">Material Appraisal</p>
                  <p className="font-headline text-lg text-on-surface">Italian Travertine & Steel</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-black/60 backdrop-blur-md p-6 border-b border-primary/40">
                  <p className="font-label text-xs text-zinc-400 uppercase tracking-widest mb-1">Archival Grade</p>
                  <p className="text-7xl font-headline font-black text-primary drop-shadow-[0_0_15px_rgba(233,193,118,0.4)]">84<span className="text-2xl text-primary/50">/100</span></p>
                  <p className="font-headline italic text-sm text-primary/70 mt-2">Elite Risk Intelligence</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-24">
              <div className="text-center">
                <div className="w-2 h-24 bg-gradient-to-t from-primary/60 to-transparent mx-auto mb-4"></div>
                <Activity className="text-primary mx-auto mb-2" size={32} />
                <p className="font-label text-[10px] text-zinc-400 uppercase tracking-widest">Seismic Monitoring</p>
                <p className="font-headline text-primary">Active</p>
              </div>
              <div className="text-center opacity-40">
                <div className="w-2 h-24 bg-gradient-to-t from-primary/60 to-transparent mx-auto mb-4"></div>
                <Flower className="text-primary mx-auto mb-2" size={32} />
                <p className="font-label text-[10px] text-zinc-500 uppercase tracking-widest">HVAC Filtration</p>
                <p className="font-headline text-zinc-500">Stable</p>
              </div>
              <div className="text-center opacity-40">
                <div className="w-2 h-24 bg-gradient-to-t from-primary/60 to-transparent mx-auto mb-4"></div>
                <ShieldCheck className="text-primary mx-auto mb-2" size={32} />
                <p className="font-label text-[10px] text-zinc-500 uppercase tracking-widest">Perimeter Grid</p>
                <p className="font-headline text-zinc-500">Engaged</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="bg-surface p-8 shadow-2xl relative overflow-hidden group hover:translate-y-[-4px] transition-transform duration-500">
        <ScrollText className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity" size={120} />
        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-6">Historical Context</p>
        <h3 className="text-3xl font-headline mb-4 text-on-surface">Provenance Audit</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
            <span className="font-label text-xs text-zinc-500 uppercase">Original Build</span>
            <span className="font-headline text-on-surface">1924, Neo-Gothic</span>
          </div>
          <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
            <span className="font-label text-xs text-zinc-500 uppercase">Last Appraisal</span>
            <span className="font-headline text-on-surface">Oct 2023</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-label text-xs text-zinc-500 uppercase">Risk Level</span>
            <span className="font-headline text-secondary font-bold uppercase tracking-widest text-xs">Nominal</span>
          </div>
        </div>
        <div className="mt-8">
          <button 
            onClick={() => onNavigate('ARCHIVE', 'push')}
            className="w-full bg-primary-container text-on-primary py-3 font-headline uppercase tracking-widest text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            View Scroll <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="bg-surface p-8 shadow-2xl relative overflow-hidden group hover:translate-y-[-4px] transition-transform duration-500">
        <Activity className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity" size={120} />
        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-6">Climate Integrity</p>
        <h3 className="text-3xl font-headline mb-4 text-on-surface">Atmospheric Log</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background p-4 text-center">
            <p className="font-label text-[10px] text-zinc-500 uppercase mb-1">Humidity</p>
            <p className="font-headline text-2xl text-primary">48%</p>
          </div>
          <div className="bg-background p-4 text-center">
            <p className="font-label text-[10px] text-zinc-500 uppercase mb-1">Temp</p>
            <p className="font-headline text-2xl text-primary">68°F</p>
          </div>
        </div>
        <div className="mt-6 p-4 bg-secondary-container/5 border border-secondary-container/20 flex gap-3">
          <Info className="text-secondary" size={16} />
          <p className="font-label text-[10px] text-zinc-400 uppercase leading-relaxed">Minor variance detected in archival storage chamber 3.</p>
        </div>
      </div>

      <div className="bg-secondary-container/20 p-8 shadow-2xl relative border-t-4 border-secondary-container overflow-hidden group hover:translate-y-[-4px] transition-transform duration-500">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-secondary-container/20 rounded-full blur-3xl group-hover:bg-secondary-container/40 transition-all"></div>
        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary mb-6">Security Incident</p>
        <h3 className="text-3xl font-headline mb-4 text-secondary">Active Perimeter Breach</h3>
        <p className="font-headline text-sm text-zinc-400 mb-6 italic leading-relaxed">Unidentified motion detected near the Northern Vault entry. Automated containment systems engaged.</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-secondary">
            <Circle size={12} fill="currentColor" />
            <span className="font-label text-xs uppercase tracking-widest font-bold">Deploy Guardians</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-500">
            <Circle size={12} />
            <span className="font-label text-xs uppercase tracking-widest">Silent Alarm</span>
          </div>
        </div>
        <button className="mt-8 w-full border border-secondary-container text-secondary py-3 font-label uppercase tracking-[0.2em] text-[10px] font-black hover:bg-secondary-container hover:text-white transition-all">
          Execute Protocols
        </button>
      </div>
    </section>

    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-headline font-bold">Curated Assets</h2>
        <span className="font-label text-xs text-zinc-500 uppercase tracking-widest">Showing 4 of 124 works</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {[
          { id: 'NY-921', title: 'The Silent Observer', value: '$4.2M', img: 'https://picsum.photos/seed/art1/400/500' },
          { id: 'NY-922', title: 'Ethereal Form', value: '$1.8M', img: 'https://picsum.photos/seed/art2/400/500' },
          { id: 'NY-923', title: 'The Iron Crown', value: '$0.9M', img: 'https://picsum.photos/seed/art3/400/500' },
          { id: 'NY-924', title: 'Nocturnal Flow', value: '$2.1M', img: 'https://picsum.photos/seed/art4/400/500' },
        ].map((asset) => (
          <div key={asset.id} className="bg-surface-container p-6 flex flex-col gap-4 group cursor-pointer border border-transparent hover:border-primary/20 transition-all">
            <div className="w-full aspect-[4/5] bg-surface-container-highest overflow-hidden">
              <img 
                src={asset.img} 
                alt={asset.title} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="font-label text-[10px] text-primary uppercase tracking-widest mb-1">Asset ID: {asset.id}</p>
              <h4 className="font-headline text-lg">{asset.title}</h4>
              <p className="font-headline italic text-sm text-zinc-500">Estimated value: {asset.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

export default CuratorsGallery;
