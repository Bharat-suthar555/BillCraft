'use client'

import { InvoiceData, TemplateSettings } from '@/types'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { FileDown, Loader2 } from 'lucide-react'
import { InvoicePDFDocument } from './InvoicePDFDocument'

interface Props {
  invoice: Partial<InvoiceData>
  template: TemplateSettings
  fileName?: string
  className?: string
}

export function PDFDownloadButton({ invoice, template, fileName, className }: Props) {
  const name = fileName ?? `invoice-${invoice.billNo ?? 'draft'}.pdf`

  return (
    <PDFDownloadLink
      document={<InvoicePDFDocument invoice={invoice} template={template} />}
      fileName={name}
      className={className}
    >
      {({ loading }) =>
        loading ? (
          <span className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white opacity-70 cursor-wait">
            <Loader2 size={14} className="animate-spin" />
            Preparing PDF...
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors cursor-pointer">
            <FileDown size={14} />
            Download PDF
          </span>
        )
      }
    </PDFDownloadLink>
  )
}
