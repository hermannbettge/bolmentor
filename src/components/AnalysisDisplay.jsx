export default function AnalysisDisplay({ content }) {
  if (!content) return null

  const sections = content.split(/(?=## )/).filter(Boolean)

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
              {body.split('\n').map((line, i) => (
                line.trim() ? <p key={i} style={{ margin: '0 0 12px' }}>{line}</p> : null
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
