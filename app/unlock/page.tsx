'use client';

import { useState } from 'react';

export default function UnlockPage() {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw || busy) return;
    setBusy(true);
    setError(false);
    try {
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (!res.ok) {
        setError(true);
        setBusy(false);
        return;
      }
      const next = new URLSearchParams(window.location.search).get('next') || '/?theme=fanscan';
      window.location.href = next;
    } catch {
      setError(true);
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: '#e82026',
        fontFamily: 'var(--font-psv)',
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: '100%',
          maxWidth: 360,
          background: 'rgba(18,14,15,0.92)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 20,
          padding: '30px 24px',
          boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'PSVBranding, var(--font-psv)',
            fontStyle: 'italic',
            textTransform: 'uppercase',
            color: '#fff',
            fontSize: '1.9rem',
            lineHeight: 1,
            letterSpacing: '0.01em',
          }}
        >
          PSV FANdag
        </div>
        <p style={{ color: '#e6c9cb', margin: '10px 0 22px', fontSize: '0.95rem' }}>
          Voer het wachtwoord in om verder te gaan.
        </p>

        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={pw}
          onChange={(e) => { setPw(e.target.value); setError(false); }}
          placeholder="Wachtwoord"
          aria-label="Wachtwoord"
          style={{
            width: '100%',
            padding: '14px 16px',
            fontSize: '1.1rem',
            textAlign: 'center',
            letterSpacing: '0.15em',
            borderRadius: 12,
            border: error ? '2px solid #ff6b6b' : '2px solid rgba(255,255,255,0.18)',
            background: 'rgba(255,255,255,0.06)',
            color: '#fff',
            outline: 'none',
          }}
        />

        {error && (
          <div style={{ color: '#ff8a8a', fontSize: '0.88rem', marginTop: 10 }}>
            Onjuist wachtwoord. Probeer opnieuw.
          </div>
        )}

        <button
          type="submit"
          disabled={busy || !pw}
          style={{
            width: '100%',
            marginTop: 18,
            padding: '14px 16px',
            fontSize: '1.05rem',
            fontWeight: 800,
            fontStyle: 'italic',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            fontFamily: 'PSVBranding, var(--font-psv)',
            borderRadius: 12,
            border: 'none',
            cursor: busy || !pw ? 'default' : 'pointer',
            background: '#fff',
            color: '#e82026',
            opacity: busy || !pw ? 0.6 : 1,
          }}
        >
          {busy ? 'Bezig…' : 'Ontgrendelen'}
        </button>
      </form>
    </div>
  );
}
