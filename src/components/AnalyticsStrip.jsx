import { useState, useEffect } from 'react'
import api from '../api/client'

const prefix = import.meta.env.DEV ? '/api' : ''

function fetchAnalytics() {
  return api.get(`${prefix}/analytics/daily`).then(r => r.data)
}

export default function AnalyticsStrip() {
  const [data, setData] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchAnalytics()
      .then(setData)
      .catch(() => setError(true))

    const interval = setInterval(() =>
      fetchAnalytics().then(setData).catch(() => {}),
      60000
    )
    return () => clearInterval(interval)
  }, [])

  if (error || !data) return null

  const { total, status_breakdown, priority_distribution,
          avg_priority_score, completion_rate_pct,
          no_show_risk_count, busiest_hour } = data

  const bandColor = {
    critical: 'var(--danger)',
    high: 'var(--warning)',
    medium: 'var(--ml)',
    routine: 'var(--muted-foreground)',
  }

  const maxBand = Object.entries(priority_distribution)
    .reduce((a, b) => b[1] > a[1] ? b : a, ['routine', 0])[0]

  return (
    <div style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--surface)',
      flexShrink: 0,
      userSelect: 'none',
    }}>
      {/* Collapsed strip — always visible */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', gap: 20,
          padding: '6px 14px', cursor: 'pointer',
          justifyContent: 'space-between',
        }}
        title="Click to expand analytics"
      >
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Metric label="Today" value={total} />
          <Metric label="Done" value={`${status_breakdown.completed}/${total}`} />
          <Metric
            label="Critical"
            value={priority_distribution.critical}
            color={priority_distribution.critical > 0 ? 'var(--danger)' : undefined}
          />
          <Metric label="Avg Score" value={avg_priority_score} />
          {no_show_risk_count > 0 && (
            <Metric
              label="No-show risk"
              value={no_show_risk_count}
              color="var(--warning)"
            />
          )}
          {busiest_hour && (
            <Metric label="Peak hour" value={busiest_hour} />
          )}
        </div>
        <span style={{
          fontSize: 9, color: 'var(--muted-foreground)',
          fontFamily: 'var(--font-mono)',
          transform: expanded ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
          display: 'inline-block',
        }}>▲</span>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div style={{
          padding: '10px 14px 14px',
          borderTop: '1px solid var(--border)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 16,
        }}>
          {/* Priority distribution */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 600,
              color: 'var(--muted-foreground)', textTransform: 'uppercase',
              letterSpacing: '0.07em', marginBottom: 8 }}>
              Priority Breakdown
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {Object.entries(priority_distribution).map(([band, count]) => (
                <div key={band} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 48, fontSize: 9,
                    color: 'var(--muted-foreground)', textTransform: 'capitalize' }}>
                    {band}
                  </div>
                  <div style={{ flex: 1, height: 4, background: 'var(--muted)',
                    borderRadius: 9999, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 9999,
                      background: bandColor[band],
                      width: total > 0 ? `${(count / total) * 100}%` : '0%',
                      transition: 'width 0.3s',
                    }} />
                  </div>
                  <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)',
                    color: bandColor[band], fontWeight: 600, width: 16,
                    textAlign: 'right' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status breakdown */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 600,
              color: 'var(--muted-foreground)', textTransform: 'uppercase',
              letterSpacing: '0.07em', marginBottom: 8 }}>
              Status
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {Object.entries(status_breakdown).map(([status, count]) => (
                <div key={status} style={{ display: 'flex',
                  justifyContent: 'space-between', fontSize: 10 }}>
                  <span style={{ color: 'var(--muted-foreground)',
                    textTransform: 'capitalize' }}>
                    {status.replace('_', ' ')}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)',
                    fontWeight: 600 }}>{count}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border)',
                paddingTop: 4, marginTop: 2, display: 'flex',
                justifyContent: 'space-between', fontSize: 10 }}>
                <span style={{ color: 'var(--muted-foreground)' }}>
                  Completion rate
                </span>
                <span style={{ fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  color: completion_rate_pct >= 80 ? 'var(--success)'
                    : completion_rate_pct >= 50 ? 'var(--warning)'
                    : 'var(--danger)' }}>
                  {completion_rate_pct}%
                </span>
              </div>
            </div>
          </div>

          {/* Operational insights */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 600,
              color: 'var(--muted-foreground)', textTransform: 'uppercase',
              letterSpacing: '0.07em', marginBottom: 8 }}>
              Insights
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {busiest_hour && (
                <Insight
                  label="Peak slot"
                  value={busiest_hour}
                  hint="Most appointments cluster here"
                />
              )}
              <Insight
                label="Avg ML score"
                value={`${avg_priority_score}/100`}
                hint={`Today skews ${maxBand}`}
                valueColor={bandColor[maxBand]}
              />
              {no_show_risk_count > 0 ? (
                <Insight
                  label="No-show risk"
                  value={`${no_show_risk_count} appt${no_show_risk_count > 1 ? 's' : ''}`}
                  hint="Booked 5+ days ago, still pending"
                  valueColor="var(--warning)"
                />
              ) : (
                <Insight
                  label="No-show risk"
                  value="None"
                  hint="All recent bookings"
                  valueColor="var(--success)"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Metric({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span style={{ fontSize: 8, color: 'var(--muted-foreground)',
        textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)',
        fontWeight: 600, color: color || 'var(--foreground)' }}>
        {value}
      </span>
    </div>
  )
}

function Insight({ label, value, hint, valueColor }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'baseline' }}>
        <span style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>
          {label}
        </span>
        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)',
          fontWeight: 600, color: valueColor || 'var(--foreground)' }}>
          {value}
        </span>
      </div>
      {hint && (
        <div style={{ fontSize: 9, color: 'var(--muted-foreground)',
          fontStyle: 'italic', marginTop: 1 }}>
          {hint}
        </div>
      )}
    </div>
  )
}
