const presets = {
  ml:        { background: 'rgba(99,102,241,0.1)', color: '#6366f1' },
  override:  { background: 'rgba(220,38,38,0.1)',  color: '#dc2626' },
  scheduled: { background: 'rgba(45,90,90,0.1)',   color: '#2d5a5a' },
  completed: { background: 'rgba(22,163,74,0.1)',  color: '#16a34a' },
  cancelled: { background: 'rgba(115,115,115,0.1)',color: '#737373' },
  no_show:   { background: 'rgba(220,38,38,0.1)',  color: '#dc2626' },
  paid:      { background: 'rgba(22,163,74,0.1)',  color: '#16a34a' },
  partial:   { background: 'rgba(234,138,16,0.1)', color: '#ea8a10' },
  unpaid:    { background: 'rgba(115,115,115,0.1)',color: '#737373' },
  phased:    { background: 'rgba(45,90,90,0.07)',  color: '#2d5a5a' },
  one_time:  { background: 'transparent',           color: '#2d5a5a', border: '1px solid rgba(45,90,90,0.25)' },
  critical:  { background: 'rgba(220,38,38,0.1)',  color: '#dc2626' },
  high:      { background: 'rgba(234,138,16,0.1)', color: '#ea8a10' },
  medium:    { background: 'rgba(99,102,241,0.1)', color: '#6366f1' },
  routine:   { background: 'rgba(115,115,115,0.1)',color: '#737373' },
}

export default function Badge({ type, label }) {
  const s = presets[type] || presets.routine
  return (
    <span style={{
      ...s, fontSize: 9, fontWeight: 600, letterSpacing: '0.05em',
      padding: '2px 6px', borderRadius: 3, textTransform: 'uppercase',
      whiteSpace: 'nowrap', border: s.border || 'none'
    }}>
      {label || type}
    </span>
  )
}
