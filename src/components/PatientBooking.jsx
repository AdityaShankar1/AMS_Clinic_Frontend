/**
 * Patient-facing NLP booking widget.
 *
 * Deliberately NOT a chatbot — no conversation history, no multi-turn.
 * Patient types a natural request, gets a list of slots, picks one.
 * Smarter than "Press 1 for morning", dumber than GPT. That's the goal.
 */
import { useState } from 'react'
import api from '../api/client'

const prefix = import.meta.env.DEV ? '/api' : ''

const SUGGESTIONS = [
  "today evening",
  "tomorrow morning",
  "this Saturday afternoon",
  "next Monday",
]

export default function PatientBooking({ doctors, onBooked, onClose }) {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState(
    doctors?.[0]?.doctor_id || ''
  )
  const [reason, setReason] = useState('')
  const [parsing, setParsing] = useState(false)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState(null)
  const [parseError, setParseError] = useState(null)

  async function handleParse(inputText) {
    const t = (inputText || text).trim()
    if (!t) return
    setParsing(true)
    setResult(null)
    setSelectedSlot(null)
    setParseError(null)
    try {
      const res = await api.post(`${prefix}/nlp/parse-appointment`, { text: t })
      setResult(res.data)
      if (!res.data.understood) {
        setParseError("Couldn't understand the date. Try something like \"today evening\" or \"tomorrow morning\".")
      }
    } catch (e) {
      setParseError("Parse failed — check your connection.")
    } finally {
      setParsing(false)
    }
  }

  async function handleBook() {
    if (!selectedSlot || !selectedDoctor) return
    setBooking(true)
    setError(null)
    try {
      const res = await api.post(`${prefix}/appointments`, {
        patient_id: 1, // Phase 3: replace with real patient_id from JWT
        doctor_id: Number(selectedDoctor),
        scheduled_start: selectedSlot,
        reason_for_visit: reason || undefined,
      })
      onBooked?.(res.data)
      onClose?.()
    } catch (e) {
      setError(e.response?.data?.detail || 'Booking failed. Slot may already be taken.')
    } finally {
      setBooking(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
    }} onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div style={{
        background: 'var(--surface)', borderRadius: 8, padding: 24,
        width: 460, border: '1px solid var(--border)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)', maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Book an Appointment</div>
            <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 2 }}>
              Describe when you'd like to come in
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 18, color: 'var(--muted-foreground)' }}>✕</button>
        </div>

        {/* NLP input */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted-foreground)',
            textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
            When would you like to come in?
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleParse()}
              placeholder='e.g. "today evening" or "tomorrow morning"'
              style={{
                flex: 1, padding: '8px 10px', fontSize: 12,
                border: '1px solid var(--border)', borderRadius: 4,
                background: 'var(--surface)', outline: 'none', fontFamily: 'inherit'
              }}
            />
            <button onClick={() => handleParse()} disabled={parsing || !text.trim()}
              style={{
                padding: '8px 14px', background: 'var(--primary)',
                color: 'var(--primary-foreground)', border: 'none',
                borderRadius: 4, cursor: parsing ? 'not-allowed' : 'pointer',
                fontSize: 11, fontWeight: 600, opacity: parsing ? 0.7 : 1,
                whiteSpace: 'nowrap'
              }}>
              {parsing ? 'Checking…' : 'Find slots'}
            </button>
          </div>

          {/* Quick suggestions */}
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => { setText(s); handleParse(s) }}
                style={{
                  fontSize: 9, padding: '3px 8px',
                  border: '1px solid var(--border)', borderRadius: 12,
                  background: 'var(--muted)', cursor: 'pointer',
                  color: 'var(--muted-foreground)', fontFamily: 'inherit'
                }}>{s}</button>
            ))}
          </div>
        </div>

        {/* Parse error */}
        {parseError && (
          <div style={{ padding: '8px 10px', background: 'rgba(220,38,38,0.08)',
            color: 'var(--danger)', borderRadius: 4, fontSize: 11, marginBottom: 12 }}>
            {parseError}
          </div>
        )}

        {/* Result */}
        {result?.understood && (
          <>
            {/* Interpretation */}
            <div style={{ padding: '6px 10px', background: 'rgba(99,102,241,0.06)',
              border: '1px solid rgba(99,102,241,0.12)', borderRadius: 4,
              fontSize: 10, color: 'var(--ml)', marginBottom: 12, fontStyle: 'italic' }}>
              {result.interpretation}
            </div>

            {/* Slot grid */}
            {result.slots.length > 0 ? (
              <>
                <div style={{ fontSize: 9, fontWeight: 600,
                  color: 'var(--muted-foreground)', textTransform: 'uppercase',
                  letterSpacing: '0.07em', marginBottom: 8 }}>
                  Available slots — pick one
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 6, marginBottom: 16 }}>
                  {result.slots.map(slot => (
                    <button key={slot.iso}
                      onClick={() => setSelectedSlot(slot.iso)}
                      style={{
                        padding: '7px 4px', fontSize: 11, fontWeight: 500,
                        border: `1px solid ${selectedSlot === slot.iso ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--font-mono)',
                        background: selectedSlot === slot.iso ? 'rgba(45,90,90,0.08)' : 'var(--surface)',
                        color: selectedSlot === slot.iso ? 'var(--primary)' : 'var(--foreground)',
                        transition: 'all 0.1s'
                      }}>
                      {slot.display}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ padding: '12px', textAlign: 'center',
                color: 'var(--muted-foreground)', fontSize: 11, marginBottom: 12 }}>
                No slots available in that window. Try a different time.
              </div>
            )}

            {/* Doctor + reason (only if slot selected) */}
            {selectedSlot && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10,
                marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 600,
                    color: 'var(--muted-foreground)', textTransform: 'uppercase',
                    letterSpacing: '0.07em', marginBottom: 4 }}>Doctor</div>
                  <select value={selectedDoctor}
                    onChange={e => setSelectedDoctor(e.target.value)}
                    style={{
                      width: '100%', padding: '7px 8px', fontSize: 11,
                      border: '1px solid var(--border)', borderRadius: 4,
                      background: 'var(--surface)', fontFamily: 'inherit'
                    }}>
                    {doctors?.map(d => (
                      <option key={d.doctor_id} value={d.doctor_id}>
                        {d.full_name} — {d.specialty}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 600,
                    color: 'var(--muted-foreground)', textTransform: 'uppercase',
                    letterSpacing: '0.07em', marginBottom: 4 }}>
                    Reason (optional)
                  </div>
                  <input value={reason} onChange={e => setReason(e.target.value)}
                    placeholder="e.g. tooth pain, routine cleaning…"
                    style={{
                      width: '100%', padding: '7px 8px', fontSize: 11,
                      border: '1px solid var(--border)', borderRadius: 4,
                      background: 'var(--surface)', fontFamily: 'inherit', outline: 'none'
                    }} />
                </div>
              </div>
            )}

            {error && (
              <div style={{ padding: '8px 10px', background: 'rgba(220,38,38,0.08)',
                color: 'var(--danger)', borderRadius: 4, fontSize: 11, marginBottom: 12 }}>
                {error}
              </div>
            )}

            {selectedSlot && (
              <button onClick={handleBook} disabled={booking}
                style={{
                  width: '100%', padding: '9px 0', background: 'var(--primary)',
                  color: 'var(--primary-foreground)', border: 'none', borderRadius: 4,
                  cursor: booking ? 'not-allowed' : 'pointer', fontWeight: 600,
                  fontSize: 12, opacity: booking ? 0.7 : 1
                }}>
                {booking ? 'Booking…' : `Confirm — ${new Date(selectedSlot).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`}
              </button>
            )}
          </>
        )}

        <div style={{ marginTop: 14, fontSize: 9, color: 'var(--muted-foreground)',
          textAlign: 'center' }}>
          Clinic hours: 8 AM–12 PM and 4 PM–8 PM · Slots every 20 minutes
        </div>
      </div>
    </div>
  )
}
