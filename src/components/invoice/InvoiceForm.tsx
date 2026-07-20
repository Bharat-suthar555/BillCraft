'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  EMPTY_LINE_ITEM,
  InvoiceData,
  LineItem,
  TemplateSettings,
} from '@/types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

interface Props {
  template: TemplateSettings;
  initialData?: Partial<InvoiceData>;
  onChange?: (data: Partial<InvoiceData>) => void;
  onSave?: (data: Partial<InvoiceData>) => void;
  saving?: boolean;
}

// Amount = Rate × sq.ft when the sq.ft column is shown; otherwise Rate × Size,
// so hiding sq.ft doesn't silently drop the quantity from the calculation.
function computeAmount(
  item: Pick<LineItem, 'rate' | 'sqft' | 'size'>,
  template: TemplateSettings,
): number {
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
    onChange?.({ ...values, lineItems: updatedItems, total });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values), template]);

  const onSubmit = (data: FormValues) => {
    const updatedItems = data.lineItems.map((item) => ({
      ...item,
      amount: computeAmount(item, template),
    }));
    const total = computeTotal(updatedItems);
    onSave?.({ ...data, lineItems: updatedItems, total });
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
        <h3 className='text-sm font-semibold text-foreground uppercase tracking-wide'>
          Customer Details
        </h3>
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

        <div className='overflow-x-auto -mx-1'>
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
                <th className='pb-2 text-left w-20'>
                  Rate ({template.currencySymbol})
                </th>
                <th className='pb-2 text-right w-20'>Amount</th>
                <th className='pb-2 w-8'></th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {fields.map((field, index) => {
                const amount = computeAmount(
                  values.lineItems[index] ?? { rate: '', sqft: '', size: '' },
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
                    <td className='py-1.5 pr-1 text-right font-medium'>
                      {amount > 0
                        ? amount.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                          })
                        : '—'}
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
