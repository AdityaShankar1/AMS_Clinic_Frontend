import PriorityBar from './PriorityBar'
import Badge from './Badge'

function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
    timeZone: 'Asia/Kolkata'
  })
}

export default function AppointmentQueue({
  appointments, selectedId, onSelect, onConfirm, onCancel, role
}) {
  const sorted = [...appointments].sort((a, b) => b.priority_score - a.priority_score)

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)',
            position: 'sticky', top: 0, zIndex: 10 }}>
            {['Time / Priority','Patient','Treatment','Status','ML Score','Action'].map(h => (
              <th key={h} style={{ padding: '8px 14px', textAlign: 'left',
                fontSize: 9, fontWeight: 600, color: 'var(--muted-foreground)',
                textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map(a => {
            const isSel = a.appointment_id === selectedId
            return (
              <tr key={a.appointment_id}
                onClick={() => onSelect(a)}
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: isSel ? 'rgba(45,90,90,0.04)' : 'transparent',
                  cursor: 'pointer', transition: 'background 0.1s'
                }}
                onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'var(--muted)' }}
                onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent' }}
              >
                <td style={{ padding: '9px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <PriorityBar band={a.priority_band} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                      {fmt(a.scheduled_start)}
                    </span>
                    {a.is_urgent_override && (
                      <Badge type="override" label="Override" />
                    )}
                  </div>
                </td>
                <td style={{ padding: '9px 14px' }}>
                  <div style={{ fontWeight: 500 }}>{a.patient_name || `#${a.patient_id}`}</div>
                  <div style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>
                    #{a.patient_id}
                  </div>
                </td>
                <td style={{ padding: '9px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{a.reason_for_visit || 'General'}</span>
                    <Badge type={a.treatment_phase} label={a.treatment_phase === 'phased' ? 'Phased' : 'One-time'} />
                  </div>
                  <div style={{ color: 'var(--muted-foreground)', fontSize: 10, marginTop: 2 }}>
                    Dr. #{a.doctor_id}
                  </div>
                </td>
                <td style={{ padding: '9px 14px' }}>
                  <Badge type={a.status} label={a.status.replace('_', ' ')} />
                </td>
                <td style={{ padding: '9px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 48, height: 3, background: 'var(--muted)', borderRadius: 9999, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 9999,
                        background: a.priority_band === 'critical' ? 'var(--danger)'
                          : a.priority_band === 'high' ? 'var(--warning)'
                          : a.priority_band === 'medium' ? 'var(--ml)' : 'var(--muted-foreground)',
                        width: `${a.priority_score}%`
                      }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10,
                      color: 'var(--muted-foreground)' }}>
                      {a.priority_score}
                    </span>
                    <Badge type={a.priority_band} label={a.priority_band} />
                  </div>
                  {a.priority_summary && (
                    <div style={{ fontSize: 9, color: 'var(--muted-foreground)',
                      marginTop: 3, lineHeight: 1.4, maxWidth: 160 }}>
                      {a.priority_summary.split(';')[0]}
                    </div>
                  )}
                </td>
                <td style={{ padding: '9px 14px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {a.status === 'scheduled' && (
                      <>
                        <button onClick={e => { e.stopPropagation(); onConfirm(a.appointment_id) }}
                          style={{
                            padding: '3px 10px', fontSize: 10, fontWeight: 500,
                            background: 'var(--primary)', color: 'var(--primary-foreground)',
                            border: 'none', borderRadius: 3, cursor: 'pointer'
                          }}>
                          Complete
                        </button>
                        <button onClick={e => { e.stopPropagation(); onCancel(a.appointment_id) }}
                          style={{
                            padding: '3px 10px', fontSize: 10, fontWeight: 500,
                            background: 'transparent', color: 'var(--muted-foreground)',
                            border: '1px solid var(--border)', borderRadius: 3, cursor: 'pointer'
                          }}>
                          Cancel
                        </button>
                      </>
                    )}
                    {a.status === 'completed' && (
                      <span style={{ fontSize: 10, color: 'var(--success)', fontWeight: 500 }}>✓ Done</span>
                    )}
                    {a.status === 'cancelled' && (
                      <span style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>Cancelled</span>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
          {appointments.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: 32, textAlign: 'center',
                color: 'var(--muted-foreground)', fontSize: 12 }}>
                No appointments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
