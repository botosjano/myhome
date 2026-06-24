'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Languages, Loader2, MapPin, Save } from 'lucide-react';
import {
  DISTRICTS,
  ENERGY_RATINGS,
  HEATING_OPTIONS,
  PROPERTY_TYPES,
} from '@/lib/districts';
import type {
  Condition,
  EnergyRating,
  HeatingType,
  Property,
  PropertyType,
} from '@/lib/types';
import { createProperty, updateProperty, type PropertyDraft } from '@/lib/admin/store';
import { cn, propertySlug } from '@/lib/utils';
import { loadGoogleMaps } from '@/lib/google-maps';
import ImageUploader from './ImageUploader';

const CONDITIONS: Condition[] = ['új', 'felújított', 'felújítandó'];

function emptyDraft(): PropertyDraft {
  return {
    title_hu: '',
    title_en: '',
    description_hu: '',
    description_en: '',
    price: 0,
    currency: 'HUF',
    size_m2: 0,
    rooms: 0,
    floor: null,
    listing_type: 'elado',
    region: 'budapest',
    district: 'I. kerület',
    city: null,
    type: 'lakás',
    status: 'active',
    featured: false,
    images: [],
    video_url: null,
    lat: null,
    lng: null,
    reference_number: '',
    year_built: null,
    parking: false,
    garden: false,
    lift: false,
    balcony: false,
    ac: false,
    heating: 'gaz',
    energy_rating: 'A',
    condition: 'új',
    created_at: new Date().toISOString(),
  };
}

export default function PropertyForm({ initial }: { initial?: Property }) {
  const router = useRouter();
  const isEdit = Boolean(initial);
  const [form, setForm] = useState<PropertyDraft>(initial ?? emptyDraft());
  const [translatingField, setTranslatingField] = useState<'title' | 'description' | null>(null);
  const [errorField, setErrorField] = useState<'title' | 'description' | null>(null);
  const [addressQuery, setAddressQuery] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const set = <K extends keyof PropertyDraft>(key: K, value: PropertyDraft[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const num = (v: string): number => (v === '' ? 0 : Number(v));
  const numOrNull = (v: string): number | null => (v === '' ? null : Number(v));

  /** Translate the Hungarian title/description to English via the DeepL proxy. */
  const translateField = async (which: 'title' | 'description') => {
    const source = (which === 'title' ? form.title_hu : form.description_hu).trim();
    if (!source) return;
    const toKey: 'title_en' | 'description_en' = which === 'title' ? 'title_en' : 'description_en';
    setTranslatingField(which);
    setErrorField(null);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: source, sourceLang: 'HU', targetLang: 'EN-GB' }),
      });
      const data = await res.json();
      if (!res.ok || !data.translatedText) throw new Error('translation failed');
      set(toKey, data.translatedText as string);
    } catch {
      setErrorField(which);
    } finally {
      setTranslatingField(null);
    }
  };

  const TranslateButton = ({ which }: { which: 'title' | 'description' }) => {
    const hu = which === 'title' ? form.title_hu : form.description_hu;
    return (
      <button
        type="button"
        onClick={() => translateField(which)}
        disabled={translatingField !== null || !hu.trim()}
        className="flex items-center gap-1.5 rounded-sm border border-gold px-3 py-1 font-sans text-xs uppercase tracking-wide text-gold-dark transition-colors hover:bg-gold hover:text-navy disabled:opacity-40"
      >
        {translatingField === which ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Languages className="h-3.5 w-3.5" />
        )}
        Fordítás DeepL-lel
      </button>
    );
  };

  const translateError = 'Fordítás sikertelen, próbáld újra';

  /** Look up coordinates for the typed address (or the district/city) via Google Geocoding. */
  const geocode = async () => {
    const fallback = form.region === 'budapest' ? `${form.district}, Budapest` : (form.city ?? '');
    const query = (addressQuery.trim() || fallback).trim();
    if (!query) {
      setGeoError('Adj meg egy címet vagy környéket.');
      return;
    }
    setGeocoding(true);
    setGeoError('');
    try {
      const g = await loadGoogleMaps();
      const { results } = await new g.maps.Geocoder().geocode({ address: `${query}, Magyarország` });
      const loc = results?.[0]?.geometry?.location;
      if (!loc) throw new Error('no result');
      setForm((f) => ({ ...f, lat: Number(loc.lat().toFixed(6)), lng: Number(loc.lng().toFixed(6)) }));
    } catch {
      setGeoError('Nem sikerült a koordináták lekérése. Ellenőrizd a címet, vagy add meg kézzel.');
    } finally {
      setGeocoding(false);
    }
  };

  const save = async (preview: boolean) => {
    setSaving(true);
    setSaveError('');
    try {
      let saved: Property;
      if (initial) {
        await updateProperty(initial.id, form);
        saved = { ...form, id: initial.id };
      } else {
        saved = await createProperty(form);
      }
      if (preview) {
        window.open(`/hu/ingatlan/${propertySlug(saved)}`, '_blank');
      }
      router.push('/admin/ingatlanok');
    } catch (e) {
      setSaveError(
        e instanceof Error ? `Mentés sikertelen: ${e.message}` : 'Mentés sikertelen. Próbáld újra.',
      );
      setSaving(false);
    }
  };

  // ── Shared styles ──
  const field =
    'w-full rounded-sm border border-navy/15 bg-white px-3 py-2.5 font-sans text-sm text-navy ' +
    'placeholder:text-navy/35 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold';
  const label = 'mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wide text-navy/55';
  const card = 'rounded-sm border border-navy/10 bg-white p-5 shadow-card';
  const seg = (active: boolean) =>
    cn(
      'rounded-sm border px-4 py-1.5 font-sans text-xs uppercase tracking-wide transition-colors',
      active ? 'border-gold bg-gold text-navy' : 'border-navy/15 text-navy/60 hover:border-gold',
    );

  const Toggle = ({
    value,
    onChange,
    yes = 'Van',
    no = 'Nincs',
  }: {
    value: boolean;
    onChange: (v: boolean) => void;
    yes?: string;
    no?: string;
  }) => (
    <div className="flex gap-2">
      <button type="button" onClick={() => onChange(true)} className={seg(value)}>
        {yes}
      </button>
      <button type="button" onClick={() => onChange(false)} className={seg(!value)}>
        {no}
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* Titles & descriptions */}
      <div className={card}>
        <h2 className="mb-4 font-serif text-lg text-navy">Alapadatok</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Cím (magyar)</label>
            <input className={field} value={form.title_hu} onChange={(e) => set('title_hu', e.target.value)} />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className={label + ' mb-0'}>Cím (angol)</span>
              <TranslateButton which="title" />
            </div>
            <input className={field} value={form.title_en} onChange={(e) => set('title_en', e.target.value)} />
            {errorField === 'title' && (
              <p className="mt-1.5 font-sans text-xs text-red-600">{translateError}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className={label}>Leírás (magyar)</label>
          <textarea
            rows={5}
            className={field}
            value={form.description_hu}
            onChange={(e) => set('description_hu', e.target.value)}
          />
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className={label + ' mb-0'}>Leírás (angol)</span>
            <TranslateButton which="description" />
          </div>
          <textarea
            rows={5}
            className={field}
            value={form.description_en}
            onChange={(e) => set('description_en', e.target.value)}
          />
          {errorField === 'description' && (
            <p className="mt-1.5 font-sans text-xs text-red-600">{translateError}</p>
          )}
        </div>
      </div>

      {/* Price & type */}
      <div className={card}>
        <h2 className="mb-4 font-serif text-lg text-navy">Ár és típus</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Ár</label>
            <input
              type="number"
              className={field}
              value={form.price || ''}
              onChange={(e) => set('price', num(e.target.value))}
            />
          </div>
          <div>
            <label className={label}>Pénznem</label>
            <Toggle
              value={form.currency === 'HUF'}
              onChange={(v) => set('currency', v ? 'HUF' : 'EUR')}
              yes="HUF"
              no="EUR"
            />
          </div>
          <div>
            <label className={label}>Hirdetés típusa</label>
            <Toggle
              value={form.listing_type === 'elado'}
              onChange={(v) => set('listing_type', v ? 'elado' : 'kiado')}
              yes="Eladó"
              no="Kiadó"
            />
          </div>
          <div>
            <label className={label}>Ingatlan típusa</label>
            <select
              className={field}
              value={form.type}
              onChange={(e) => set('type', e.target.value as PropertyType)}
            >
              {PROPERTY_TYPES.map((pt) => (
                <option key={pt} value={pt}>
                  {pt.charAt(0).toUpperCase() + pt.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className={card}>
        <h2 className="mb-4 font-serif text-lg text-navy">Elhelyezkedés</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Helyszín</label>
            <Toggle
              value={form.region === 'budapest'}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  region: v ? 'budapest' : 'videk',
                  district: v ? 'I. kerület' : '',
                  city: v ? null : (f.city ?? ''),
                }))
              }
              yes="Budapest"
              no="Vidék"
            />
          </div>
          {form.region === 'budapest' ? (
            <div>
              <label className={label}>Kerület</label>
              <select
                className={field}
                value={form.district}
                onChange={(e) => set('district', e.target.value)}
              >
                {DISTRICTS.map((d) => (
                  <option key={d.label} value={d.label}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className={label}>Város / régió</label>
              <input
                className={field}
                value={form.city ?? ''}
                onChange={(e) => set('city', e.target.value)}
                placeholder="pl. Balaton (Tihany)"
              />
            </div>
          )}
          <div className="sm:col-span-2">
            <label className={label}>Cím a térképhez</label>
            <div className="flex gap-2">
              <input
                className={field}
                value={addressQuery}
                onChange={(e) => setAddressQuery(e.target.value)}
                placeholder={
                  form.region === 'budapest'
                    ? 'pl. Nádor utca 5, Budapest — vagy hagyd üresen a kerülethez'
                    : 'pl. Tihany, Kossuth utca — vagy hagyd üresen a városhoz'
                }
              />
              <button
                type="button"
                onClick={geocode}
                disabled={geocoding}
                className="flex shrink-0 items-center gap-1.5 rounded-sm border border-gold px-3 py-1 font-sans text-xs uppercase tracking-wide text-gold-dark transition-colors hover:bg-gold hover:text-navy disabled:opacity-40"
              >
                {geocoding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5" />}
                Koordináták keresése
              </button>
            </div>
            {geoError ? (
              <p className="mt-1.5 font-sans text-xs text-red-600">{geoError}</p>
            ) : (
              <p className="mt-1.5 font-sans text-xs text-navy/45">
                A gomb kitölti a lenti koordinátákat. Diszkrécióhoz a kerület / környék is elég.
              </p>
            )}
          </div>
          <div>
            <label className={label}>Földrajzi szélesség (lat)</label>
            <input
              type="number"
              className={field}
              value={form.lat ?? ''}
              onChange={(e) => set('lat', numOrNull(e.target.value))}
              placeholder="opcionális"
            />
          </div>
          <div>
            <label className={label}>Földrajzi hosszúság (lng)</label>
            <input
              type="number"
              className={field}
              value={form.lng ?? ''}
              onChange={(e) => set('lng', numOrNull(e.target.value))}
              placeholder="opcionális"
            />
          </div>
        </div>
      </div>

      {/* Parameters */}
      <div className={card}>
        <h2 className="mb-4 font-serif text-lg text-navy">Paraméterek</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={label}>Alapterület (m²)</label>
            <input
              type="number"
              className={field}
              value={form.size_m2 || ''}
              onChange={(e) => set('size_m2', num(e.target.value))}
            />
          </div>
          <div>
            <label className={label}>Szobaszám (min.)</label>
            <input
              type="number"
              className={field}
              value={form.rooms || ''}
              onChange={(e) => set('rooms', num(e.target.value))}
            />
          </div>
          <div>
            <label className={label}>Emelet</label>
            <input
              type="number"
              className={field}
              value={form.floor ?? ''}
              onChange={(e) => set('floor', numOrNull(e.target.value))}
            />
          </div>
          <div>
            <label className={label}>Építés éve</label>
            <input
              type="number"
              className={field}
              value={form.year_built ?? ''}
              onChange={(e) => set('year_built', numOrNull(e.target.value))}
            />
          </div>
          <div>
            <label className={label}>Állapot</label>
            <select
              className={field}
              value={form.condition}
              onChange={(e) => set('condition', e.target.value as Condition)}
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Fűtés</label>
            <select
              className={field}
              value={form.heating}
              onChange={(e) => set('heating', e.target.value as HeatingType)}
            >
              {HEATING_OPTIONS.map((h) => (
                <option key={h} value={h}>
                  {h.charAt(0).toUpperCase() + h.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className={label}>Energetikai besorolás</label>
          <div className="flex flex-wrap gap-2">
            {ENERGY_RATINGS.map((er) => (
              <button
                key={er}
                type="button"
                onClick={() => set('energy_rating', er as EnergyRating)}
                className={seg(form.energy_rating === er)}
              >
                {er}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className={label}>Parkoló</label>
            <Toggle value={form.parking} onChange={(v) => set('parking', v)} />
          </div>
          <div>
            <label className={label}>Kertkapcsolat</label>
            <Toggle value={form.garden} onChange={(v) => set('garden', v)} />
          </div>
          <div>
            <label className={label}>Lift</label>
            <Toggle value={form.lift} onChange={(v) => set('lift', v)} />
          </div>
          <div>
            <label className={label}>Erkély</label>
            <Toggle value={form.balcony} onChange={(v) => set('balcony', v)} />
          </div>
          <div>
            <label className={label}>Légkondicionáló</label>
            <Toggle value={form.ac} onChange={(v) => set('ac', v)} />
          </div>
        </div>
      </div>

      {/* Media */}
      <div className={card}>
        <h2 className="mb-4 font-serif text-lg text-navy">Képek és videó</h2>
        <ImageUploader images={form.images} onChange={(imgs) => set('images', imgs)} />
        <div className="mt-4">
          <label className={label}>Videó URL</label>
          <input
            className={field}
            value={form.video_url ?? ''}
            onChange={(e) => set('video_url', e.target.value || null)}
            placeholder="https://…"
          />
        </div>
      </div>

      {/* Publishing */}
      <div className={card}>
        <h2 className="mb-4 font-serif text-lg text-navy">Megjelenítés</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isEdit && (
            <div>
              <label className={label}>Referenciaszám</label>
              <input
                className={field + ' bg-navy/5 text-navy/60'}
                value={form.reference_number}
                readOnly
              />
            </div>
          )}
          <div>
            <label className={label}>Státusz</label>
            <select
              className={field}
              value={form.status}
              onChange={(e) => set('status', e.target.value as Property['status'])}
            >
              <option value="active">Aktív</option>
              <option value="hidden">Rejtett</option>
              <option value="sold">Eladva</option>
            </select>
          </div>
          <div>
            <label className={label}>Kiemelt</label>
            <Toggle value={form.featured} onChange={(v) => set('featured', v)} yes="Igen" no="Nem" />
          </div>
        </div>
      </div>

      {/* Actions */}
      {saveError && (
        <p className="rounded-sm border border-red-300 bg-red-50 px-4 py-3 font-sans text-sm text-red-700">
          {saveError}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => save(false)}
          disabled={saving}
          className="flex items-center gap-2 rounded-sm bg-gold px-6 py-3 font-sans text-sm font-semibold uppercase tracking-wide text-navy transition-colors hover:bg-gold-light disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEdit ? 'Mentés' : 'Létrehozás'}
        </button>
        <button
          type="button"
          onClick={() => save(true)}
          disabled={saving}
          className="flex items-center gap-2 rounded-sm border border-navy/25 px-6 py-3 font-sans text-sm font-semibold uppercase tracking-wide text-navy transition-colors hover:bg-navy hover:text-white disabled:opacity-50"
        >
          <Eye className="h-4 w-4" />
          Mentés és előnézet
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/ingatlanok')}
          className="rounded-sm px-6 py-3 font-sans text-sm uppercase tracking-wide text-navy/60 transition-colors hover:text-navy"
        >
          Mégse
        </button>
      </div>
    </div>
  );
}
