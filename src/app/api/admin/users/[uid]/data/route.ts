import { adminDb, verifyAdminToken } from '@/lib/firebase-admin';
import { InvoiceData, LineItem, TemplateSettings } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

function toArray<T>(val: unknown): T[] {
  if (!val) return [];
  if (Array.isArray(val)) return val as T[];
  if (typeof val === 'object') return Object.values(val) as T[];
  return [];
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
    createdAt: data.createdAt
      ? new Date(data.createdAt as number).toISOString()
      : undefined,
    updatedAt: data.updatedAt
      ? new Date(data.updatedAt as number).toISOString()
      : undefined,
  };
}

function templateFromDb(
  key: string,
  data: Record<string, unknown>,
): TemplateSettings {
  return {
    _id: key,
    name: (data.name as string) ?? 'Default Template',
    companyName: (data.companyName as string) ?? '',
    tagline: (data.tagline as string) ?? '',
    address: (data.address as string) ?? '',
    phone: (data.phone as string) ?? '',
    email: (data.email as string) ?? '',
    primaryColor: (data.primaryColor as string) ?? '',
    accentColor: (data.accentColor as string) ?? '',
    logo: (data.logo as string | null) ?? null,
    footerText: (data.footerText as string) ?? '',
    showSignature: (data.showSignature as boolean) ?? true,
    currencySymbol: (data.currencySymbol as string) ?? '₹',
    parentBrand: (data.parentBrand as string) ?? '',
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

// Read-only admin view of a user's data. Uses Admin SDK credentials, which
// bypass Realtime Database security rules by design — access here is gated
// entirely by verifyAdminToken(), not by the rules that protect normal users.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uid } = await params;
  const snap = await adminDb.ref(`users/${uid}`).once('value');
  if (!snap.exists()) {
    return NextResponse.json({ invoices: [], templates: [] });
  }

  const val = snap.val() as Record<
    string,
    Record<string, Record<string, unknown>>
  >;

  const invoices = Object.entries(val.invoices ?? {})
    .map(([key, data]) => invoiceFromDb(key, data))
    .sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });

  const templates = Object.entries(val.templates ?? {}).map(([key, data]) =>
    templateFromDb(key, data),
  );

  return NextResponse.json({ invoices, templates });
}
