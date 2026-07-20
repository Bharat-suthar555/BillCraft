'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TemplateSettings } from '@/types';
import { Image as ImageIcon, Save } from 'lucide-react';
import { useRef, useState } from 'react';

interface Props {
  template: TemplateSettings;
  onChange: (updated: TemplateSettings) => void;
  onSave: () => void;
  saving?: boolean;
}

function ColorSwatch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className='space-y-1.5'>
      <Label className='text-xs'>{label}</Label>
      <div className='flex items-center gap-2'>
        <input
          type='color'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className='h-8 w-10 cursor-pointer rounded border border-gray-200 p-0.5'
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className='h-8 font-mono text-xs'
          maxLength={7}
        />
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className='flex items-center gap-2 cursor-pointer select-none'>
      <div
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : ''}`}
        />
      </div>
      <span className='text-sm'>{label}</span>
    </label>
  );
}

export function TemplateEditor({ template, onChange, onSave, saving }: Props) {
  const [logoPreview, setLogoPreview] = useState<string | null>(template.logo);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof TemplateSettings>(
    key: K,
    value: TemplateSettings[K],
  ) => {
    onChange({ ...template, [key]: value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result as string;
      setLogoPreview(data);
      set('logo', data);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview(null);
    set('logo', null);
  };

  return (
    <div className='space-y-6 text-sm'>
      {/* Template name */}
      <div className='space-y-1.5'>
        <Label>Template Name</Label>
        <Input
          value={template.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder='Default Template'
        />
      </div>

      {/* Company info */}
      <div className='space-y-3'>
        <h3 className='text-xs font-semibold uppercase tracking-widest text-gray-400'>
          Company Info
        </h3>
        <div className='space-y-1.5'>
          <Label>Company Name</Label>
          <Input
            value={template.companyName}
            onChange={(e) => set('companyName', e.target.value)}
            placeholder='UltraTech'
          />
        </div>
        <Toggle
          label='Show company name as a colored badge'
          checked={template.nameBadge ?? true}
          onChange={(v) => set('nameBadge', v)}
        />
        <div className='space-y-1.5'>
          <Label>Parent Brand / Group Name</Label>
          <Input
            value={template.parentBrand}
            onChange={(e) => set('parentBrand', e.target.value)}
            placeholder='ADITYA BIRLA'
          />
        </div>
        <div className='space-y-1.5'>
          <Label>Tagline / Sub-heading</Label>
          <Input
            value={template.tagline}
            onChange={(e) => set('tagline', e.target.value)}
            placeholder='Waterproofing & Solutions'
          />
        </div>
        <div className='space-y-1.5'>
          <Label>Address</Label>
          <Input
            value={template.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder='123 Main Street, City, State'
          />
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <div className='space-y-1.5'>
            <Label>Phone</Label>
            <Input
              value={template.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder='+91 00000 00000'
            />
          </div>
          <div className='space-y-1.5'>
            <Label>Email</Label>
            <Input
              value={template.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder='info@company.com'
            />
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className='space-y-2'>
        <h3 className='text-xs font-semibold uppercase tracking-widest text-gray-400'>
          Logo
        </h3>
        {logoPreview ? (
          <div className='flex items-center gap-3'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoPreview}
              alt='logo preview'
              className='h-12 w-auto rounded border border-gray-200 object-contain p-1'
            />
            <div className='flex flex-col gap-1'>
              <Button
                size='sm'
                variant='outline'
                onClick={() => fileRef.current?.click()}
              >
                Change
              </Button>
              <Button
                size='sm'
                variant='ghost'
                onClick={removeLogo}
                className='text-red-500'
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <button
            type='button'
            onClick={() => fileRef.current?.click()}
            className='flex h-16 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors'
          >
            <ImageIcon size={18} />
            <span className='text-sm'>Upload logo (PNG / JPG)</span>
          </button>
        )}
        <input
          ref={fileRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={handleLogoUpload}
        />
      </div>

      {/* Colors */}
      <div className='space-y-3'>
        <h3 className='text-xs font-semibold uppercase tracking-widest text-gray-400'>
          Colors
        </h3>
        <div className='grid grid-cols-2 gap-3'>
          <ColorSwatch
            label='Primary (header)'
            value={template.primaryColor}
            onChange={(v) => set('primaryColor', v)}
          />
          <ColorSwatch
            label='Accent (badge)'
            value={template.accentColor}
            onChange={(v) => set('accentColor', v)}
          />
        </div>
      </div>

      {/* Currency */}
      <div className='space-y-1.5'>
        <Label>Currency Symbol</Label>
        <Input
          value={template.currencySymbol}
          onChange={(e) => set('currencySymbol', e.target.value)}
          placeholder='₹'
          className='w-20'
          maxLength={3}
        />
      </div>

      {/* Columns */}
      <div className='space-y-3'>
        <h3 className='text-xs font-semibold uppercase tracking-widest text-gray-400'>
          Table Columns
        </h3>
        <Toggle
          label='Show Size column'
          checked={template.showSize}
          onChange={(v) => set('showSize', v)}
        />
        <Toggle
          label='Show sq.ft column'
          checked={template.showSqft}
          onChange={(v) => set('showSqft', v)}
        />
        <Toggle
          label='Show Rate column'
          checked={template.showRate ?? true}
          onChange={(v) => set('showRate', v)}
        />
        {template.showRate === false && (
          <p className='rounded-lg bg-blue-50 px-3 py-2 text-[11px] text-blue-700'>
            With Rate hidden, Amount becomes directly editable per item instead
            of being calculated.
          </p>
        )}
      </div>

      {/* Page overflow */}
      <div className='space-y-2'>
        <h3 className='text-xs font-semibold uppercase tracking-widest text-gray-400'>
          When Items Don&apos;t Fit One Page
        </h3>
        <div className='grid grid-cols-2 gap-2'>
          <button
            type='button'
            onClick={() => set('overflowMode', 'continue')}
            className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
              (template.overflowMode ?? 'continue') === 'continue'
                ? 'border-blue-500 bg-blue-500/10 text-blue-700'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            <div className='font-medium'>Continue on next page</div>
            <div className='mt-0.5 text-[11px] opacity-70'>
              One table, one total
            </div>
          </button>
          <button
            type='button'
            onClick={() => set('overflowMode', 'split')}
            className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
              template.overflowMode === 'split'
                ? 'border-blue-500 bg-blue-500/10 text-blue-700'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            <div className='font-medium'>Split into invoices</div>
            <div className='mt-0.5 text-[11px] opacity-70'>
              Each page is standalone
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className='space-y-3'>
        <h3 className='text-xs font-semibold uppercase tracking-widest text-gray-400'>
          Footer
        </h3>
        <div className='space-y-1.5'>
          <Label>Footer Text</Label>
          <Input
            value={template.footerText}
            onChange={(e) => set('footerText', e.target.value)}
            placeholder='Thank You'
          />
        </div>
        <Toggle
          label='Show Authorised Signature'
          checked={template.showSignature}
          onChange={(v) => set('showSignature', v)}
        />
      </div>

      <Button
        onClick={onSave}
        disabled={saving}
        className='w-full gap-2'
        style={{ backgroundColor: template.primaryColor }}
      >
        <Save size={14} />
        {saving ? 'Saving...' : 'Save Template'}
      </Button>
    </div>
  );
}
