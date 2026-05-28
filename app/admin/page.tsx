'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { Prize } from '@/app/types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function AdminPage() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newPrizeName, setNewPrizeName] = useState('');
  const [addingNew, setAddingNew] = useState(false);

  useEffect(() => {
    fetch('/api/prizes')
      .then((r) => r.json())
      .then((data: Prize[]) => {
        setPrizes(data);
        setLoading(false);
      })
      .catch(() => {
        setStatus({ type: 'error', message: 'Kon prijzen niet laden' });
        setLoading(false);
      });
  }, []);

  const savePrizes = useCallback(async (updated: Prize[]) => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch('/api/prizes', {
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
  }, []);

  const toggleActive = useCallback(
    (id: string) => {
      const updated = prizes.map((p) =>
        p.id === id ? { ...p, active: !p.active } : p
      );
      savePrizes(updated);
    },
    [prizes, savePrizes]
  );

  const startEdit = useCallback((prize: Prize) => {
    setEditingId(prize.id);
    setEditValue(prize.name);
  }, []);

  const commitEdit = useCallback(
    (id: string) => {
      const trimmed = editValue.trim();
      if (!trimmed) {
        setEditingId(null);
        return;
      }
      const updated = prizes.map((p) =>
        p.id === id ? { ...p, name: trimmed } : p
      );
      setEditingId(null);
      savePrizes(updated);
    },
    [editValue, prizes, savePrizes]
  );

  const deletePrize = useCallback(
    (id: string) => {
      const updated = prizes.filter((p) => p.id !== id);
      savePrizes(updated);
    },
    [prizes, savePrizes]
  );

  const addPrize = useCallback(() => {
    const trimmed = newPrizeName.trim();
    if (!trimmed) return;
    const newPrize: Prize = { id: generateId(), name: trimmed, active: true };
    const updated = [...prizes, newPrize];
    setNewPrizeName('');
    setAddingNew(false);
    savePrizes(updated);
  }, [newPrizeName, prizes, savePrizes]);

  const activePrizes = prizes.filter((p) => p.active);
  const inactivePrizes = prizes.filter((p) => !p.active);

  return (
    <div
      className="min-h-screen px-6 py-10"
      style={{ background: '#0A0A1A' }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1
              className="text-3xl font-black tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #fff 30%, #C8102E 70%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ⭐ Admin Panel
            </h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              PSV Sterrenbonus — Prijzenbeheer
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: 'rgba(200,16,46,0.12)',
              border: '1px solid rgba(200,16,46,0.3)',
              color: 'rgba(255,255,255,0.7)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                'rgba(200,16,46,0.25)';
              (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                'rgba(200,16,46,0.12)';
              (e.currentTarget as HTMLAnchorElement).style.color =
                'rgba(255,255,255,0.7)';
            }}
          >
            ← Terug naar trekking
          </Link>
        </div>

        {/* Status bar */}
        <AnimatePresence>
          {status && (
            <motion.div
              key="status"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 px-5 py-3 rounded-xl text-sm font-medium"
              style={{
                background:
                  status.type === 'success'
                    ? 'rgba(34,197,94,0.15)'
                    : 'rgba(200,16,46,0.15)',
                border:
                  status.type === 'success'
                    ? '1px solid rgba(34,197,94,0.4)'
                    : '1px solid rgba(200,16,46,0.4)',
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
              <div
                key={label}
                className="rounded-2xl px-5 py-4 text-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="text-2xl font-black" style={{ color }}>
                  {value}
                </div>
                <div className="text-xs mt-1 tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              className="text-3xl"
            >
              ⭐
            </motion.div>
          </div>
        )}

        {/* Prizes list */}
        {!loading && (
          <div
            className="rounded-2xl overflow-hidden mb-6"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
          >
            <div
              className="px-5 py-3 text-xs font-semibold uppercase tracking-widest"
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              Prijzen
            </div>

            {prizes.length === 0 && (
              <div className="px-5 py-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Geen prijzen gevonden. Voeg een prijs toe.
              </div>
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
                  style={{
                    borderBottom:
                      index < prizes.length - 1
                        ? '1px solid rgba(255,255,255,0.05)'
                        : 'none',
                    opacity: prize.active ? 1 : 0.5,
                  }}
                >
                  {/* Toggle */}
                  <button
                    onClick={() => toggleActive(prize.id)}
                    disabled={saving}
                    className="relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-300 focus:outline-none"
                    style={{
                      background: prize.active
                        ? '#C8102E'
                        : 'rgba(255,255,255,0.12)',
                      cursor: saving ? 'default' : 'pointer',
                    }}
                    title={prize.active ? 'Deactiveren' : 'Activeren'}
                  >
                    <motion.span
                      animate={{ x: prize.active ? 22 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-4 h-4 rounded-full bg-white"
                      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
                    />
                  </button>

                  {/* Prize name (editable) */}
                  <div className="flex-1 min-w-0">
                    {editingId === prize.id ? (
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => commitEdit(prize.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitEdit(prize.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="w-full bg-transparent border-b font-semibold text-white focus:outline-none"
                        style={{
                          borderColor: '#C8102E',
                          fontSize: '1rem',
                          paddingBottom: 2,
                        }}
                      />
                    ) : (
                      <span
                        className="font-semibold text-white cursor-pointer truncate block"
                        onClick={() => startEdit(prize)}
                        title="Klik om te bewerken"
                      >
                        {prize.name}
                      </span>
                    )}
                  </div>

                  {/* Status badge */}
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                    style={{
                      background: prize.active
                        ? 'rgba(200,16,46,0.18)'
                        : 'rgba(255,255,255,0.06)',
                      color: prize.active ? '#ff6b6b' : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {prize.active ? 'Actief' : 'Inactief'}
                  </span>

                  {/* Edit button */}
                  <button
                    onClick={() => startEdit(prize)}
                    disabled={saving}
                    className="flex-shrink-0 p-2 rounded-lg transition-colors"
                    style={{
                      color: 'rgba(255,255,255,0.3)',
                      background: 'transparent',
                      cursor: saving ? 'default' : 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(255,255,255,0.08)';
                      (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        'transparent';
                      (e.currentTarget as HTMLButtonElement).style.color =
                        'rgba(255,255,255,0.3)';
                    }}
                    title="Bewerken"
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path
                        d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1464 1.14645L3.71963 8.57322C3.62504 8.66781 3.56251 8.78868 3.54035 8.91907L3.01485 12.0908C2.97284 12.3355 3.16446 12.5272 3.40919 12.4852L6.58093 11.9596C6.71132 11.9375 6.83219 11.875 6.92678 11.7804L14.3536 4.35355C14.5488 4.15829 14.5488 3.84171 14.3536 3.64645L11.8536 1.14645ZM4.42322 9.12678L11.5 2.04997L12.9501 3.50003L5.87322 10.5768L4.21122 10.8888L4.42322 9.12678Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => deletePrize(prize.id)}
                    disabled={saving}
                    className="flex-shrink-0 p-2 rounded-lg transition-colors"
                    style={{
                      color: 'rgba(200,16,46,0.5)',
                      background: 'transparent',
                      cursor: saving ? 'default' : 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(200,16,46,0.12)';
                      (e.currentTarget as HTMLButtonElement).style.color = '#C8102E';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        'transparent';
                      (e.currentTarget as HTMLButtonElement).style.color =
                        'rgba(200,16,46,0.5)';
                    }}
                    title="Verwijderen"
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path
                        d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4H3.5C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      />
                    </svg>
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
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <input
                  autoFocus
                  placeholder="Naam van de prijs..."
                  value={newPrizeName}
                  onChange={(e) => setNewPrizeName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addPrize();
                    if (e.key === 'Escape') {
                      setAddingNew(false);
                      setNewPrizeName('');
                    }
                  }}
                  className="flex-1 px-4 py-3 rounded-xl text-white text-sm font-medium focus:outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(200,16,46,0.5)',
                  }}
                />
                <button
                  onClick={addPrize}
                  disabled={!newPrizeName.trim() || saving}
                  className="px-6 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: newPrizeName.trim() ? '#C8102E' : 'rgba(200,16,46,0.3)',
                    color: newPrizeName.trim() ? '#fff' : 'rgba(255,255,255,0.4)',
                    cursor: newPrizeName.trim() && !saving ? 'pointer' : 'default',
                  }}
                >
                  Toevoegen
                </button>
                <button
                  onClick={() => {
                    setAddingNew(false);
                    setNewPrizeName('');
                  }}
                  className="px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                  }}
                >
                  Annuleren
                </button>
              </motion.div>
            ) : (
              <button
                onClick={() => setAddingNew(true)}
                className="w-full py-4 rounded-2xl text-sm font-semibold tracking-wide transition-all flex items-center justify-center gap-2"
                style={{
                  background: 'rgba(200,16,46,0.08)',
                  border: '1px dashed rgba(200,16,46,0.35)',
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'rgba(200,16,46,0.15)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    'rgba(200,16,46,0.6)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'rgba(200,16,46,0.08)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    'rgba(200,16,46,0.35)';
                  (e.currentTarget as HTMLButtonElement).style.color =
                    'rgba(255,255,255,0.5)';
                }}
              >
                <span className="text-lg">+</span>
                Nieuwe prijs toevoegen
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.12)' }}>
            PSV Sterrenbonus v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
