export default function Segmented({ value, options, onChange, disabled }) {
  return (
    <div style={{
      display: 'flex', gap: 2, border: '1px solid var(--border)',
      borderRadius: 4, padding: 2, background: 'var(--surface)',
      opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto'
    }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)}
          disabled={o.disabled}
          style={{
            padding: '3px 8px', fontSize: 10, fontWeight: 500,
            borderRadius: 3, border: 'none', cursor: o.disabled ? 'not-allowed' : 'pointer',
            background: value === o.value ? 'var(--primary)' : 'transparent',
            color: value === o.value ? 'var(--primary-foreground)'
                 : o.disabled ? 'var(--muted-foreground)' : 'inherit',
            transition: 'all 0.1s'
          }}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
