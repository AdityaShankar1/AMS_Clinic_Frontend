import { useState, useEffect } from 'react'
import { getHealth } from '../api/appointments'

export default function Sidebar({ appointments, role, onRoleChange }) {
  const [health, setHealth] = useState(null)
  const confirmed = appointments.filter(a =>
    ['scheduled','completed'].includes(a.status)).length

  useEffect(() => {
    getHealth().then(setHealth).catch(() => setHealth({ status: 'error' }))
  }, [])

  const critical = appointments.filter(a => a.priority_band === 'critical').length
  const highPrio = appointments.filter(a => a.priority_band === 'high').length

  return (
    <aside style={{
      width: 200, borderRight: '1px solid var(--border)',
      background: 'var(--surface)', display: 'flex', flexDirection: 'column',
      flexShrink: 0, fontSize: 11
    }}>
      {/* Role toggle */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted-foreground)',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          Role
        </div>
        <div style={{ display: 'flex', gap: 2, background: 'var(--muted)',
          borderRadius: 4, padding: 2 }}>
          {['doctor','receptionist'].map(r => (
            <button key={r} onClick={() => onRoleChange(r)}
              style={{
                flex: 1, padding: '3px 0', fontSize: 10, fontWeight: 500,
                borderRadius: 3, border: 'none', cursor: 'pointer',
                background: role === r ? 'var(--surface)' : 'transparent',
                color: role === r ? 'var(--foreground)' : 'var(--muted-foreground)',
                boxShadow: role === r ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.1s'
              }}>
              {r === 'doctor' ? 'Dr.' : 'Recep'}
            </button>
          ))}
        </div>
      </div>

      {/* Today's load */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted-foreground)',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Today's Load
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            marginBottom: 4, color: 'var(--muted-foreground)' }}>
            <span>Confirmed</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>
              {confirmed}/{appointments.length}
            </span>
          </div>
          <div style={{ height: 3, background: 'var(--muted)', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: 'var(--primary)', borderRadius: 9999,
              width: appointments.length ? `${(confirmed/appointments.length)*100}%` : '0%',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            { label: 'Critical', value: critical, danger: true },
            { label: 'High', value: highPrio, warn: true },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--muted)', padding: '6px 8px', borderRadius: 4 }}>
              <div style={{ fontSize: 9, color: 'var(--muted-foreground)', marginBottom: 2 }}>{s.label}</div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 12,
                color: s.danger ? 'var(--danger)' : s.warn ? 'var(--warning)' : 'inherit'
              }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ML status */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted-foreground)',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          ML Core
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--ml)', display: 'inline-block',
            boxShadow: '0 0 0 2px rgba(99,102,241,0.2)'
          }} />
          <span style={{ fontSize: 10, color: 'var(--ml)', fontWeight: 500 }}>Active</span>
        </div>
        <div style={{ marginTop: 6, fontSize: 10, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
          Priority scoring on every booking. Scores: routine → medium → high → critical.
        </div>
      </div>

      {/* System health */}
      <div style={{ padding: '10px 12px', marginTop: 'auto', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted-foreground)',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          System
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', display: 'inline-block',
            background: health?.status === 'ok' ? 'var(--success)' : 'var(--danger)'
          }} />
          <span style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>
            DB {health?.db === 'connected' ? 'connected' : health ? 'error' : '…'}
          </span>
        </div>
      </div>
    </aside>
  )
}
