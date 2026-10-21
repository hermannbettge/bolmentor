export default function AnalysisDisplay({ content }) {
  if (!content) return null

  // Strip leading # title lines and --- separators before parsing sections
  const cleaned = content
    .split('\n')
    .filter(l => !l.match(/^#[^#]/) && !l.match(/^-{2,}$/) && !l.match(/^\*{2,}$/))
    .join('\n')
  const sections = cleaned.split(/(?=## )/).filter(Boolean)

  return (
    <div className="analysis-content" style={{ marginTop: '32px' }}>
      {sections.map((section, idx) => {
        const lines = section.trim().split('\n')
        const headline = lines[0].replace('## ', '')
        const body = lines.slice(1).join('\n').trim()

        return (
          <div key={idx} style={{ marginBottom: '32px' }}>
            <h2 style={{
              color: 'var(--accent)',
              fontSize: '0.85rem',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '1px solid var(--border)',
            }}>
              {headline}
            </h2>
            <div style={{ color: 'var(--text-1)', fontWeight: 300, lineHeight: 1.85, fontSize: '0.95rem' }}>
              {body.split('\n').map((line, i) => {
                if (!line.trim()) return null
                // Render **bold** markdown
                const parts = line.split(/(\*\*[^*]+\*\*)/)
                return (
                  <p key={i} style={{ margin: '0 0 12px' }}>
                    {parts.map((part, j) =>
                      part.startsWith('**') && part.endsWith('**')
                        ? <strong key={j} style={{ fontWeight: 500, color: 'var(--accent)' }}>{part.slice(2, -2)}</strong>
                        : part
                    )}
                  </p>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
