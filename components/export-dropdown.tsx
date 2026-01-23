"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileText, FileJson, FileSpreadsheet, Loader2 } from 'lucide-react'
import { exportToCSV, exportToJSON, exportToPDF, generateFilename, ExportMetadata } from '@/lib/exporters'

interface ExportDropdownProps {
  data: any[]
  filename: string
  title: string
  metadata?: Partial<ExportMetadata>
  disabled?: boolean
  className?: string
}

export function ExportDropdown({
  data,
  filename,
  title,
  metadata,
  disabled = false,
  className = '',
}: ExportDropdownProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    if (data.length === 0) {
      alert('No data to export')
      return
    }

    setIsExporting(true)

    try {
      const exportMetadata: ExportMetadata = {
        title,
        timestamp: new Date(),
        totalRecords: data.length,
        filters: metadata?.filters,
      }

      switch (format) {
        case 'csv':
          exportToCSV(data, generateFilename(filename, 'csv'), exportMetadata)
          break
        case 'json':
          exportToJSON(data, generateFilename(filename, 'json'), exportMetadata)
          break
        case 'pdf':
          exportToPDF(data, generateFilename(filename, 'pdf'), title, exportMetadata)
          break
      }
    } catch (error: any) {
      console.error('Export failed:', error)
      alert(`Export failed: ${error.message}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isExporting || data.length === 0}
          className={className}
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
