'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getInvoices } from '@/lib/firestore';
import {
  EMPTY_LINE_ITEM,
  InvoiceData,
  LineItem,
  TemplateSettings,
} from '@/types';
import {
  Check,
  ChevronDown,
  PlusCircle,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

interface SavedCustomer {
  name: string;
  phone: string;
  address: string;
  lastUsed: number;
}

interface Props {
  template: TemplateSettings;
  initialData?: Partial<InvoiceData>;
  onChange?: (data: Partial<InvoiceData>) => void;
  onSave?: (data: Partial<InvoiceData>) => void;
  saving?: boolean;
}

function computeAmount(
  item: Pick<LineItem, 'rate' | 'sqft' | 'size' | 'amount'>,
  template: TemplateSettings,
): number {
  if (template.showRate === false) return item.amount || 0;
  const rate = parseFloat(item.rate) || 0;
  const qty = template.showSqft
    ? parseFloat(item.sqft) || 0
    : parseFloat(item.size) || 0;
  return rate * qty;
}

type FormValues = {
  billNo: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes: string;
  lineItems: LineItem[];
};

export function InvoiceForm({
  template,
  initialData,
  onChange,
  onSave,
  saving,
}: Props) {
  const { register, control, watch, handleSubmit, setValue } =
    useForm<FormValues>({
      defaultValues: {
        billNo: initialData?.billNo ?? '',
        date: initialData?.date ?? new Date().toISOString().split('T')[0],
        customerName: initialData?.customerName ?? '',
        customerPhone: initialData?.customerPhone ?? '',
        customerAddress: initialData?.customerAddress ?? '',
        notes: initialData?.notes ?? '',
        lineItems: initialData?.lineItems?.length
          ? initialData.lineItems
          : [EMPTY_LINE_ITEM()],
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lineItems',
  });

  const values = watch();
  const [checkedByArchitect, setCheckedByArchitect] = useState(
    initialData?.checkedByArchitect ?? false,
  );

  useEffect(() => {
    setCheckedByArchitect(initialData?.checkedByArchitect ?? false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.checkedByArchitect]);

  // ── Existing customers, derived from past invoices ──────────────────
  const [customers, setCustomers] = useState<SavedCustomer[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getInvoices()
      .then((invoices) => {
        const byKey = new Map<string, SavedCustomer>();
        for (const inv of invoices) {
          const name = inv.customerName?.trim();
          if (!name) continue;
          const key = (inv.customerPhone?.trim() || name).toLowerCase();
          const lastUsed = inv.createdAt
            ? new Date(inv.createdAt).getTime()
            : 0;
          const existing = byKey.get(key);
          if (!existing || lastUsed > existing.lastUsed) {
            byKey.set(key, {
              name,
              phone: inv.customerPhone ?? '',
              address: inv.customerAddress ?? '',
              lastUsed,
            });
          }
        }
        setCustomers(
          Array.from(byKey.values()).sort((a, b) => b.lastUsed - a.lastUsed),
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!pickerOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) setPickerOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [pickerOpen]);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q),
    );
  }, [customers, customerSearch]);

  const selectCustomer = (c: SavedCustomer) => {
    setValue('customerName', c.name, { shouldDirty: true });
    setValue('customerPhone', c.phone, { shouldDirty: true });
    setValue('customerAddress', c.address, { shouldDirty: true });
    setPickerOpen(false);
    setCustomerSearch('');
  };

  const computeTotal = useCallback(
    (items: LineItem[]) => {
      return items.reduce(
        (sum, item) => sum + computeAmount(item, template),
        0,
      );
    },
    [template],
  );

  useEffect(() => {
    const updatedItems = values.lineItems.map((item) => ({
      ...item,
      amount: computeAmount(item, template),
    }));
    const total = computeTotal(updatedItems);
    onChange?.({
      ...values,
      lineItems: updatedItems,
      total,
      checkedByArchitect,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values), template, checkedByArchitect]);

  const onSubmit = (data: FormValues) => {
    const updatedItems = data.lineItems.map((item) => ({
      ...item,
      amount: computeAmount(item, template),
    }));
    const total = computeTotal(updatedItems);
    onSave?.({ ...data, lineItems: updatedItems, total, checkedByArchitect });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      {/* Bill details */}
      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1.5 min-w-0'>
          <Label htmlFor='billNo'>Bill No</Label>
          <Input id='billNo' placeholder='INV-001' {...register('billNo')} />
        </div>
        <div className='space-y-1.5 min-w-0'>
          <Label htmlFor='date'>Date</Label>
          <Input id='date' type='date' {...register('date')} />
        </div>
      </div>

      {/* Customer details */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between gap-2'>
          <h3 className='text-sm font-semibold text-foreground uppercase tracking-wide'>
            Customer Details
          </h3>
          {customers.length > 0 && (
            <div ref={pickerRef} className='relative'>
              <button
                type='button'
                onClick={() => setPickerOpen((o) => !o)}
                className='inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium normal-case tracking-normal text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
              >
                <Users size={12} />
                Select existing
                <ChevronDown size={12} />
              </button>
              {pickerOpen && (
                <div className='animate-pop-in absolute right-0 z-20 mt-1 w-72 max-w-[80vw] rounded-lg border border-border bg-card shadow-lg'>
                  <div className='relative border-b border-border p-2'>
                    <Search
                      size={12}
                      className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground'
                    />
                    <input
                      autoFocus
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder='Search customers…'
                      className='w-full rounded-md border border-input bg-background py-1.5 pl-7 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring'
                    />
                  </div>
                  <div className='max-h-56 overflow-y-auto py-1'>
                    {filteredCustomers.length === 0 ? (
                      <p className='px-3 py-4 text-center text-xs text-muted-foreground'>
                        No matches
                      </p>
                    ) : (
                      filteredCustomers.map((c) => {
                        const isCurrent =
                          values.customerName === c.name &&
                          values.customerPhone === c.phone;
                        return (
                          <button
                            type='button'
                            key={`${c.phone}|${c.name}`}
                            onClick={() => selectCustomer(c)}
                            className='flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-accent'
                          >
                            <div className='min-w-0'>
                              <div className='truncate text-xs font-medium text-foreground'>
                                {c.name}
                              </div>
                              <div className='truncate text-[11px] text-muted-foreground'>
                                {c.phone || 'No phone'}
                                {c.address && ` · ${c.address}`}
                              </div>
                            </div>
                            {isCurrent && (
                              <Check
                                size={13}
                                className='shrink-0 text-blue-500'
                              />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className='space-y-1.5'>
          <Label htmlFor='customerName'>Customer Name</Label>
          <Input
            id='customerName'
            placeholder='John Doe'
            {...register('customerName')}
          />
        </div>
        <div className='space-y-1.5'>
          <Label htmlFor='customerPhone'>Phone</Label>
          <Input
            id='customerPhone'
            placeholder='+91 98765 43210'
            {...register('customerPhone')}
          />
        </div>
        <div className='space-y-1.5'>
          <Label htmlFor='customerAddress'>Address</Label>
          <Textarea
            id='customerAddress'
            placeholder='123 Main St, City, State'
            rows={2}
            {...register('customerAddress')}
          />
        </div>
      </div>

      {/* Line items */}
      <div className='space-y-3'>
        <h3 className='text-sm font-semibold text-foreground uppercase tracking-wide'>
          Line Items
        </h3>

        {/* Mobile: stacked cards — avoids sideways scrolling mid-entry */}
        <div className='space-y-3 sm:hidden'>
          {fields.map((field, index) => {
            const amount = computeAmount(
              values.lineItems[index] ?? {
                rate: '',
                sqft: '',
                size: '',
                amount: 0,
              },
              template,
            );
            return (
              <div
                key={field.id}
                className='space-y-2.5 rounded-xl border border-border p-3'
              >
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-medium text-muted-foreground'>
                    Item {index + 1}
                  </span>
                  <button
                    type='button'
                    onClick={() => remove(index)}
                    className='p-1 text-muted-foreground/40 hover:text-red-400 transition-colors disabled:opacity-30'
                    disabled={fields.length === 1}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <Input
                  placeholder='Description of work'
                  className='h-9'
                  {...register(`lineItems.${index}.description`)}
                />
                <div className='grid grid-cols-2 gap-2'>
                  {template.showSize && (
                    <div className='space-y-1'>
                      <Label className='text-[10px] text-muted-foreground'>
                        Size
                      </Label>
                      <Input
                        placeholder='10×10'
                        className='h-9'
                        {...register(`lineItems.${index}.size`)}
                      />
                    </div>
                  )}
                  {template.showSqft && (
                    <div className='space-y-1'>
                      <Label className='text-[10px] text-muted-foreground'>
                        sq.ft
                      </Label>
                      <Input
                        type='number'
                        min='0'
                        placeholder='100'
                        className='h-9'
                        {...register(`lineItems.${index}.sqft`)}
                      />
                    </div>
                  )}
                  {template.showRate !== false && (
                    <div className='space-y-1'>
                      <Label className='text-[10px] text-muted-foreground'>
                        Rate ({template.currencySymbol})
                      </Label>
                      <Input
                        type='number'
                        min='0'
                        step='0.01'
                        placeholder='0.00'
                        className='h-9'
                        {...register(`lineItems.${index}.rate`)}
                      />
                    </div>
                  )}
                  <div className='space-y-1'>
                    <Label className='text-[10px] text-muted-foreground'>
                      Amount
                    </Label>
                    {template.showRate === false ? (
                      <Input
                        type='number'
                        min='0'
                        step='0.01'
                        placeholder='0.00'
                        className='h-9 text-right'
                        {...register(`lineItems.${index}.amount`, {
                          valueAsNumber: true,
                        })}
                      />
                    ) : (
                      <div className='flex h-9 items-center justify-end rounded-md border border-input bg-muted/40 px-3 text-sm font-medium'>
                        {amount > 0
                          ? amount.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                            })
                          : '—'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: table */}
        <div className='hidden overflow-x-auto -mx-1 sm:block'>
          <table className='w-full text-sm min-w-125'>
            <thead>
              <tr className='text-xs font-medium text-muted-foreground uppercase'>
                <th className='pb-2 pl-1 text-left w-8'>#</th>
                <th className='pb-2 text-left'>Description</th>
                {template.showSize && (
                  <th className='pb-2 text-left w-20'>Size</th>
                )}
                {template.showSqft && (
                  <th className='pb-2 text-left w-16'>sq.ft</th>
                )}
                {template.showRate !== false && (
                  <th className='pb-2 text-left w-20'>
                    Rate ({template.currencySymbol})
                  </th>
                )}
                <th className='pb-2 text-right w-20'>Amount</th>
                <th className='pb-2 w-8'></th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {fields.map((field, index) => {
                const amount = computeAmount(
                  values.lineItems[index] ?? {
                    rate: '',
                    sqft: '',
                    size: '',
                    amount: 0,
                  },
                  template,
                );
                return (
                  <tr key={field.id}>
                    <td className='py-1.5 pl-1 text-muted-foreground'>
                      {index + 1}
                    </td>
                    <td className='py-1.5 pr-1'>
                      <Input
                        placeholder='Description of work'
                        className='h-8'
                        {...register(`lineItems.${index}.description`)}
                      />
                    </td>
                    {template.showSize && (
                      <td className='py-1.5 pr-1'>
                        <Input
                          placeholder='10×10'
                          className='h-8'
                          {...register(`lineItems.${index}.size`)}
                        />
                      </td>
                    )}
                    {template.showSqft && (
                      <td className='py-1.5 pr-1'>
                        <Input
                          type='number'
                          min='0'
                          placeholder='100'
                          className='h-8'
                          {...register(`lineItems.${index}.sqft`)}
                        />
                      </td>
                    )}
                    {template.showRate !== false && (
                      <td className='py-1.5 pr-1'>
                        <Input
                          type='number'
                          min='0'
                          step='0.01'
                          placeholder='0.00'
                          className='h-8'
                          {...register(`lineItems.${index}.rate`)}
                        />
                      </td>
                    )}
                    <td className='py-1.5 pr-1 text-right font-medium'>
                      {template.showRate === false ? (
                        <Input
                          type='number'
                          min='0'
                          step='0.01'
                          placeholder='0.00'
                          className='h-8 text-right'
                          {...register(`lineItems.${index}.amount`, {
                            valueAsNumber: true,
                          })}
                        />
                      ) : amount > 0 ? (
                        amount.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                        })
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className='py-1.5'>
                      <button
                        type='button'
                        onClick={() => remove(index)}
                        className='text-muted-foreground/40 hover:text-red-400 transition-colors disabled:opacity-30'
                        disabled={fields.length === 1}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => append(EMPTY_LINE_ITEM())}
          className='gap-1.5'
        >
          <PlusCircle size={14} />
          Add Item
        </Button>

        {/* Total */}
        <div className='flex justify-end pt-2'>
          <div className='flex items-center gap-3 font-semibold text-base'>
            <span className='text-muted-foreground'>Total:</span>
            <span style={{ color: template.primaryColor }}>
              {template.currencySymbol}{' '}
              {computeTotal(values.lineItems).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className='space-y-1.5'>
        <Label htmlFor='notes'>Notes (optional)</Label>
        <Textarea
          id='notes'
          placeholder='Any additional notes...'
          rows={2}
          {...register('notes')}
        />
      </div>

      {/* Architect check */}
      <div className='flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5'>
        <input
          id='checkedByArchitect'
          type='checkbox'
          checked={checkedByArchitect}
          onChange={(e) => setCheckedByArchitect(e.target.checked)}
          className='h-4 w-4 rounded border-border accent-current cursor-pointer'
          style={{ accentColor: template.primaryColor }}
        />
        <Label
          htmlFor='checkedByArchitect'
          className='cursor-pointer select-none text-sm font-medium'
        >
          Checked By Architect
        </Label>
      </div>

      <Button
        type='submit'
        disabled={saving}
        className='w-full'
        style={{ backgroundColor: template.primaryColor }}
      >
        {saving ? 'Saving...' : 'Save Invoice'}
      </Button>
    </form>
  );
}
