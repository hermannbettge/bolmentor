import jsPDF from 'jspdf'
import { getGermanDate } from './mayanCalendar.js'

const COLORS = {
  bg: [255, 255, 255],
  bgAccent: [244, 239, 230],   // warm cream for header strip
  copper: [160, 82, 45],
  copperMuted: [192, 130, 90],
  textPrimary: [42, 32, 24],
  textMuted: [90, 78, 66],
  border: [200, 185, 165],
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0]
}

function wrapText(doc, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  let currentY = y

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' '
    const testWidth = doc.getTextWidth(testLine)
    if (testWidth > maxWidth && i > 0) {
      doc.text(line.trim(), x, currentY)
      line = words[i] + ' '
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  if (line.trim()) {
    doc.text(line.trim(), x, currentY)
    currentY += lineHeight
  }
  return currentY
}

export async function generateAnalysisPDF({ content, analysisType, userName, date }) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2

  const typeLabels = {
    daily: 'Tagesenergie',
    monthly: 'Monatsanalyse',
    business: 'Business-Analyse',
    health: 'Gesundheitsanalyse',
    family: 'Familienanalyse',
    selfexpression: 'Selbstausdruck-Analyse',
    finance: 'Finanzanalyse',
    career: 'Karriere-Analyse',
    lifephases: 'Lebensphasen-Analyse',
    partnership: 'Partnerschaftsanalyse',
    compatibility: 'Partner-Kompatibilität',
  }

  const typeLabel = typeLabels[analysisType] || 'Analyse'
  const dateObj = getGermanDate()

  // --- White background ---
  doc.setFillColor(...COLORS.bg)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  // --- Cream header strip ---
  const headerH = 32
  doc.setFillColor(...COLORS.bgAccent)
  doc.rect(0, 0, pageWidth, headerH, 'F')

  // --- Logo ---
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.copper)
  doc.setCharSpace(2)
  doc.text('BEWUSSTSEIN.OHNE.LIMIT', margin, 10)
  doc.setCharSpace(0)

  // --- Analysis type + Name ---
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(13)
  doc.setTextColor(...COLORS.textPrimary)
  doc.text(`${typeLabel} für ${userName}`, margin, 20)

  // --- Date (right-aligned) ---
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.textMuted)
  doc.text(date || dateObj.shortFormatted, pageWidth - margin, 20, { align: 'right' })

  // --- Bottom border of header ---
  doc.setDrawColor(...COLORS.copper)
  doc.setLineWidth(0.4)
  doc.line(0, headerH, pageWidth, headerH)

  let y = headerH + 10

  // --- Parse and render content ---
  // Strip emojis and --- separators for PDF compatibility
  const cleanContent = content
    .replace(/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27FF}]|[\u{FE00}-\u{FEFF}]/gu, '')
    .replace(/^-{2,}$/gm, '')
    .replace(/^#{1}(?!#).+$/gm, '') // remove single # title lines
  const lines = cleanContent.split('\n')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  for (const line of lines) {
    if (y > pageHeight - 25) {
      doc.addPage()
      doc.setFillColor(...COLORS.bg)
      doc.rect(0, 0, pageWidth, pageHeight, 'F')
      y = margin
    }

    if (line.startsWith('## ')) {
      y += 5
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(...COLORS.copper)
      doc.setCharSpace(1)
      doc.text(line.replace('## ', '').toUpperCase(), margin, y)
      doc.setCharSpace(0)
      y += 3
      doc.setDrawColor(...COLORS.border)
      doc.setLineWidth(0.2)
      doc.line(margin, y, pageWidth - margin, y)
      y += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
    } else if (line.trim() === '') {
      y += 2
    } else {
      doc.setTextColor(...COLORS.textPrimary)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      // Strip ** bold markers for PDF
      const cleanLine = line.replace(/\*\*/g, '')
      const splitLines = doc.splitTextToSize(cleanLine, contentWidth)
      for (const splitLine of splitLines) {
        if (y > pageHeight - 25) {
          doc.addPage()
          doc.setFillColor(...COLORS.bg)
          doc.rect(0, 0, pageWidth, pageHeight, 'F')
          y = margin
        }
        doc.text(splitLine, margin, y)
        y += 5.5
      }
    }
  }

  // --- Footer ---
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFillColor(...COLORS.bgAccent)
    doc.rect(0, pageHeight - 12, pageWidth, 12, 'F')
    doc.setDrawColor(...COLORS.copper)
    doc.setLineWidth(0.3)
    doc.line(0, pageHeight - 12, pageWidth, pageHeight - 12)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.textMuted)
    doc.text(
      `bewusstsein.ohne.limit  ·  Maya Kalender Analyse  ·  ${dateObj.shortFormatted}`,
      margin,
      pageHeight - 5
    )
    doc.text(`${i} / ${totalPages}`, pageWidth - margin, pageHeight - 5, { align: 'right' })
  }

  // --- Save ---
  const safeName = userName.replace(/\s+/g, '_')
  const safeDate = dateObj.shortFormatted.replace(/\./g, '-').replace(/\s+/g, '_')
  const fileName = `BOL_Maya_${typeLabel.replace(/\s+/g, '_')}_${safeName}_${safeDate}.pdf`

  doc.save(fileName)
}
