'use client'

import { InvoiceForm } from '@/components/invoice/InvoiceForm'
import { InvoicePreview } from '@/components/invoice/InvoicePreview'
import { Badge } from '@/components/ui/badge'
import { getInvoice, updateInvoice } from '@/lib/firestore'
import { DEFAULT_TEMPLATE, InvoiceData, TemplateSettings } from '@/types'
import dayjs from 'dayjs'
import { ArrowLeft, CheckCircle2, Clock, Loader2, Pencil, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { use, useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

const PDFDownloadButton = dynamic(
  () => import('@/components/invoice/PDFDownloadButton').then(m => m.PDFDownloadButton),
  { ssr: false }
)

const STATUS_VARIANT: Record<string, 'default' | 'warning' | 'success' | 'secondary'> = {
  draft: 'warning', sent: 'default', paid: 'success',
}

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string }>
}

export default function InvoiceViewPage({ params, searchParams }: PageProps) {
  const { id } = use(params)
  const { edit } = use(searchParams)
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [template, setTemplate] = useState<TemplateSettings>({ ...DEFAULT_TEMPLATE })
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(edit === '1')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>(edit === '1' ? 'form' : 'preview')
  const [scale, setScale] = useState(0.65)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getInvoice(id)
      .then(data => { if (!data) return; setInvoice(data); if (data.template) setTemplate(data.template) })
      .catch(() => toast.error('Failed to load invoice'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth - 32
        setScale(Math.min(0.75, w / 794))
      }
    }
    update()
    const ro = new ResizeObserver(update)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [editMode])

  const handleUpdate = useCallback(async (data: Partial<InvoiceData>) => {
    if (!invoice) return
    setSaving(true)
    try {
      await updateInvoice(id, data)
      setInvoice({ ...invoice, ...data } as InvoiceData)
      setEditMode(false)
      setActiveTab('preview')
      toast.success('Invoice updated!')
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }, [id, invoice])

  if (loading) return (
    <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
      <Loader2 className="animate-spin" size={18} /><span className="text-sm">Loading…</span>
    </div>
  )

  if (!invoice) return (
    <div className="flex h-64 flex-col items-center justify-center gap-3">
      <p className="text-muted-foreground">Invoice not found</p>
      <Link href="/invoices" className="text-sm text-[#1890ff] hover:underline">Back to invoices</Link>
    </div>
  )

  return (
    <div className="tdc-container">
      {/* ── Breadcrumb ───────────────────────────────────── */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/invoices" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft size={12} /> Invoices
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{invoice.billNo}</span>
        <Badge variant={STATUS_VARIANT[invoice.status] ?? 'secondary'}>{invoice.status}</Badge>
      </div>

      {/* ── Action bar ───────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">{invoice.billNo}</h1>
          <p className="text-sm text-muted-foreground">
            {invoice.customerName || 'No customer'} ·{' '}
            {invoice.date ? dayjs(invoice.date).format('DD MMM YYYY') : '—'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {editMode ? (
            <button onClick={() => { setEditMode(false); setActiveTab('preview') }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors">
              <X size={13} /> Cancel
            </button>
          ) : (
            <button onClick={() => { setEditMode(true); setActiveTab('form') }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#1890ff]/30 px-3 py-1.5 text-sm text-[#1890ff] hover:bg-[#1890ff]/5 transition-colors">
              <Pencil size={13} /> Edit Invoice
            </button>
          )}
          <PDFDownloadButton invoice={invoice} template={template} fileName={`invoice-${invoice.billNo}.pdf`} />
        </div>
      </div>

      {/* ── Stats row ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Bill No', value: invoice.billNo },
          { label: 'Date', value: invoice.date ? dayjs(invoice.date).format('DD MMM YYYY') : '—' },
          { label: 'Customer', value: invoice.customerName || '—' },
          { label: 'Total', value: (invoice.total ?? 0) > 0 ? `${template.currencySymbol} ${invoice.total.toLocaleString('en-IN')}` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="tdc-card">
            <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
            <div className="font-semibold text-foreground truncate">{value}</div>
          </div>
        ))}
      </div>

      {/* ── Status pills ────────────────────────────────── */}
      {!editMode && (
        <div className="flex flex-wrap gap-2">
          {(['draft', 'sent', 'paid'] as const).map(s => (
            <button
              key={s}
              onClick={async () => {
                await updateInvoice(id, { status: s })
                setInvoice({ ...invoice, status: s })
                toast.success(`Marked as ${s}`)
              }}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                invoice.status === s
                  ? s === 'paid' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400'
                    : s === 'sent' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'border-border text-muted-foreground hover:bg-accent'
              }`}
            >
              {s === 'paid' && <CheckCircle2 size={11} />}
              {s === 'draft' && <Clock size={11} />}
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* ── Mobile tabs in edit mode ─────────────────────── */}
      {editMode && (
        <div className="flex rounded-lg border border-border bg-card p-1 sm:hidden">
          {(['form', 'preview'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-md py-2 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'gradient-primary' : 'text-muted-foreground'}`}>
              {tab === 'form' ? 'Edit' : 'Preview'}
            </button>
          ))}
        </div>
      )}

      {editMode ? (
        /* ── Edit layout ────────────────────────────────── */
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className={`w-full shrink-0 lg:w-105 xl:w-115 ${activeTab === 'preview' ? 'hidden sm:block' : ''}`}>
            <div className="tdc-card">
              <h2 className="mb-4 font-semibold text-foreground">Edit Invoice</h2>
              <InvoiceForm template={template} initialData={invoice} onSave={handleUpdate} saving={saving} />
            </div>
          </div>
          <div ref={containerRef} className={`flex-1 min-w-0 ${activeTab === 'form' ? 'hidden sm:block' : ''}`}>
            <div className="tdc-card">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Preview</h2>
                <span className="text-xs text-muted-foreground">{Math.round(scale * 100)}% zoom</span>
              </div>
              <div className="overflow-hidden rounded-lg bg-muted/40 p-4" style={{ minHeight: Math.round(1123 * scale) + 32 }}>
                <div style={{ width: 794 * scale, height: 1123 * scale }}>
                  <InvoicePreview invoice={invoice} template={template} scale={scale} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── View layout ────────────────────────────────── */
        <div ref={containerRef} className="tdc-card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Invoice Preview</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{Math.round(scale * 100)}% zoom</span>
              <PDFDownloadButton invoice={invoice} template={template} fileName={`invoice-${invoice.billNo}.pdf`} />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-muted/40 p-4" style={{ minHeight: Math.round(1123 * scale) + 32 }}>
            <div style={{ width: 794 * scale, height: 1123 * scale }}>
              <InvoicePreview invoice={invoice} template={template} scale={scale} />
            </div>
          </div>

          {invoice.lineItems?.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-lg border border-border">
              <div className="bg-muted/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Line Items
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground font-medium">
                    <th className="px-4 py-2 text-left w-10">#</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    {template.showSize && <th className="px-4 py-2 text-center w-24">Size</th>}
                    {template.showSqft && <th className="px-4 py-2 text-center w-16">sq.ft</th>}
                    <th className="px-4 py-2 text-right w-24">Rate</th>
                    <th className="px-4 py-2 text-right w-28">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoice.lineItems.map((item, i) => (
                    <tr key={item.id ?? i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-2 text-foreground">{item.description || '—'}</td>
                      {template.showSize && <td className="px-4 py-2 text-center text-muted-foreground">{item.size || '—'}</td>}
                      {template.showSqft && <td className="px-4 py-2 text-center text-muted-foreground">{item.sqft || '—'}</td>}
                      <td className="px-4 py-2 text-right text-muted-foreground">{item.rate ? `${template.currencySymbol}${item.rate}` : '—'}</td>
                      <td className="px-4 py-2 text-right font-medium text-foreground">
                        {item.amount > 0 ? `${template.currencySymbol}${item.amount.toLocaleString('en-IN')}` : '—'}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border font-semibold bg-muted/20">
                    <td colSpan={2 + (template.showSize ? 1 : 0) + (template.showSqft ? 1 : 0) + 1}
                      className="px-4 py-2 text-right text-sm text-muted-foreground">Total</td>
                    <td className="px-4 py-2 text-right text-foreground">
                      {(invoice.total ?? 0) > 0 ? `${template.currencySymbol}${invoice.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
