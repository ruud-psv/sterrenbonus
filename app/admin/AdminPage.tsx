'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { Prize } from '@/app/types';
import type { Theme, ThemeOverrides } from '@/lib/themes';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

interface AdminPageProps {
  theme: Theme;
  initialOverrides: ThemeOverrides;
}

// ── Theme settings section ──────────────────────────────────────────────────

interface ThemeSettingsProps {
  theme: Theme;
  initialOverrides: ThemeOverrides;
}

function ThemeSettings({ theme, initialOverrides }: ThemeSettingsProps) {
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [open, setOpen] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const bgUploadRef = useRef<HTMLInputElement>(null);

  // Local editable state — starts from current merged values (= base + existing overrides)
  const [primaryColor, setPrimaryColor] = useState(theme.colors.primary);
  const [goldColor, setGoldColor] = useState(theme.colors.gold);
  const [bgColor, setBgColor] = useState(theme.colors.bg);
  const [logoUrl, setLogoUrl] = useState(initialOverrides.logo ?? theme.logo);
  const [bgUrl, setBgUrl] = useState(initialOverrides.backgroundImage ?? theme.backgroundImage);
  const [appTitle, setAppTitle] = useState(initialOverrides.appTitle ?? theme.appTitle);
  const [showStars, setShowStars] = useState(initialOverrides.showStars ?? theme.showStars);

  const primary = theme.colors.primary;

  const save = useCallback(async () => {
    setSaving(true);
    setStatus(null);
    const overrides: ThemeOverrides = {
      colors: { primary: primaryColor, gold: goldColor, bg: bgColor },
      logo: logoUrl || undefined,
      backgroundImage: bgUrl,
      backgroundPosition: 'center 30%',
      showStars,
      appTitle,
    };
    try {
      const res = await fetch(`/api/theme?theme=${theme.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overrides),
      });
      if (!res.ok) throw new Error('Server error');
      setStatus({ type: 'success', message: 'Opgeslagen — herlaad de pagina om wijzigingen te zien' });
      setTimeout(() => setStatus(null), 4000);
    } catch {
      setStatus({ type: 'error', message: 'Opslaan mislukt' });
    } finally {
      setSaving(false);
    }
  }, [theme.id, primaryColor, goldColor, bgColor, logoUrl, bgUrl, appTitle, showStars]);

  const uploadFile = useCallback(async (file: File, onUrl: (url: string) => void) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json() as { url?: string; error?: string };
    if (data.url) {
      onUrl(data.url);
    } else {
      setStatus({ type: 'error', message: data.error ?? 'Upload mislukt' });
    }
  }, []);

  return (
    <div
      className="rounded-2xl overflow-hidden mb-6"
      style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
    >
      {/* Header / toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff' }}
      >
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Thema instellingen
        </span>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="currentColor"
          style={{ color: 'rgba(255,255,255,0.3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <path d="M8 10.5L2 4.5h12L8 10.5z" />
        </svg>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 pb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>

              {/* Status */}
              <AnimatePresence>
                {status && (
                  <motion.div
                    key="ts"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 px-4 py-3 rounded-xl text-sm"
                    style={{
                      background: status.type === 'success' ? 'rgba(34,197,94,0.15)' : `${primary}26`,
                      border: status.type === 'success' ? '1px solid rgba(34,197,94,0.4)' : `1px solid ${primary}66`,
                      color: status.type === 'success' ? '#4ade80' : '#ff6b6b',
                    }}
                  >
                    {status.message}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-5 grid grid-cols-1 gap-5">

                {/* App titel */}
                <Field label="Naam / Titel">
                  <input
                    value={appTitle}
                    onChange={e => setAppTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-white text-sm focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${primary}40` }}
                  />
                </Field>

                {/* Kleuren */}
                <div className="grid grid-cols-3 gap-3">
                  <ColorField label="Hoofdkleur" value={primaryColor} onChange={setPrimaryColor} />
                  <ColorField label="Goudkleur" value={goldColor} onChange={setGoldColor} />
                  <ColorField label="Achtergrond" value={bgColor} onChange={setBgColor} />
                </div>

                {/* Sterren */}
                <Field label="Animatie">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <button
                      type="button"
                      onClick={() => setShowStars(s => !s)}
                      className="relative flex-shrink-0 w-11 h-6 rounded-full focus:outline-none"
                      style={{
                        background: showStars ? primary : 'rgba(255,255,255,0.12)',
                        transition: 'background 0.2s',
                      }}
                    >
                      <span
                        className="absolute top-1 w-4 h-4 rounded-full bg-white"
                        style={{
                          left: 2,
                          transform: showStars ? 'translateX(20px)' : 'translateX(0px)',
                          transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1)',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                        }}
                      />
                    </button>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Sterren-animatie weergeven
                    </span>
                  </label>
                </Field>

                {/* Logo */}
                <Field label="Beeldmark">
                  <div className="flex gap-2 items-center">
                    {logoUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={logoUrl}
                        alt="logo preview"
                        style={{ width: 40, height: 40, objectFit: 'contain', background: primary, borderRadius: 6, padding: 4, flexShrink: 0 }}
                      />
                    )}
                    <input
                      value={logoUrl}
                      onChange={e => setLogoUrl(e.target.value)}
                      placeholder="https://… of upload hieronder"
                      className="flex-1 px-3 py-2 rounded-lg text-white text-sm focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${primary}40` }}
                    />
                    <button
                      type="button"
                      onClick={() => uploadRef.current?.click()}
                      className="px-3 py-2 rounded-lg text-sm font-medium flex-shrink-0"
                      style={{ background: `${primary}26`, border: `1px solid ${primary}59`, color: '#fff', cursor: 'pointer' }}
                    >
                      Upload
                    </button>
                    <input
                      ref={uploadRef}
                      type="file"
                      accept="image/svg+xml,image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) uploadFile(f, setLogoUrl);
                        e.target.value = '';
                      }}
                    />
                  </div>
                </Field>

                {/* Achtergrond afbeelding */}
                <Field label="Achtergrondafbeelding">
                  <div className="flex gap-2 items-start">
                    <div className="flex-1 flex flex-col gap-2">
                      <input
                        value={bgUrl}
                        onChange={e => setBgUrl(e.target.value)}
                        placeholder="https://… of upload hieronder"
                        className="w-full px-3 py-2 rounded-lg text-white text-sm focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${primary}40` }}
                      />
                      {bgUrl && (
                        <div
                          style={{
                            height: 60,
                            borderRadius: 6,
                            backgroundImage: `url(${bgUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: 0.6,
                          }}
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => bgUploadRef.current?.click()}
                      className="px-3 py-2 rounded-lg text-sm font-medium flex-shrink-0"
                      style={{ background: `${primary}26`, border: `1px solid ${primary}59`, color: '#fff', cursor: 'pointer' }}
                    >
                      Upload
                    </button>
                    <input
                      ref={bgUploadRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) uploadFile(f, setBgUrl);
                        e.target.value = '';
                      }}
                    />
                  </div>
                </Field>

              </div>

              {/* Save */}
              <button
                onClick={save}
                disabled={saving}
                className="mt-6 w-full py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: saving ? `${primary}4d` : primary,
                  color: '#fff',
                  cursor: saving ? 'default' : 'pointer',
                  border: 'none',
                }}
              >
                {saving ? 'Opslaan...' : 'Thema opslaan'}
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Small helpers ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs mb-1.5 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</div>
      {children}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{
              width: 36, height: 36, borderRadius: 6, border: 'none', cursor: 'pointer',
              padding: 2, background: 'rgba(255,255,255,0.07)',
            }}
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={e => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
          }}
          maxLength={7}
          className="flex-1 px-2 py-2 rounded-lg text-white text-xs font-mono focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
      </div>
    </Field>
  );
}

// ── Main admin page ──────────────────────────────────────────────────────────

export default function AdminPage({ theme, initialOverrides }: AdminPageProps) {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newPrizeName, setNewPrizeName] = useState('');
  const [addingNew, setAddingNew] = useState(false);

  const primary = theme.colors.primary;

  useEffect(() => {
    fetch(`/api/prizes?theme=${theme.id}`)
      .then((r) => r.json())
      .then((data: Prize[]) => { setPrizes(data); setLoading(false); })
      .catch(() => { setStatus({ type: 'error', message: 'Kon prijzen niet laden' }); setLoading(false); });
  }, [theme.id]);

  const savePrizes = useCallback(async (updated: Prize[]) => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/prizes?theme=${theme.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error('Server error');
      setPrizes(updated);
      setStatus({ type: 'success', message: 'Opgeslagen' });
      setTimeout(() => setStatus(null), 2500);
    } catch {
      setStatus({ type: 'error', message: 'Opslaan mislukt' });
    } finally {
      setSaving(false);
    }
  }, [theme.id]);

  const toggleActive = useCallback((id: string) => {
    savePrizes(prizes.map(p => p.id === id ? { ...p, active: !p.active } : p));
  }, [prizes, savePrizes]);

  const startEdit = useCallback((prize: Prize) => { setEditingId(prize.id); setEditValue(prize.name); }, []);

  const commitEdit = useCallback((id: string) => {
    const trimmed = editValue.trim();
    if (!trimmed) { setEditingId(null); return; }
    setEditingId(null);
    savePrizes(prizes.map(p => p.id === id ? { ...p, name: trimmed } : p));
  }, [editValue, prizes, savePrizes]);

  const deletePrize = useCallback((id: string) => savePrizes(prizes.filter(p => p.id !== id)), [prizes, savePrizes]);

  const addPrize = useCallback(() => {
    const trimmed = newPrizeName.trim();
    if (!trimmed) return;
    const updated = [...prizes, { id: generateId(), name: trimmed, active: true }];
    setNewPrizeName(''); setAddingNew(false);
    savePrizes(updated);
  }, [newPrizeName, prizes, savePrizes]);

  const activePrizes = prizes.filter(p => p.active);
  const inactivePrizes = prizes.filter(p => !p.active);

  return (
    <div className="min-h-screen px-6 py-10" style={{ background: theme.colors.bg, fontFamily: 'var(--font-psv)' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase" style={{ color: '#fff', letterSpacing: '0.04em' }}>
              <span style={{ color: primary }}>{theme.appTitle}</span> Admin
            </h1>
            <p className="text-xs mt-1 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Prijzenbeheer
            </p>
          </div>
          <Link
            href={`/?theme=${theme.id}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
            style={{ background: `${primary}1f`, border: `1px solid ${primary}4d`, color: 'rgba(255,255,255,0.7)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = `${primary}40`; (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = `${primary}1f`; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.7)'; }}
          >
            ← Terug naar trekking
          </Link>
        </div>

        {/* Theme settings */}
        <ThemeSettings theme={theme} initialOverrides={initialOverrides} />

        {/* Prize status bar */}
        <AnimatePresence>
          {status && (
            <motion.div
              key="status"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 px-5 py-3 rounded-xl text-sm font-medium"
              style={{
                background: status.type === 'success' ? 'rgba(34,197,94,0.15)' : `${primary}26`,
                border: status.type === 'success' ? '1px solid rgba(34,197,94,0.4)' : `1px solid ${primary}66`,
                color: status.type === 'success' ? '#4ade80' : '#ff6b6b',
              }}
            >
              {saving ? 'Opslaan...' : status.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Totaal', value: prizes.length, color: '#fff' },
              { label: 'Actief', value: activePrizes.length, color: '#4ade80' },
              { label: 'Inactief', value: inactivePrizes.length, color: 'rgba(255,255,255,0.35)' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl px-5 py-4 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="text-2xl font-black" style={{ color }}>{value}</div>
                <div className="text-xs mt-1 tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-16">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} className="text-3xl">
              {theme.showStars ? '⭐' : '◆'}
            </motion.div>
          </div>
        )}

        {/* Prizes list */}
        {!loading && (
          <div className="rounded-2xl overflow-hidden mb-6" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
            <div className="px-5 py-3 text-xs font-semibold uppercase tracking-widest" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.02)' }}>
              Prijzen
            </div>
            {prizes.length === 0 && (
              <div className="px-5 py-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Geen prijzen. Voeg een prijs toe.</div>
            )}
            <AnimatePresence initial={false}>
              {prizes.map((prize, index) => (
                <motion.div
                  key={prize.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16, height: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className="flex items-center gap-4 px-5 py-4"
                  style={{ borderBottom: index < prizes.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', opacity: prize.active ? 1 : 0.5 }}
                >
                  <button
                    onClick={() => toggleActive(prize.id)}
                    disabled={saving}
                    className="relative flex-shrink-0 w-11 h-6 rounded-full focus:outline-none"
                    style={{ background: prize.active ? primary : 'rgba(255,255,255,0.12)', transition: 'background 0.2s', cursor: saving ? 'default' : 'pointer' }}
                    title={prize.active ? 'Deactiveren' : 'Activeren'}
                  >
                    <span className="absolute top-1 w-4 h-4 rounded-full bg-white" style={{ left: 2, transform: prize.active ? 'translateX(20px)' : 'translateX(0px)', transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                  </button>

                  <div className="flex-1 min-w-0">
                    {editingId === prize.id ? (
                      <input
                        autoFocus
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={() => commitEdit(prize.id)}
                        onKeyDown={e => { if (e.key === 'Enter') commitEdit(prize.id); if (e.key === 'Escape') setEditingId(null); }}
                        className="w-full bg-transparent border-b font-semibold text-white focus:outline-none"
                        style={{ borderColor: primary, fontSize: '1rem', paddingBottom: 2 }}
                      />
                    ) : (
                      <span className="font-semibold text-white cursor-pointer truncate block" onClick={() => startEdit(prize)} title="Klik om te bewerken">{prize.name}</span>
                    )}
                  </div>

                  <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0" style={{ background: prize.active ? `${primary}2e` : 'rgba(255,255,255,0.06)', color: prize.active ? '#ff6b6b' : 'rgba(255,255,255,0.3)' }}>
                    {prize.active ? 'Actief' : 'Inactief'}
                  </span>

                  <button onClick={() => startEdit(prize)} disabled={saving} className="flex-shrink-0 p-2 rounded-lg" style={{ color: 'rgba(255,255,255,0.3)', background: 'transparent', cursor: saving ? 'default' : 'pointer' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)'; }} title="Bewerken">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1464 1.14645L3.71963 8.57322C3.62504 8.66781 3.56251 8.78868 3.54035 8.91907L3.01485 12.0908C2.97284 12.3355 3.16446 12.5272 3.40919 12.4852L6.58093 11.9596C6.71132 11.9375 6.83219 11.875 6.92678 11.7804L14.3536 4.35355C14.5488 4.15829 14.5488 3.84171 14.3536 3.64645L11.8536 1.14645ZM4.42322 9.12678L11.5 2.04997L12.9501 3.50003L5.87322 10.5768L4.21122 10.8888L4.42322 9.12678Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" /></svg>
                  </button>

                  <button onClick={() => deletePrize(prize.id)} disabled={saving} className="flex-shrink-0 p-2 rounded-lg" style={{ color: `${primary}80`, background: 'transparent', cursor: saving ? 'default' : 'pointer' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${primary}1f`; (e.currentTarget as HTMLButtonElement).style.color = primary; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = `${primary}80`; }} title="Verwijderen">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4H3.5C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" /></svg>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Add prize */}
        {!loading && (
          <div>
            {addingNew ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                <input
                  autoFocus
                  placeholder="Naam van de prijs..."
                  value={newPrizeName}
                  onChange={e => setNewPrizeName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addPrize(); if (e.key === 'Escape') { setAddingNew(false); setNewPrizeName(''); } }}
                  className="flex-1 px-4 py-3 rounded-xl text-white text-sm font-medium focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${primary}80` }}
                />
                <button onClick={addPrize} disabled={!newPrizeName.trim() || saving} className="px-6 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: newPrizeName.trim() ? primary : `${primary}4d`, color: newPrizeName.trim() ? '#fff' : 'rgba(255,255,255,0.4)', cursor: newPrizeName.trim() && !saving ? 'pointer' : 'default' }}>
                  Toevoegen
                </button>
                <button onClick={() => { setAddingNew(false); setNewPrizeName(''); }} className="px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                  Annuleren
                </button>
              </motion.div>
            ) : (
              <button onClick={() => setAddingNew(true)} className="w-full py-4 rounded-2xl text-sm font-semibold tracking-wide flex items-center justify-center gap-2"
                style={{ background: `${primary}14`, border: `1px dashed ${primary}59`, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${primary}26`; (e.currentTarget as HTMLButtonElement).style.borderColor = `${primary}99`; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${primary}14`; (e.currentTarget as HTMLButtonElement).style.borderColor = `${primary}59`; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)'; }}>
                <span className="text-lg">+</span>
                Nieuwe prijs toevoegen
              </button>
            )}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.12)' }}>{theme.label} v1.0</p>
        </div>
      </div>
    </div>
  );
}
