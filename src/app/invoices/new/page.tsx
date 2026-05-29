'use client'

import { InvoiceForm } from '@/components/invoice/InvoiceForm'
import { InvoicePreview } from '@/components/invoice/InvoicePreview'
import { createInvoice, getTemplates } from '@/lib/firestore'
import { DEFAULT_TEMPLATE, InvoiceData, TemplateSettings } from '@/types'
import { ChevronRight, FileText } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

const PDFDownloadButton = dynamic(
  () => import('@/components/invoice/PDFDownloadButton').then(m => m.PDFDownloadButton),
  { ssr: false }
)

export default function NewInvoicePage() {
  const [templates, setTemplates] = useState<TemplateSettings[]>([])
  const [template, setTemplate] = useState<TemplateSettings>({ ...DEFAULT_TEMPLATE })
  const [liveData, setLiveData] = useState<Partial<InvoiceData>>({})
  const [savedInvoice, setSavedInvoice] = useState<Partial<InvoiceData> | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form')
  const [scale, setScale] = useState(0.5)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getTemplates()
      .then(list => { setTemplates(list); if (list.length) setTemplate(list[0]) })
      .catch(() => toast.error('Failed to load templates'))
  }, [])

  useEffect(() => {
    const update = () => {
      if (previewRef.current) {
        const w = previewRef.current.offsetWidth - 32
        setScale(Math.min(0.65, w / 794))
      }
    }
    update()
    const ro = new ResizeObserver(update)
    if (previewRef.current) ro.observe(previewRef.current)
    return () => ro.disconnect()
  }, [])

  const handleSave = useCallback(async (data: Partial<InvoiceData>) => {
    setSaving(true)
    try {
      const saved = await createInvoice({
        ...(data as Omit<InvoiceData, '_id' | 'createdAt' | 'updatedAt'>),
        templateId: template._id ?? '',
        status: 'draft',
      })
      setSavedInvoice({ ...saved, template })
      toast.success('Invoice saved!')
    } catch {
      toast.error('Failed to save invoice')
    } finally {
      setSaving(false)
    }
  }, [template])

  return (
    <div className="tdc-container">
      {/* ── Breadcrumb ──────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/invoices" className="hover:text-foreground transition-colors">Invoices</Link>
        <ChevronRight size={12} />
        <span className="text-foreground font-medium">New Invoice</span>
      </div>

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">New Invoice</h1>
          <p className="text-sm text-muted-foreground">Fill in the form — preview updates live</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {templates.length > 1 && (
            <select
              value={template._id ?? ''}
              onChange={e => { const t = templates.find(x => x._id === e.target.value); if (t) setTemplate(t) }}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {templates.map(t => (
                <option key={t._id} value={t._id ?? ''}>{t.name}</option>
              ))}
            </select>
          )}
          {savedInvoice && (
            <>
              <PDFDownloadButton invoice={savedInvoice} template={template} fileName={`invoice-${savedInvoice.billNo ?? 'draft'}.pdf`} />
              <Link href="/invoices" className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors">
                <FileText size={13} /> All Invoices
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── Mobile tabs ────────────────────────────────────────── */}
      <div className="flex rounded-lg border border-border bg-card p-1 sm:hidden">
        {(['form', 'preview'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md py-2 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'gradient-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Form */}
        <div className={`w-full shrink-0 lg:w-105 xl:w-115 ${activeTab === 'preview' ? 'hidden sm:block' : ''}`}>
          <div className="tdc-card">
            <h2 className="mb-4 font-semibold text-foreground">Invoice Details</h2>
            <InvoiceForm template={template} onChange={setLiveData} onSave={handleSave} saving={saving} />
          </div>
        </div>

        {/* Preview */}
        <div ref={previewRef} className={`flex-1 min-w-0 ${activeTab === 'form' ? 'hidden sm:block' : ''}`}>
          <div className="tdc-card">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Live Preview</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{Math.round(scale * 100)}% zoom</span>
                {savedInvoice && <PDFDownloadButton invoice={savedInvoice} template={template} fileName={`invoice-${savedInvoice.billNo ?? 'draft'}.pdf`} />}
              </div>
            </div>
            <div className="overflow-hidden rounded-lg bg-muted/40 p-4" style={{ minHeight: Math.round(1123 * scale) + 32 }}>
              <div style={{ width: 794 * scale, height: 1123 * scale }}>
                <InvoicePreview invoice={savedInvoice ?? liveData} template={template} scale={scale} />
              </div>
            </div>
            {!savedInvoice && <p className="mt-2 text-center text-xs text-muted-foreground">Save the invoice to unlock PDF download</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
