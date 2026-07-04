import { useState, useEffect, useCallback } from 'react'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import AppointmentQueue from './components/AppointmentQueue'
import DetailPanel from './components/DetailPanel'
import BookModal from './components/BookModal'
import { listAppointments, updateStatus } from './api/appointments'

export default function App() {
  const [staffKey, setStaffKey] = useState(() => localStorage.getItem('staff_key'))
  const [role, setRole] = useState(() => localStorage.getItem('staff_role') || 'doctor')
  const [appointments, setAppointments] = useState([])
  const [selected, setSelected] = useState(null)
  const [showBook, setShowBook] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)

  function handleLogin(key, resolvedRole) {
    setStaffKey(key)
    setRole(resolvedRole)
  }

  function handleLogout() {
    localStorage.removeItem('staff_key')
    localStorage.removeItem('staff_role')
    setStaffKey(null)
    setAppointments([])
    setSelected(null)
  }

  const load = useCallback(async () => {
    if (!staffKey) return
    try {
      const data = await listAppointments()
      setAppointments(data)
      setLastRefresh(new Date())
      setError(null)
      if (selected) {
        const refreshed = data.find(a => a.appointment_id === selected.appointment_id)
        if (refreshed) setSelected(refreshed)
      }
    } catch (e) {
      if (e.response?.status === 401 || e.response?.status === 403) {
        handleLogout()
      } else {
        setError('Failed to load appointments. Is the server running?')
      }
    } finally { setLoading(false) }
  }, [staffKey, selected])

  useEffect(() => {
    if (!staffKey) { setLoading(false); return }
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [staffKey])

  async function handleConfirm(id) {
    try {
      const updated = await updateStatus(id, 'completed')
      setAppointments(prev => prev.map(a => a.appointment_id === id ? updated : a))
      if (selected?.appointment_id === id) setSelected(updated)
    } catch (e) { alert(e.response?.data?.detail || 'Status update failed.') }
  }

  async function handleCancel(id) {
    if (!confirm('Cancel this appointment?')) return
    try {
      const updated = await updateStatus(id, 'cancelled')
      setAppointments(prev => prev.map(a => a.appointment_id === id ? updated : a))
      if (selected?.appointment_id === id) setSelected(updated)
    } catch (e) { alert(e.response?.data?.detail || 'Cancellation failed.') }
  }

  function handleUpdate(updated) {
    setAppointments(prev => prev.map(a =>
      a.appointment_id === updated.appointment_id ? updated : a))
    setSelected(updated)
  }

  function handleBooked(newAppt) {
    setAppointments(prev => [newAppt, ...prev])
    setSelected(newAppt)
  }

  if (!staffKey) return <Login onLogin={handleLogin} />

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <header style={{
        height: 44, borderBottom: '1px solid var(--border)',
        background: 'var(--surface)', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '-0.01em',
            textTransform: 'uppercase' }}>Clinic AMS</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9,
            color: 'var(--primary)', opacity: 0.6 }}>v2.0</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {lastRefresh && (
            <span style={{ fontSize: 9, color: 'var(--muted-foreground)',
              fontFamily: 'var(--font-mono)' }}>
              updated {lastRefresh.toLocaleTimeString('en-IN', { timeStyle: 'short' })}
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5,
            padding: '3px 8px', background: 'rgba(99,102,241,0.06)',
            border: '1px solid rgba(99,102,241,0.12)', borderRadius: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%',
              background: 'var(--ml)', display: 'inline-block' }} />
            <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)',
              color: 'var(--ml)', fontWeight: 600, letterSpacing: '0.05em' }}>
              ML PRIORITY ACTIVE
            </span>
          </div>
          <button onClick={() => setShowBook(true)} style={{
            padding: '5px 12px', background: 'var(--primary)',
            color: 'var(--primary-foreground)', border: 'none',
            borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600
          }}>+ Book</button>
          <button onClick={handleLogout} style={{
            padding: '5px 10px', background: 'transparent',
            color: 'var(--muted-foreground)', border: '1px solid var(--border)',
            borderRadius: 4, cursor: 'pointer', fontSize: 10
          }}>Sign out</button>
        </div>
      </header>
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar appointments={appointments} role={role} onRoleChange={setRole} />
        <section style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {error && (
            <div style={{ padding: '8px 14px', background: 'rgba(220,38,38,0.08)',
              color: 'var(--danger)', borderBottom: '1px solid var(--border)', fontSize: 11 }}>
              {error}
            </div>
          )}
          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--muted-foreground)', fontSize: 12 }}>
              Loading appointments…
            </div>
          ) : (
            <AppointmentQueue
              appointments={appointments}
              selectedId={selected?.appointment_id}
              onSelect={setSelected}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              role={role}
            />
          )}
        </section>
        <DetailPanel appointment={selected} role={role} onUpdate={handleUpdate} />
      </main>
      {showBook && <BookModal onClose={() => setShowBook(false)} onBooked={handleBooked} />}
    </div>
  )
}
