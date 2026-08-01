import { InvoiceData, LineItem, TemplateSettings } from '@/types';
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

// Helvetica has no ₹ glyph — replace with Rs.
const safeCurr = (s: string) => s.replace(/₹|₹/g, 'Rs.');

// Target rows per page — also what padding fills an under-full table up to,
// so a light invoice still looks like a full page.
const ROWS_PER_PAGE = 10;

const s = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 24,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#000',
  },

  divider: { height: 1.5, backgroundColor: '#333', marginBottom: 8 },
  thinDivider: { height: 1, backgroundColor: '#333' },

  fieldRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 6 },
  fieldLabel: { fontFamily: 'Helvetica-Bold', fontSize: 11, width: 56 },
  fieldValue: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 1,
    fontSize: 11,
    minHeight: 14,
  },
  fieldValueShort: {
    width: 120,
    borderBottomWidth: 1.5,
    borderBottomColor: '#333',
    paddingBottom: 1,
    fontSize: 11,
    minHeight: 14,
  },

  tableWrap: { borderWidth: 1.5, borderColor: '#333' },
  tableHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: '#555',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bbb',
    minHeight: 34,
  },
  // fontSize 11 + letterSpacing 0.2 matches HTML Arial rendering more closely
  tableCell: {
    fontSize: 11,
    letterSpacing: 0.2,
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderRightWidth: 1,
    borderRightColor: '#999',
    textAlign: 'center',
    justifyContent: 'center',
  },
  // Column widths scaled to match HTML preview proportions (desc ≈ 47% of table)
  colSno: { width: 34 },
  colDesc: { flex: 1 },
  colSize: { width: 64 },
  colSqft: { width: 48 },
  colRate: { width: 58 },
  colAmt: { width: 80 },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 7,
    paddingTop: 5,
  },
  totalLabel: { fontFamily: 'Helvetica-Bold', fontSize: 12, marginRight: 14 },
  totalValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    width: 140,
    textAlign: 'right',
    borderBottomWidth: 1.5,
    borderBottomColor: '#333',
    paddingBottom: 2,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 18,
  },
  thankYou: {
    fontSize: 48,
    fontFamily: 'Helvetica-Bold',
    color: '#C8C8C8',
    lineHeight: 1,
  },
  sigLine: {
    borderTopWidth: 1,
    borderTopColor: '#444',
    paddingTop: 4,
    width: 180,
    textAlign: 'right',
    fontSize: 11,
  },
});

interface PageProps {
  invoice: Partial<InvoiceData>;
  template: TemplateSettings;
  pageItems: LineItem[];
  pageTotal: number;
  showFooter: boolean;
  pageLabel?: string;
}

function InvoicePage({
  invoice,
  template,
  pageItems,
  pageTotal,
  showFooter,
  pageLabel,
}: PageProps) {
  const emptyRows = Math.max(0, ROWS_PER_PAGE - pageItems.length);
  const curr = safeCurr(template.currencySymbol);
  const nav = template.primaryColor;
  const acc = template.accentColor;

  const dateStr = invoice.date
    ? new Date(invoice.date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      })
    : '__/__/__';

  return (
    <Page size='A4' style={s.page}>
      {/* ══ HEADER ═══════════════════════════════════════════════════════
          Right badge uses position:absolute so the left column can flow
          naturally without any flex row/column nesting issues.
      ════════════════════════════════════════════════════════════════════ */}
      <View style={{ marginBottom: 8 }}>
        {/* Left content — flows top to bottom naturally */}
        {/* paddingRight reserves space so text doesn't slide under badge */}
        <View style={{ paddingRight: 116 }}>
          {/* ── Line 1: INVOICE ── */}
          <Text
            style={{
              fontSize: 52,
              fontFamily: 'Helvetica-Bold',
              letterSpacing: -1,
              lineHeight: 1,
              color: nav,
              marginBottom: 8,
            }}
          >
            INVOICE
          </Text>

          {/* ── Line 2: company name (badge or plain)  Waterproofing & Solutions ── */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 6,
            }}
          >
            {template.nameBadge === false ? (
              <Text
                style={{
                  fontFamily: 'Helvetica-Bold',
                  fontSize: 18,
                  color: '#1a1a1a',
                  marginRight: 10,
                }}
              >
                {template.companyName}
              </Text>
            ) : (
              <View
                style={{
                  backgroundColor: acc,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  borderRadius: 3,
                  borderBottomWidth: 3,
                  borderBottomColor: nav,
                  marginRight: 10,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Helvetica-Bold',
                    fontSize: 18,
                    color: '#1a1a1a',
                  }}
                >
                  {template.companyName}
                </Text>
              </View>
            )}
            <Text
              style={{
                fontFamily: 'Helvetica-Bold',
                fontSize: 16,
                color: '#111',
              }}
            >
              {template.tagline}
            </Text>
          </View>

          {/* ── Line 3: Address ── */}
          <Text style={{ fontSize: 11, color: '#444' }}>
            {template.address}
            {template.phone ? `   |   ${template.phone}` : ''}
          </Text>
        </View>

        {/* Right badge — absolutely positioned, won't affect left flow */}
        <View
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: 100,
            minHeight: 90,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 3,
            padding: 6,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {template.logo ? (
            /* Logo uploaded — show ONLY the image, nothing else */
            <Image
              src={template.logo}
              style={{ width: 88, height: 88, objectFit: 'contain' }}
            />
          ) : (
            /* No logo — show parentBrand + geometric block + company name */
            <>
              {!!template.parentBrand && (
                <Text
                  style={{
                    fontSize: 7,
                    fontFamily: 'Helvetica-Bold',
                    color: '#7a5c0a',
                    letterSpacing: 1.5,
                    marginBottom: 3,
                  }}
                >
                  {template.parentBrand}
                </Text>
              )}
              <View
                style={{
                  width: 80,
                  height: 44,
                  backgroundColor: '#8B1A1A',
                  borderRadius: 2,
                  marginVertical: 3,
                }}
              />
            </>
          )}
        </View>
      </View>

      {/* ══ DIVIDER ════════════════════════════════════════════ */}
      <View style={s.divider} />

      {/* ══ CUSTOMER INFO ══════════════════════════════════════ */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <View style={{ flex: 1, marginRight: 16 }}>
          <View style={s.fieldRow}>
            <Text style={s.fieldLabel}>Name:</Text>
            <Text style={s.fieldValue}>{invoice.customerName ?? ''}</Text>
          </View>
          <View style={s.fieldRow}>
            <Text style={s.fieldLabel}>Phone:</Text>
            <Text style={[s.fieldValue, { flex: 0, width: 160 }]}>
              {invoice.customerPhone ?? ''}
            </Text>
          </View>
          <View style={s.fieldRow}>
            <Text style={s.fieldLabel}>Address:</Text>
            <Text style={s.fieldValue}>{invoice.customerAddress ?? ''}</Text>
          </View>
        </View>
        <View style={{ width: 210, alignItems: 'flex-end' }}>
          <View style={[s.fieldRow, { justifyContent: 'flex-end' }]}>
            <Text style={s.fieldLabel}>Bill No:</Text>
            <Text style={s.fieldValueShort}>{invoice.billNo ?? ''}</Text>
          </View>
          <View style={{ height: 22 }} />
          <View style={[s.fieldRow, { justifyContent: 'flex-end' }]}>
            <Text style={s.fieldLabel}>Date:</Text>
            <Text style={{ fontSize: 11 }}>{dateStr}</Text>
          </View>
          {pageLabel && (
            <Text style={{ fontSize: 9, color: '#888', marginTop: 2 }}>
              {pageLabel}
            </Text>
          )}
        </View>
      </View>

      <View style={s.thinDivider} />

      {/* ══ TABLE ══════════════════════════════════════════════ */}
      <View style={s.tableWrap}>
        <View
          fixed
          wrap={false}
          style={{
            flexDirection: 'row',
            borderBottomWidth: 2,
            borderBottomColor: '#333',
          }}
        >
          <Text style={[s.tableHeaderCell, s.colSno]}>S.No.</Text>
          <Text
            style={[
              s.tableHeaderCell,
              s.colDesc,
              { textAlign: 'left', paddingLeft: 10 },
            ]}
          >
            Description
          </Text>
          {template.showSize && (
            <Text style={[s.tableHeaderCell, s.colSize]}>Size</Text>
          )}
          {template.showSqft && (
            <Text style={[s.tableHeaderCell, s.colSqft]}>sq. ft</Text>
          )}
          {template.showRate !== false && (
            <Text style={[s.tableHeaderCell, s.colRate]}>Rate</Text>
          )}
          <Text style={[s.tableHeaderCell, s.colAmt, { borderRightWidth: 0 }]}>
            Amount
          </Text>
        </View>

        {pageItems.map((item, i) => (
          <View key={item.id} style={s.tableRow} wrap={false}>
            <Text style={[s.tableCell, s.colSno]}>{i + 1}</Text>
            <Text
              style={[
                s.tableCell,
                s.colDesc,
                { textAlign: 'left', paddingLeft: 10 },
              ]}
            >
              {item.description}
            </Text>
            {template.showSize && (
              <Text style={[s.tableCell, s.colSize]}>{item.size}</Text>
            )}
            {template.showSqft && (
              <Text style={[s.tableCell, s.colSqft]}>{item.sqft}</Text>
            )}
            {template.showRate !== false && (
              <Text
                style={[
                  s.tableCell,
                  s.colRate,
                  { textAlign: 'right', paddingRight: 8 },
                ]}
              >
                {item.rate}
              </Text>
            )}
            <Text
              style={[
                s.tableCell,
                s.colAmt,
                { textAlign: 'right', paddingRight: 8, borderRightWidth: 0 },
              ]}
            >
              {item.amount > 0 ? item.amount.toLocaleString('en-IN') : ''}
            </Text>
          </View>
        ))}

        {Array.from({ length: emptyRows }).map((_, i) => (
          <View
            key={`e${i}`}
            style={[s.tableRow, { minHeight: 34 }]}
            wrap={false}
          >
            <View style={[s.tableCell, s.colSno]}>
              <Text> </Text>
            </View>
            <View style={[s.tableCell, s.colDesc]}>
              <Text> </Text>
            </View>
            {template.showSize && (
              <View style={[s.tableCell, s.colSize]}>
                <Text> </Text>
              </View>
            )}
            {template.showSqft && (
              <View style={[s.tableCell, s.colSqft]}>
                <Text> </Text>
              </View>
            )}
            {template.showRate !== false && (
              <View style={[s.tableCell, s.colRate]}>
                <Text> </Text>
              </View>
            )}
            <View style={[s.tableCell, s.colAmt, { borderRightWidth: 0 }]}>
              <Text> </Text>
            </View>
          </View>
        ))}
      </View>

      {/* ══ TOTAL ══════════════════════════════════════════════ */}
      <View style={[s.totalRow, { borderTopWidth: 1, borderTopColor: nav }]}>
        <Text style={s.totalLabel}>TOTAL =</Text>
        <Text style={s.totalValue}>
          {pageTotal > 0
            ? `${curr} ${pageTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            : ''}
        </Text>
      </View>

      {/* ══ FOOTER ═════════════════════════════════════════════ */}
      {showFooter && (
        <>
          {invoice.checkedByArchitect && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: 14,
                paddingTop: 4,
              }}
            >
              <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold' }}>
                Checked By Architect
              </Text>
              <View style={{ alignItems: 'flex-end' }}>
                <View style={{ height: 36 }} />
                <Text style={[s.sigLine, { fontFamily: 'Helvetica-Bold' }]}>
                  Architect Signature
                </Text>
              </View>
            </View>
          )}
          <View style={s.footer}>
            <Text style={s.thankYou}>{template.footerText}</Text>
            {template.showSignature && (
              <Text style={s.sigLine}>Authorised Signature</Text>
            )}
          </View>
        </>
      )}
    </Page>
  );
}

interface Props {
  invoice: Partial<InvoiceData>;
  template: TemplateSettings;
}

export function InvoicePDFDocument({ invoice, template }: Props) {
  const items = invoice.lineItems ?? [];
  const splitMode = template.overflowMode === 'split';

  // 'continue' mode (default) — one flowing table; react-pdf reflows
  // naturally onto extra pages, repeating just the column-header row
  // (marked fixed above) and keeping a single grand total at the end.
  if (!splitMode || items.length <= ROWS_PER_PAGE) {
    return (
      <Document>
        <InvoicePage
          invoice={invoice}
          template={template}
          pageItems={items}
          pageTotal={invoice.total ?? 0}
          showFooter
        />
      </Document>
    );
  }

  // 'split' mode with more items than fit one page — each chunk becomes
  // its own self-contained invoice page: full header repeated, its own
  // page-only total, footer only on the last page.
  const chunks: LineItem[][] = [];
  for (let i = 0; i < items.length; i += ROWS_PER_PAGE) {
    chunks.push(items.slice(i, i + ROWS_PER_PAGE));
  }

  return (
    <Document>
      {chunks.map((pageItems, i) => (
        <InvoicePage
          key={i}
          invoice={invoice}
          template={template}
          pageItems={pageItems}
          pageTotal={pageItems.reduce((sum, it) => sum + (it.amount || 0), 0)}
          showFooter={i === chunks.length - 1}
          pageLabel={`Page ${i + 1} of ${chunks.length}`}
        />
      ))}
    </Document>
  );
}
