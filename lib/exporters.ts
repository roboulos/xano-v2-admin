/**
 * Export utilities for CSV, JSON, and PDF formats
 * Provides consistent export functionality across all tabs
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ExportMetadata {
  title: string
  timestamp: Date
  filters?: Record<string, any>
  totalRecords: number
}

export type ExportFormat = 'csv' | 'json' | 'pdf'

// ============================================================================
// DOWNLOAD HELPER
// ============================================================================

/**
 * Triggers a file download in the browser
 */
export function downloadFile(content: string | Blob, filename: string, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ============================================================================
// CSV EXPORT
// ============================================================================

/**
 * Converts array of objects to CSV format
 * Handles nested objects by flattening them
 */
export function exportToCSV(data: any[], filename: string, metadata?: ExportMetadata) {
  if (data.length === 0) {
    throw new Error('No data to export')
  }

  // Flatten objects
  const flatData = data.map(item => flattenObject(item))

  // Get all unique keys
  const headers = Array.from(new Set(flatData.flatMap(obj => Object.keys(obj))))

  // Build CSV content
  const csvRows: string[] = []

  // Add metadata as comments
  if (metadata) {
    csvRows.push(`# ${metadata.title}`)
    csvRows.push(`# Generated: ${metadata.timestamp.toISOString()}`)
    csvRows.push(`# Total Records: ${metadata.totalRecords}`)
    if (metadata.filters) {
      csvRows.push(`# Filters: ${JSON.stringify(metadata.filters)}`)
    }
    csvRows.push('')
  }

  // Add headers
  csvRows.push(headers.map(escapeCSV).join(','))

  // Add data rows
  for (const row of flatData) {
    const values = headers.map(header => {
      const value = row[header]
      return escapeCSV(value)
    })
    csvRows.push(values.join(','))
  }

  const csvContent = csvRows.join('\n')
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;')
}

/**
 * Escapes CSV values
 */
function escapeCSV(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }

  const str = String(value)

  // If contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
}

/**
 * Flattens nested objects with dot notation
 */
function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const flattened: Record<string, any> = {}

  for (const key in obj) {
    const value = obj[key]
    const newKey = prefix ? `${prefix}.${key}` : key

    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(flattened, flattenObject(value, newKey))
    } else if (Array.isArray(value)) {
      flattened[newKey] = JSON.stringify(value)
    } else {
      flattened[newKey] = value
    }
  }

  return flattened
}

// ============================================================================
// JSON EXPORT
// ============================================================================

/**
 * Exports data as formatted JSON
 */
export function exportToJSON(data: any[], filename: string, metadata?: ExportMetadata) {
  const exportData = {
    metadata: metadata ? {
      title: metadata.title,
      timestamp: metadata.timestamp.toISOString(),
      totalRecords: metadata.totalRecords,
      filters: metadata.filters,
    } : undefined,
    data,
  }

  const jsonContent = JSON.stringify(exportData, null, 2)
  downloadFile(jsonContent, filename, 'application/json;charset=utf-8;')
}

// ============================================================================
// PDF EXPORT
// ============================================================================

/**
 * Generates a PDF report from tabular data
 */
export function exportToPDF(
  data: any[],
  filename: string,
  title: string,
  metadata?: ExportMetadata
) {
  const doc = new jsPDF()

  // Add title
  doc.setFontSize(18)
  doc.text(title, 14, 20)

  // Add metadata
  let yPosition = 30
  if (metadata) {
    doc.setFontSize(10)
    doc.text(`Generated: ${metadata.timestamp.toLocaleString()}`, 14, yPosition)
    yPosition += 6
    doc.text(`Total Records: ${metadata.totalRecords}`, 14, yPosition)
    yPosition += 6

    if (metadata.filters && Object.keys(metadata.filters).length > 0) {
      doc.text(`Filters: ${JSON.stringify(metadata.filters)}`, 14, yPosition)
      yPosition += 6
    }

    yPosition += 4
  }

  // Convert data to table format
  if (data.length > 0) {
    const flatData = data.map(item => flattenObject(item))
    const headers = Object.keys(flatData[0])
    const rows = flatData.map(row => headers.map(h => String(row[h] ?? '')))

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: yPosition,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
      margin: { top: yPosition },
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(8)
        doc.text(
          `Page ${data.pageNumber}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        )
      },
    })
  }

  // Save PDF
  doc.save(filename)
}

// ============================================================================
// SUMMARY PDF EXPORT (for complex reports)
// ============================================================================

/**
 * Generates a summary PDF report with sections
 */
export function exportSummaryToPDF(
  sections: Array<{ title: string; content: string | string[]; table?: any[] }>,
  filename: string,
  mainTitle: string,
  metadata?: ExportMetadata
) {
  const doc = new jsPDF()

  // Add main title
  doc.setFontSize(18)
  doc.text(mainTitle, 14, 20)

  let yPosition = 30

  // Add metadata
  if (metadata) {
    doc.setFontSize(10)
    doc.text(`Generated: ${metadata.timestamp.toLocaleString()}`, 14, yPosition)
    yPosition += 6
    doc.text(`Total Records: ${metadata.totalRecords}`, 14, yPosition)
    yPosition += 10
  }

  // Add sections
  for (const section of sections) {
    // Check if we need a new page
    if (yPosition > 260) {
      doc.addPage()
      yPosition = 20
    }

    // Section title
    doc.setFontSize(14)
    doc.text(section.title, 14, yPosition)
    yPosition += 8

    // Section content
    doc.setFontSize(10)
    if (Array.isArray(section.content)) {
      for (const line of section.content) {
        if (yPosition > 280) {
          doc.addPage()
          yPosition = 20
        }
        doc.text(line, 14, yPosition)
        yPosition += 6
      }
    } else {
      const lines = doc.splitTextToSize(section.content, 180)
      for (const line of lines) {
        if (yPosition > 280) {
          doc.addPage()
          yPosition = 20
        }
        doc.text(line, 14, yPosition)
        yPosition += 6
      }
    }

    // Section table
    if (section.table && section.table.length > 0) {
      yPosition += 4
      const flatData = section.table.map(item => flattenObject(item))
      const headers = Object.keys(flatData[0])
      const rows = flatData.map(row => headers.map(h => String(row[h] ?? '')))

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: yPosition,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
        margin: { top: yPosition },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 10
    }

    yPosition += 6
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  doc.save(filename)
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generates a filename with timestamp
 */
export function generateFilename(prefix: string, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  return `${prefix}_${timestamp}.${extension}`
}

/**
 * Formats filters for display
 */
export function formatFilters(filters: Record<string, any>): string {
  return Object.entries(filters)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')
}
