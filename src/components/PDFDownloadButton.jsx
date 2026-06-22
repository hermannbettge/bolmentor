import { useState } from 'react'
import { generateAnalysisPDF } from '../lib/pdfGenerator.js'

export default function PDFDownloadButton({ content, analysisType, userName, date }) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      await generateAnalysisPDF({ content, analysisType, userName, date })
    } catch (err) {
      console.error('PDF-Fehler:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      style={{
        border: '1px solid var(--color-gold-muted)',
        color: 'var(--color-gold)',
        background: 'transparent',
        borderRadius: '4px',
        padding: '10px 24px',
        fontSize: '0.85rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        transition: 'all 0.15s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {loading ? (
        <>
          <span className="pulse-gold">⏳</span> PDF wird erstellt...
        </>
      ) : (
        <>📥 Als PDF herunterladen</>
      )}
    </button>
  )
}
