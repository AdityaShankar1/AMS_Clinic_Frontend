export default function PriorityBar({ band }) {
  const color = {
    critical: '#dc2626',
    high:     '#ea8a10',
    medium:   '#6366f1',
    routine:  '#d4d4d4',
  }[band] || '#d4d4d4'
  return (
    <span style={{
      display: 'inline-block', width: 3, height: 18,
      borderRadius: 9999, background: color, flexShrink: 0
    }} title={band} />
  )
}
