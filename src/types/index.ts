export interface TemplateSettings {
  _id?: string;
  name: string;
  companyName: string;
  parentBrand: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  primaryColor: string;
  accentColor: string;
  logo: string | null;
  footerText: string;
  showSignature: boolean;
  currencySymbol: string;
  showSize: boolean;
  showSqft: boolean;
  // When false, the company name renders as plain text instead of the
  // accent-colored badge box. Defaults to true (badge) when unset, so
  // existing templates keep their current look.
  nameBadge?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_TEMPLATE: Omit<TemplateSettings, '_id'> = {
  name: 'UltraTech Invoice',
  companyName: 'UltraTech',
  parentBrand: 'ADITYA BIRLA',
  tagline: 'Waterproofing & Solutions',
  address: 'Manpura Colony Jalore, Raj. 343001',
  phone: '',
  email: '',
  primaryColor: '#1a2d6b',
  accentColor: '#FFD700',
  logo: null,
  footerText: 'Thank You',
  showSignature: true,
  currencySymbol: '₹',
  showSize: true,
  showSqft: true,
  nameBadge: true,
};

export const MR_TEMPLATE: Omit<TemplateSettings, '_id'> = {
  name: 'MR Invoice',
  companyName: 'MR',
  parentBrand: '',
  tagline: 'Refrigeretion & Solutions',
  address: 'Manpura Colony Jalore, Raj. 343001',
  phone: '',
  email: '',
  primaryColor: '#1a2d6b',
  accentColor: '#FFD700',
  logo: '/logos/totaling-logo.png',
  footerText: 'Thank You',
  showSignature: true,
  currencySymbol: '₹',
  showSize: true,
  showSqft: true,
  nameBadge: false,
};

export interface LineItem {
  id: string;
  description: string;
  size: string;
  sqft: string;
  rate: string;
  amount: number;
}

export interface InvoiceData {
  _id?: string;
  templateId: string;
  billNo: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  lineItems: LineItem[];
  total: number;
  status: 'draft' | 'sent' | 'paid';
  notes: string;
  createdAt?: string;
  updatedAt?: string;
  template?: TemplateSettings;
}

export const EMPTY_LINE_ITEM = (): LineItem => ({
  id: Math.random().toString(36).slice(2),
  description: '',
  size: '',
  sqft: '',
  rate: '',
  amount: 0,
});
