import { MapPin } from 'lucide-react';
import type { PropertyAddress } from './types';

export type PropertyAddressFormProps = {
  value: PropertyAddress;
  onChange: (next: PropertyAddress) => void;
  idPrefix?: string;
};

export function PropertyAddressForm({ value, onChange, idPrefix = 'property' }: PropertyAddressFormProps) {
  const p = idPrefix;
  return (
    <section className="border border-red-950/40 bg-[#0c0a0a]/80 p-8 space-y-6 shadow-[inset_0_1px_0_rgba(248,113,113,0.06)]">
      <div className="flex items-center gap-3 text-red-400/90">
        <MapPin size={22} />
        <h2 className="font-headline text-xl uppercase tracking-wide text-white">Property address</h2>
      </div>
      <p className="text-xs text-zinc-500 font-label uppercase tracking-wider">All fields optional for now</p>

      <label className="block space-y-2" htmlFor={`${p}-street`}>
        <span className="font-label text-[10px] uppercase tracking-widest text-red-400/80">Street</span>
        <input
          id={`${p}-street`}
          name={`${p}Street`}
          autoComplete="street-address"
          value={value.street}
          onChange={(e) => onChange({ ...value, street: e.target.value })}
          className="w-full border border-red-950/40 bg-[#030203] px-4 py-3 text-sm text-white focus:border-red-800/60 focus:outline-none focus:ring-1 focus:ring-red-900/40"
          placeholder="1234 Vault Lane"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <label className="space-y-2 sm:col-span-2" htmlFor={`${p}-city`}>
          <span className="font-label text-[10px] uppercase tracking-widest text-red-400/80">City</span>
          <input
            id={`${p}-city`}
            name={`${p}City`}
            autoComplete="address-level2"
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            className="w-full border border-red-950/40 bg-[#030203] px-4 py-3 text-sm text-white focus:border-red-800/60 focus:outline-none focus:ring-1 focus:ring-red-900/40"
          />
        </label>
        <label className="space-y-2" htmlFor={`${p}-state`}>
          <span className="font-label text-[10px] uppercase tracking-widest text-red-400/80">State</span>
          <input
            id={`${p}-state`}
            name={`${p}State`}
            autoComplete="address-level1"
            value={value.state}
            onChange={(e) => onChange({ ...value, state: e.target.value })}
            className="w-full border border-red-950/40 bg-[#030203] px-4 py-3 text-sm text-white focus:border-red-800/60 focus:outline-none focus:ring-1 focus:ring-red-900/40"
            placeholder="ST"
          />
        </label>
      </div>

      <label className="block space-y-2 max-w-xs" htmlFor={`${p}-zip`}>
        <span className="font-label text-[10px] uppercase tracking-widest text-red-400/80">ZIP</span>
        <input
          id={`${p}-zip`}
          name={`${p}Zip`}
          autoComplete="postal-code"
          value={value.zip}
          onChange={(e) => onChange({ ...value, zip: e.target.value })}
          className="w-full border border-red-950/40 bg-[#030203] px-4 py-3 text-sm text-white focus:border-red-800/60 focus:outline-none focus:ring-1 focus:ring-red-900/40"
        />
      </label>
    </section>
  );
}
