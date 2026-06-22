import jsPDF from 'jspdf'
import { getGermanDate } from './mayanCalendar.js'

const COLORS = {
  bgDeep: [13, 27, 42],
  gold: [184, 151, 90],
  goldMuted: [139, 110, 62],
  textPrimary: [232, 232, 232],
  textMuted: [136, 153, 170],
  white: [255, 255, 255],
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

  // --- Background ---
  doc.setFillColor(...COLORS.bgDeep)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  let y = margin

  // --- Logo ---
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.gold)
  doc.setCharSpace(2)
  doc.text('BEWUSSTSEIN.OHNE.LIMIT.', margin, y)
  doc.setCharSpace(0)

  y += 8

  // --- Analysis type + Name + Date ---
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(...COLORS.textPrimary)
  doc.text(`${typeLabel} für ${userName}`, margin, y)

  y += 6

  doc.setFontSize(8)
  doc.setTextColor(...COLORS.textMuted)
  doc.text(date || dateObj.shortFormatted, margin, y)

  y += 8

  // --- Gold divider ---
  doc.setDrawColor(...COLORS.goldMuted)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)

  y += 10

  // --- Parse and render content ---
  const lines = content.split('\n')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  for (const line of lines) {
    if (y > pageHeight - 25) {
      doc.addPage()
      doc.setFillColor(...COLORS.bgDeep)
      doc.rect(0, 0, pageWidth, pageHeight, 'F')
      y = margin
    }

    if (line.startsWith('## ')) {
      y += 4
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(...COLORS.gold)
      doc.setCharSpace(1)
      doc.text(line.replace('## ', '').toUpperCase(), margin, y)
      doc.setCharSpace(0)
      y += 3
      doc.setDrawColor(...COLORS.goldMuted)
      doc.setLineWidth(0.2)
      doc.line(margin, y, pageWidth - margin, y)
      y += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
    } else if (line.trim() === '') {
      y += 3
    } else {
      doc.setTextColor(...COLORS.textPrimary)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const splitLines = doc.splitTextToSize(line, contentWidth)
      for (const splitLine of splitLines) {
        if (y > pageHeight - 25) {
          doc.addPage()
          doc.setFillColor(...COLORS.bgDeep)
          doc.rect(0, 0, pageWidth, pageHeight, 'F')
          y = margin
        }
        doc.text(splitLine, margin, y)
        y += 5
      }
    }
  }

  // --- Footer ---
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFillColor(...COLORS.bgDeep)
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F')
    doc.setDrawColor(...COLORS.goldMuted)
    doc.setLineWidth(0.2)
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.textMuted)
    doc.text(
      `bewusstsein.ohne.limit  |  Maya Kalender Analyse  |  ${dateObj.shortFormatted}`,
      margin,
      pageHeight - 8
    )
    doc.text(`Seite ${i} von ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' })
  }

  // --- Save ---
  const safeName = userName.replace(/\s+/g, '_')
  const safeDate = dateObj.shortFormatted.replace(/\./g, '-').replace(/\s+/g, '_')
  const fileName = `BOL_Maya_${typeLabel.replace(/\s+/g, '_')}_${safeName}_${safeDate}.pdf`

  doc.save(fileName)
}
