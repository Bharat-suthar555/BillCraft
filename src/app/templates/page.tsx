'use client';

import { InvoicePreview } from '@/components/invoice/InvoicePreview';
import { TemplateEditor } from '@/components/template/TemplateEditor';
import {
  createTemplate,
  deleteTemplate,
  getTemplates,
  updateTemplate,
} from '@/lib/firestore';
import { DEFAULT_TEMPLATE, EMPTY_LINE_ITEM, TemplateSettings } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Check, ChevronRight, Copy, PlusCircle, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const DEMO_INVOICE_BASE = {
  billNo: 'INV-001',
  date: new Date().toISOString().split('T')[0],
  customerPhone: '+91 9876543215',
  customerAddress: 'Rampura Colony, Jalore',
  lineItems: [
    {
      ...EMPTY_LINE_ITEM(),
      description: 'Waterproofing – Roof',
      size: '40×30',
      sqft: '1200',
      rate: '25',
      amount: 30000,
    },
    {
      ...EMPTY_LINE_ITEM(),
      description: 'Waterproofing – Basement',
      size: '20×15',
      sqft: '300',
      rate: '30',
      amount: 9000,
    },
  ],
  total: 39000,
};

export default function TemplatesPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<TemplateSettings[]>([]);
  const [selected, setSelected] = useState<TemplateSettings | null>(null);
  const [dirty, setDirty] = useState<TemplateSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [scale, setScale] = useState(0.5);
  const previewRef = useRef<HTMLDivElement>(null);

  const active = dirty ?? selected;

  const demoInvoice = {
    ...DEMO_INVOICE_BASE,
    customerName: user?.displayName ?? 'Bharat Suthar',
  };

  useEffect(() => {
    getTemplates()
      .then((list) => {
        setTemplates(list);
        setSelected(list[0] ?? null);
      })
      .catch(() =>
        toast.error('Failed to load templates. Check Firebase config.'),
      );
  }, []);

  useEffect(() => {
    const update = () => {
      if (previewRef.current) {
        const w = previewRef.current.offsetWidth - 32;
        setScale(Math.min(0.62, w / 794));
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (previewRef.current) ro.observe(previewRef.current);
    return () => ro.disconnect();
  }, []);

  const handleNew = useCallback(async () => {
    setSaving(true);
    try {
      const t = await createTemplate({
        ...DEFAULT_TEMPLATE,
        name: `Template ${templates.length + 1}`,
      });
      setTemplates((prev) => [t, ...prev]);
      setSelected(t);
      setDirty(null);
      toast.success('New template created');
    } catch {
      toast.error('Failed to create');
    } finally {
      setSaving(false);
    }
  }, [templates.length]);

  const handleSave = useCallback(async () => {
    if (!active) return;
    setSaving(true);
    try {
      if (active._id) {
        await updateTemplate(active._id, active);
        setTemplates((prev) =>
          prev.map((t) => (t._id === active._id ? active : t)),
        );
        setSelected(active);
        setDirty(null);
      } else {
        const saved = await createTemplate(active);
        setTemplates((prev) => [saved, ...prev]);
        setSelected(saved);
        setDirty(null);
      }
      toast.success('Template saved!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  }, [active]);

  const handleDuplicate = useCallback(async (t: TemplateSettings) => {
    setSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, createdAt, updatedAt, ...rest } = t;
      const copy = await createTemplate({ ...rest, name: `${t.name} (copy)` });
      setTemplates((prev) => [copy, ...prev]);
      setSelected(copy);
      setDirty(null);
      toast.success('Duplicated!');
    } catch {
      toast.error('Failed');
    } finally {
      setSaving(false);
    }
  }, []);

  const handleDelete = useCallback(async (t: TemplateSettings) => {
    if (!confirm(`Delete "${t.name}"?`)) return;
    try {
      await deleteTemplate(t._id!);
      setTemplates((prev) => prev.filter((x) => x._id !== t._id));
      setSelected((prev) => (prev?._id === t._id ? null : prev));
      setDirty(null);
      toast.success('Deleted');
    } catch {
      toast.error('Failed');
    }
  }, []);

  return (
    <div className='tdc-container'>
      {/* ── Breadcrumb ──────────────────────────────────────── */}
      <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
        <span className='text-foreground font-medium'>Templates</span>
        <ChevronRight size={12} />
        <span>{active?.name ?? '—'}</span>
      </div>

      {/* ── Page header ─────────────────────────────────────── */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold text-foreground'>
            Invoice Templates
          </h1>
          <p className='text-sm text-muted-foreground'>
            Customize the look of your invoices
          </p>
        </div>
        <button
          onClick={handleNew}
          disabled={saving}
          className='gradient-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60'
        >
          <PlusCircle size={14} /> New Template
        </button>
      </div>

      {/* ── Templates list ──────────────────────────────────── */}
      <div className='tdc-card'>
        <h2 className='mb-3 text-sm font-semibold text-foreground'>
          Saved Templates
          <span className='ml-2 text-xs font-normal text-muted-foreground'>
            ({templates.length})
          </span>
        </h2>

        {templates.length === 0 ? (
          <p className='py-4 text-center text-sm text-muted-foreground'>
            No templates yet — create one above
          </p>
        ) : (
          <div className='flex flex-wrap gap-3'>
            {templates.map((t) => (
              <div
                key={t._id}
                onClick={() => {
                  setSelected(t);
                  setDirty(null);
                }}
                className={`group relative cursor-pointer rounded-xl border-2 p-3 transition-all ${
                  selected?._id === t._id
                    ? 'border-[#1890ff] shadow-md shadow-[#1890ff]/10'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
                style={{ minWidth: 176 }}
              >
                {selected?._id === t._id && (
                  <span className='absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-linear-to-br from-[#1890ff] to-[#722ed1] text-white'>
                    <Check size={11} />
                  </span>
                )}
                <div className='mb-2 flex gap-1.5'>
                  <span
                    className='h-4 w-8 rounded'
                    style={{ backgroundColor: t.primaryColor }}
                  />
                  <span
                    className='h-4 w-5 rounded'
                    style={{ backgroundColor: t.accentColor }}
                  />
                </div>
                <div className='text-sm font-medium text-foreground truncate max-w-40'>
                  {t.name}
                </div>
                <div className='text-xs text-muted-foreground truncate max-w-40'>
                  {t.companyName}
                </div>
                <div className='mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicate(t);
                    }}
                    className='rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors'
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(t);
                    }}
                    className='rounded p-1 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors'
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Editor + Preview ────────────────────────────────── */}
      {active && (
        <div className='flex flex-col gap-6 lg:flex-row lg:items-start'>
          <aside className='w-full shrink-0 lg:w-80 xl:w-96'>
            <div className='tdc-card'>
              <h2 className='mb-4 font-semibold text-foreground'>
                Edit: <span className='gradient-text'>{active.name}</span>
              </h2>
              <TemplateEditor
                template={active}
                onChange={(t) => setDirty(t)}
                onSave={handleSave}
                saving={saving}
              />
            </div>
          </aside>

          <div ref={previewRef} className='flex-1 min-w-0'>
            <div className='tdc-card'>
              <div className='mb-3 flex items-center justify-between'>
                <h2 className='font-semibold text-foreground'>Live Preview</h2>
                <span className='text-xs text-muted-foreground'>
                  A4 · {Math.round(scale * 100)}% zoom
                </span>
              </div>
              <div className='overflow-auto rounded-lg bg-muted/40 p-4 lg:max-h-[75vh]'>
                <div style={{ width: 794 * scale, height: 1123 * scale }}>
                  <InvoicePreview
                    invoice={demoInvoice}
                    template={active}
                    scale={scale}
                  />
                </div>
              </div>
              <p className='mt-2 text-center text-xs text-muted-foreground'>
                Sample data — real invoices use your customer details
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
