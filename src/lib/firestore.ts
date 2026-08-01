import { get, push, ref, remove, set, update } from 'firebase/database';
import {
  DEFAULT_TEMPLATE,
  InvoiceData,
  LineItem,
  TemplateSettings,
} from '@/types';
import { db } from './firebase';

// ─── User scoping ─────────────────────────────────────────────────────────────

let _uid: string | null = null;

export function setCurrentUser(uid: string | null) {
  _uid = uid;
}

function userPath(path: string): string {
  if (!_uid) throw new Error('Not authenticated');
  return `users/${_uid}/${path}`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripMeta(obj: Record<string, unknown>): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, createdAt, updatedAt, template, ...rest } = obj;
  return rest;
}

// Firebase RTDB converts arrays to objects {0: ..., 1: ...} when stored.
// This converts them back to arrays when reading.
function toArray<T>(val: unknown): T[] {
  if (!val) return [];
  if (Array.isArray(val)) return val as T[];
  if (typeof val === 'object') return Object.values(val) as T[];
  return [];
}

function templateFromDb(
  key: string,
  data: Record<string, unknown>,
): TemplateSettings {
  return {
    _id: key,
    name: (data.name as string) ?? 'Default Template',
    companyName: (data.companyName as string) ?? DEFAULT_TEMPLATE.companyName,
    tagline: (data.tagline as string) ?? DEFAULT_TEMPLATE.tagline,
    address: (data.address as string) ?? '',
    phone: (data.phone as string) ?? '',
    email: (data.email as string) ?? '',
    primaryColor:
      (data.primaryColor as string) ?? DEFAULT_TEMPLATE.primaryColor,
    accentColor: (data.accentColor as string) ?? DEFAULT_TEMPLATE.accentColor,
    logo: (data.logo as string | null) ?? null,
    footerText: (data.footerText as string) ?? 'Thank You',
    showSignature: (data.showSignature as boolean) ?? true,
    currencySymbol: (data.currencySymbol as string) ?? '₹',
    parentBrand: (data.parentBrand as string) ?? 'ADITYA BIRLA',
    showSize: (data.showSize as boolean) ?? true,
    showSqft: (data.showSqft as boolean) ?? true,
    nameBadge: (data.nameBadge as boolean) ?? true,
    showRate: (data.showRate as boolean) ?? true,
    overflowMode:
      (data.overflowMode as TemplateSettings['overflowMode']) ?? 'continue',
    createdAt: data.createdAt
      ? new Date(data.createdAt as number).toISOString()
      : undefined,
    updatedAt: data.updatedAt
      ? new Date(data.updatedAt as number).toISOString()
      : undefined,
  };
}

function invoiceFromDb(
  key: string,
  data: Record<string, unknown>,
): InvoiceData {
  return {
    _id: key,
    templateId: (data.templateId as string) ?? '',
    billNo: (data.billNo as string) ?? '',
    date: (data.date as string) ?? '',
    customerName: (data.customerName as string) ?? '',
    customerPhone: (data.customerPhone as string) ?? '',
    customerAddress: (data.customerAddress as string) ?? '',
    lineItems: toArray<LineItem>(data.lineItems),
    total: (data.total as number) ?? 0,
    status: (data.status as InvoiceData['status']) ?? 'draft',
    notes: (data.notes as string) ?? '',
    checkedByArchitect: (data.checkedByArchitect as boolean) ?? false,
    createdAt: data.createdAt
      ? new Date(data.createdAt as number).toISOString()
      : undefined,
    updatedAt: data.updatedAt
      ? new Date(data.updatedAt as number).toISOString()
      : undefined,
  };
}

// ─── Templates ────────────────────────────────────────────────────────────────

export async function getTemplates(): Promise<TemplateSettings[]> {
  const snap = await get(ref(db, userPath('templates')));

  if (!snap.exists()) {
    // Seed a default template on first run
    const newRef = push(ref(db, userPath('templates')));
    await set(newRef, {
      ...DEFAULT_TEMPLATE,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    const newSnap = await get(newRef);
    return [
      templateFromDb(newRef.key!, newSnap.val() as Record<string, unknown>),
    ];
  }

  const val = snap.val() as Record<string, Record<string, unknown>>;
  return Object.entries(val)
    .map(([key, data]) => templateFromDb(key, data))
    .sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
}

export async function getTemplate(
  id: string,
): Promise<TemplateSettings | null> {
  const snap = await get(ref(db, userPath(`templates/${id}`)));
  if (!snap.exists()) return null;
  return templateFromDb(id, snap.val() as Record<string, unknown>);
}

export async function createTemplate(
  data: Omit<TemplateSettings, '_id' | 'createdAt' | 'updatedAt'>,
): Promise<TemplateSettings> {
  const newRef = push(ref(db, userPath('templates')));
  const clean = stripMeta(data as unknown as Record<string, unknown>);
  await set(newRef, { ...clean, createdAt: Date.now(), updatedAt: Date.now() });
  const snap = await get(newRef);
  return templateFromDb(newRef.key!, snap.val() as Record<string, unknown>);
}

export async function updateTemplate(
  id: string,
  data: Partial<TemplateSettings>,
): Promise<void> {
  const clean = stripMeta(data as unknown as Record<string, unknown>);
  await update(ref(db, userPath(`templates/${id}`)), {
    ...clean,
    updatedAt: Date.now(),
  });
}

export async function deleteTemplate(id: string): Promise<void> {
  await remove(ref(db, userPath(`templates/${id}`)));
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export async function getInvoices(): Promise<InvoiceData[]> {
  const snap = await get(ref(db, userPath('invoices')));
  if (!snap.exists()) return [];
  const val = snap.val() as Record<string, Record<string, unknown>>;
  return Object.entries(val)
    .map(([key, data]) => invoiceFromDb(key, data))
    .sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
}

export async function getInvoice(
  id: string,
): Promise<(InvoiceData & { template: TemplateSettings }) | null> {
  const snap = await get(ref(db, userPath(`invoices/${id}`)));
  if (!snap.exists()) return null;
  const invoice = invoiceFromDb(id, snap.val() as Record<string, unknown>);

  let template: TemplateSettings | null = null;
  if (invoice.templateId) template = await getTemplate(invoice.templateId);
  if (!template) {
    const list = await getTemplates();
    template = list[0] ?? ({ ...DEFAULT_TEMPLATE } as TemplateSettings);
  }

  return { ...invoice, template };
}

export async function createInvoice(
  data: Omit<InvoiceData, '_id' | 'createdAt' | 'updatedAt'>,
): Promise<InvoiceData> {
  const newRef = push(ref(db, userPath('invoices')));
  const clean = stripMeta(data as unknown as Record<string, unknown>);
  await set(newRef, { ...clean, createdAt: Date.now(), updatedAt: Date.now() });
  const snap = await get(newRef);
  return invoiceFromDb(newRef.key!, snap.val() as Record<string, unknown>);
}

export async function updateInvoice(
  id: string,
  data: Partial<InvoiceData>,
): Promise<void> {
  const clean = stripMeta(data as unknown as Record<string, unknown>);
  await update(ref(db, userPath(`invoices/${id}`)), {
    ...clean,
    updatedAt: Date.now(),
  });
}

export async function deleteInvoice(id: string): Promise<void> {
  await remove(ref(db, userPath(`invoices/${id}`)));
}

// ─── User Preferences ─────────────────────────────────────────────────────────

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  currency: string;
}

const DEFAULT_PREFS: UserPreferences = { theme: 'system', currency: '₹' };

export async function getPreferences(): Promise<UserPreferences> {
  const snap = await get(ref(db, userPath('preferences')));
  if (!snap.exists()) return { ...DEFAULT_PREFS };
  const val = snap.val() as Record<string, unknown>;
  return {
    theme: (val.theme as UserPreferences['theme']) ?? DEFAULT_PREFS.theme,
    currency: (val.currency as string) ?? DEFAULT_PREFS.currency,
  };
}

export async function savePreferences(
  prefs: Partial<UserPreferences>,
): Promise<void> {
  await update(ref(db, userPath('preferences')), prefs);
}
