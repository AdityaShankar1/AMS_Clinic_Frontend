import Badge from './Badge'
import Segmented from './Segmented'
import { updatePriority } from '../api/appointments'

function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata'
  })
}

export default function DetailPanel({ appointment: a, role, onUpdate }) {
  if (!a) return (
    <aside style={{ width: 256, borderLeft: '1px solid var(--border)',
      background: 'var(--muted)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
        Select an appointment
      </span>
    </aside>
  )

  const isDoctor = role === 'doctor'

  async function handlePriorityOverride(field, value) {
    try {
      const updated = await updatePriority(a.appointment_id, { [field]: value })
      onUpdate(updated)
    } catch (e) {
      console.error('Priority update failed', e)
    }
  }

  return (
    <aside style={{
      width: 256, borderLeft: '1px solid var(--border)',
      background: 'var(--surface)', padding: 14, overflowY: 'auto',
      flexShrink: 0, fontSize: 11
    }}>
      {/* Patient header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8,
          background: 'var(--muted)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--muted-foreground)', marginBottom: 8, fontWeight: 600
        }}>
          {String(a.patient_id).padStart(2, '0')}
        </div>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
          Patient #{a.patient_id}
        </div>
        <div style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
          Appt #{a.appointment_id}
        </div>
      </div>

      {/* Case details */}
      <Section title="Case">
        <Row k="Start" v={fmt(a.scheduled_start)} />
        <Row k="End" v={fmt(a.scheduled_end)} />
        <Row k="Duration" v={`${a.duration_minutes} min`} />
        <Row k="Reason" v={a.reason_for_visit || '—'} />
        <Row k="Status" v={<Badge type={a.status} label={a.status.replace('_',' ')} />} />
        <Row k="Phase" v={<Badge type={a.treatment_phase} label={a.treatment_phase === 'phased' ? 'Phased' : 'One-time'} />} />
      </Section>

      {/* ML Priority */}
      <Section title="ML Priority">
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 6 }}>
            <Badge type={a.priority_band} label={a.priority_band} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12,
              fontWeight: 600 }}>{a.priority_score}/100</span>
          </div>
          <div style={{ height: 4, background: 'var(--muted)', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 9999,
              background: a.priority_band === 'critical' ? 'var(--danger)'
                : a.priority_band === 'high' ? 'var(--warning)'
                : a.priority_band === 'medium' ? 'var(--ml)' : 'var(--muted-foreground)',
              width: `${a.priority_score}%`, transition: 'width 0.3s'
            }} />
          </div>
        </div>
        {a.priority_summary && (
          <div style={{ fontSize: 10, color: 'var(--muted-foreground)',
            lineHeight: 1.5, padding: '6px 8px', background: 'var(--muted)',
            borderRadius: 4, fontStyle: 'italic' }}>
            {a.priority_summary}
          </div>
        )}

        {/* Doctor-only priority override */}
        {isDoctor && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted-foreground)',
              textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6,
              display: 'flex', alignItems: 'center', gap: 6 }}>
              Override
              <span style={{ fontSize: 9, padding: '1px 5px', background: 'rgba(220,38,38,0.1)',
                color: 'var(--danger)', borderRadius: 3 }}>Dr only</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div>
                <div style={{ fontSize: 9, color: 'var(--muted-foreground)', marginBottom: 4 }}>
                  Severity
                </div>
                <Segmented
                  value={a.severity_level}
                  options={[1,2,3,4,5].map(v => ({ value: v, label: String(v) }))}
                  onChange={v => handlePriorityOverride('severity_level', v)}
                />
              </div>
              <div>
                <div style={{ fontSize: 9, color: 'var(--muted-foreground)', marginBottom: 4 }}>
                  Urgency
                </div>
                <Segmented
                  value={a.urgency_level}
                  options={[1,2,3,4,5].map(v => ({ value: v, label: String(v) }))}
                  onChange={v => handlePriorityOverride('urgency_level', v)}
                />
              </div>
              <div>
                <div style={{ fontSize: 9, color: 'var(--muted-foreground)', marginBottom: 4 }}>
                  Phase
                </div>
                <Segmented
                  value={a.treatment_phase}
                  options={[
                    { value: 'one_time', label: 'One-time' },
                    { value: 'phased', label: 'Phased' },
                  ]}
                  onChange={v => handlePriorityOverride('treatment_phase', v)}
                />
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* Pre-reqs */}
      {(a.xray_needed || a.blood_test_needed) && (
        <Section title="Pre-requisites">
          {a.xray_needed && <Row k="X-Ray" v="Required" />}
          {a.blood_test_needed && <Row k="Blood Test" v="Required" />}
        </Section>
      )}
    </aside>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted-foreground)',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
        paddingBottom: 4, borderBottom: '1px solid var(--border)' }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {children}
      </div>
    </div>
  )
}

function Row({ k, v }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between',
      alignItems: 'flex-start', gap: 8 }}>
      <span style={{ color: 'var(--muted-foreground)', flexShrink: 0 }}>{k}</span>
      <span style={{ textAlign: 'right' }}>{v}</span>
    </div>
  )
}
