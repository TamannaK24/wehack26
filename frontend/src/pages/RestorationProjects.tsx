import { Lock } from 'lucide-react';
import type { NavigateFn } from '../types/navigation';

const RestorationProjects = ({ onNavigate }: { onNavigate: NavigateFn }) => (
  <div className="max-w-7xl mx-auto">
    <section className="mb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="font-label text-sm tracking-[0.3em] uppercase text-primary mb-4 block">Operation: Sanctum</span>
          <h1 className="text-5xl md:text-7xl font-headline italic tracking-tighter text-on-background max-w-2xl">Sanctuary Restoration Projects</h1>
        </div>
        <div className="text-right">
          <p className="font-label text-xs uppercase tracking-widest text-zinc-500 mb-2">Total Restoration Progress</p>
          <div className="w-64 h-2 bg-surface-container-highest relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-primary w-3/4 shadow-[0_0_15px_rgba(233,193,118,0.6)]"></div>
          </div>
          <span className="font-serif italic text-2xl text-primary mt-2 block">75% Complete</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { title: 'Varnishing the High Altar', desc: 'Repairing environmental oxidation layers on the central exhibit frames.', progress: 'Completed', img: 'https://picsum.photos/seed/rest1/600/400' },
          { title: 'The Lidar Recalibration', desc: 'Updating the volumetric perimeter sensors around the Marble Atrium.', progress: '42%', img: 'https://picsum.photos/seed/rest2/600/400' },
          { title: 'Preservation Scroll Crypt', desc: 'Securing the digital backups of the insurance archives.', progress: 'Locked', img: 'https://picsum.photos/seed/rest3/600/400' },
        ].map((project, idx) => (
          <div key={idx} className="group relative bg-surface-container-low border border-outline-variant/15 p-1 transition-all duration-700 hover:shadow-[0_0_40px_rgba(233,193,118,0.15)]">
            <div className="bg-surface p-6 h-full flex flex-col justify-between">
              <div>
                <div className="arch-mask overflow-hidden h-48 mb-6 relative">
                  <img 
                    src={project.img} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60"></div>
                </div>
                <h3 className="font-headline text-3xl mb-2 text-primary tracking-tight">{project.title}</h3>
                <p className="font-headline text-zinc-400 text-lg leading-relaxed mb-6">{project.desc}</p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-label text-xs uppercase tracking-widest text-zinc-500">{project.progress === 'Locked' ? 'Locked Exhibit' : 'Progress'}</span>
                  <span className="font-headline text-primary italic">{project.progress}</span>
                </div>
                <div className="h-1 w-full bg-surface-container-highest relative">
                  {project.progress === 'Completed' && <div className="absolute inset-0 gold-shimmer w-full opacity-80"></div>}
                  {project.progress === '42%' && <div className="absolute inset-y-0 left-0 gold-shimmer w-[42%]"></div>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>

    <section className="mt-32 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-24 bg-gradient-to-b from-transparent via-primary/40 to-transparent"></div>
      <div className="text-center mb-20">
        <span className="font-label text-sm tracking-[0.5em] uppercase text-zinc-500 mb-4 block">Legacy Recognition</span>
        <h2 className="text-6xl font-headline tracking-tighter italic">Hall of Honors</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { title: 'Vanguard of Security', date: 'Earned Dec 2023', img: 'https://picsum.photos/seed/medal1/200/200' },
          { title: 'Aegis Custodian', date: 'Locked Artifact', img: 'https://picsum.photos/seed/medal2/200/200', locked: true },
          { title: 'Master Restorer', date: 'Earned Jan 2024', img: 'https://picsum.photos/seed/medal3/200/200' },
          { title: 'Patron’s Guard', date: 'Institutional Honors', img: 'https://picsum.photos/seed/medal4/200/200', elite: true },
        ].map((medal, idx) => (
          <div key={idx} className={`flex flex-col items-center group ${medal.locked ? 'opacity-40' : ''}`}>
            <div className={`w-40 h-40 relative flex items-center justify-center p-4 border border-outline-variant/10 shadow-2xl ${medal.elite ? 'bg-secondary-container/10 border-secondary-container/20' : 'bg-surface-container-high'}`}>
              <img 
                src={medal.img} 
                alt={medal.title} 
                className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              {medal.locked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="text-zinc-600" size={32} />
                </div>
              )}
              {medal.elite && (
                <div className="absolute -top-2 -right-2 bg-secondary-container text-white px-2 py-1 font-label text-[8px] uppercase tracking-tighter">Elite</div>
              )}
            </div>
            <span className={`font-headline text-xl mt-6 transition-colors ${medal.elite ? 'text-secondary' : 'text-on-background group-hover:text-primary'}`}>{medal.title}</span>
            <span className="font-label text-[10px] uppercase tracking-widest text-zinc-500 mt-1">{medal.date}</span>
          </div>
        ))}
      </div>
    </section>
  </div>
);

export default RestorationProjects;
