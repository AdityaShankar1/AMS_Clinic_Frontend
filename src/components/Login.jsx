import { useState } from 'react'

const KEYS = {
  'doctor-secret-change-this': 'doctor',
  'recep-secret-change-this': 'receptionist',
}

export default function Login({ onLogin }) {
  const [key, setKey] = useState('')
  const [error, setError] = useState(null)

  function submit() {
    const role = KEYS[key]
    if (!role) { setError('Invalid access key.'); return }
    localStorage.setItem('staff_key', key)
    localStorage.setItem('staff_role', role)
    onLogin(key, role)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--background)'
    }}>
      <div style={{
        width: 320, padding: 28, background: 'var(--surface)',
        border: '1px solid var(--border)', borderRadius: 8,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
      }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em',
            textTransform: 'uppercase', marginBottom: 4 }}>Clinic AMS</div>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
            Staff access only. Enter your role key to continue.
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted-foreground)',
            textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
            Access Key
          </div>
          <input
            type="password"
            value={key}
            onChange={e => { setKey(e.target.value); setError(null) }}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Enter staff key…"
            style={{
              width: '100%', padding: '7px 10px', fontSize: 12,
              border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
              borderRadius: 4, background: 'var(--surface)',
              outline: 'none', fontFamily: 'var(--font-mono)'
            }}
          />
          {error && (
            <div style={{ fontSize: 10, color: 'var(--danger)', marginTop: 4 }}>{error}</div>
          )}
        </div>
        <button onClick={submit} style={{
          width: '100%', padding: '8px 0', background: 'var(--primary)',
          color: 'var(--primary-foreground)', border: 'none', borderRadius: 4,
          cursor: 'pointer', fontWeight: 600, fontSize: 12
        }}>
          Sign In
        </button>
        <div style={{ marginTop: 14, fontSize: 9, color: 'var(--muted-foreground)',
          textAlign: 'center', lineHeight: 1.6 }}>
          This system contains protected health information.<br/>
          Unauthorised access is prohibited.
        </div>
      </div>
    </div>
  )
}
