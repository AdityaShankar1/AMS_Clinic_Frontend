import { useState, useEffect } from 'react'
import { listDoctors, listPatients, bookAppointment } from '../api/appointments'

export default function BookModal({ onClose, onBooked }) {
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    patient_id: '', doctor_id: '', scheduled_start: '',
    reason_for_visit: '', duration_minutes: 20,
    xray_needed: false, blood_test_needed: false
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    listDoctors().then(setDoctors)
    listPatients().then(setPatients)
  }, [])

  const filtered = patients.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone_number.includes(search)
  ).slice(0, 8)

  async function submit() {
    if (!form.patient_id || !form.doctor_id || !form.scheduled_start) {
      setError('Patient, doctor, and time are required.'); return
    }
    setLoading(true); setError(null)
    try {
      const result = await bookAppointment({
        ...form,
        patient_id: Number(form.patient_id),
        doctor_id: Number(form.doctor_id),
        duration_minutes: Number(form.duration_minutes),
      })
      onBooked(result)
      onClose()
    } catch (e) {
      setError(e.response?.data?.detail || 'Booking failed.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--surface)', borderRadius: 8, padding: 20,
        width: 420, border: '1px solid var(--border)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Book Appointment</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 16, color: 'var(--muted-foreground)' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 11 }}>
          <div>
            <Label>Search patient</Label>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Name or phone…"
              style={inputStyle} />
            {search && (
              <div style={{ border: '1px solid var(--border)', borderRadius: 4,
                marginTop: 2, maxHeight: 140, overflowY: 'auto' }}>
                {filtered.map(p => (
                  <div key={p.patient_id}
                    onClick={() => { setForm(f => ({...f, patient_id: p.patient_id})); setSearch(p.full_name) }}
                    style={{ padding: '6px 10px', cursor: 'pointer',
                      background: form.patient_id === p.patient_id ? 'var(--muted)' : 'transparent',
                      borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--muted)'}
                    onMouseLeave={e => e.currentTarget.style.background =
                      form.patient_id === p.patient_id ? 'var(--muted)' : 'transparent'}>
                    <span style={{ fontWeight: 500 }}>{p.full_name}</span>
                    <span style={{ color: 'var(--muted-foreground)', marginLeft: 8 }}>{p.phone_number}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>Doctor</Label>
            <select value={form.doctor_id}
              onChange={e => setForm(f => ({...f, doctor_id: e.target.value}))}
              style={inputStyle}>
              <option value="">Select…</option>
              {doctors.map(d => (
                <option key={d.doctor_id} value={d.doctor_id}>
                  {d.full_name} ({d.specialty})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Date & Time (clinic hours: 5 PM – 8:30 PM)</Label>
            <input type="datetime-local" value={form.scheduled_start}
              onChange={e => setForm(f => ({...f, scheduled_start: e.target.value}))}
              style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <Label>Duration (min)</Label>
              <input type="number" value={form.duration_minutes} min={10} max={120} step={5}
                onChange={e => setForm(f => ({...f, duration_minutes: e.target.value}))}
                style={inputStyle} />
            </div>
            <div>
              <Label>Reason</Label>
              <input value={form.reason_for_visit}
                onChange={e => setForm(f => ({...f, reason_for_visit: e.target.value}))}
                placeholder="e.g. Root canal"
                style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            {[['xray_needed','X-Ray needed'],['blood_test_needed','Blood test needed']].map(([k,l]) => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" checked={form[k]}
                  onChange={e => setForm(f => ({...f, [k]: e.target.checked}))} />
                {l}
              </label>
            ))}
          </div>

          {error && (
            <div style={{ padding: '6px 10px', background: 'rgba(220,38,38,0.08)',
              color: 'var(--danger)', borderRadius: 4, fontSize: 11 }}>
              {error}
            </div>
          )}

          <button onClick={submit} disabled={loading}
            style={{
              padding: '8px 0', background: 'var(--primary)',
              color: 'var(--primary-foreground)', border: 'none',
              borderRadius: 4, cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600, fontSize: 12, opacity: loading ? 0.7 : 1
            }}>
            {loading ? 'Booking…' : 'Book Appointment'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Label({ children }) {
  return <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted-foreground)',
    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{children}</div>
}

const inputStyle = {
  width: '100%', padding: '6px 8px', fontSize: 11,
  border: '1px solid var(--border)', borderRadius: 4,
  background: 'var(--surface)', outline: 'none', fontFamily: 'inherit'
}
