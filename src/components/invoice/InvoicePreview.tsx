'use client';

import { InvoiceData, TemplateSettings } from '@/types';
import React from 'react';

interface Props {
  invoice: Partial<InvoiceData>;
  template: TemplateSettings;
  scale?: number;
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const th = (width?: number | string): React.CSSProperties => ({
  width: width,
  padding: '7px 5px',
  fontWeight: 700,
  fontSize: 12,
  textAlign: 'center',
  borderRight: '1px solid #555',
  borderBottom: '2px solid #333',
  backgroundColor: '#fff',
});

const td = (
  width?: number | string,
  align: React.CSSProperties['textAlign'] = 'center',
  pl = 5,
  pr = 5,
): React.CSSProperties => ({
  width,
  height: 38,
  padding: `3px ${pr}px 3px ${pl}px`,
  textAlign: align,
  borderRight: '1px solid #999',
  verticalAlign: 'middle',
  fontSize: 11,
});

// ─── Component ────────────────────────────────────────────────────────────────

export function InvoicePreview({ invoice, template, scale = 1 }: Props) {
  const items = invoice.lineItems ?? [];
  const emptyRows = Math.max(0, 10 - items.length);
  const nav = template.primaryColor; // dark navy
  const acc = template.accentColor; // yellow

  const dateStr = invoice.date
    ? new Date(invoice.date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      })
    : '__/__/__';

  return (
    <div
      style={{
        width: 794,
        minHeight: 1123,
        backgroundColor: '#fff',
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 12,
        color: '#000',
        boxShadow: '0 4px 28px rgba(0,0,0,0.18)',
      }}
    >
      {/* ══ HEADER ══════════════════════════════════════════════════════ */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '20px 32px 10px',
        }}
      >
        {/* Left — INVOICE (stacked above brand row) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Row 1: INVOICE */}
          <div
            style={{
              color: nav,
              fontSize: 62,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: -2,
              fontFamily: '"Arial Black", Arial, sans-serif',
            }}
          >
            INVOICE
          </div>

          {/* Row 2: company name (badge or plain) + Waterproofing & Solutions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {template.nameBadge === false ? (
              <span
                style={{
                  color: '#1a1a1a',
                  fontWeight: 900,
                  fontSize: 20,
                  fontFamily: '"Arial Black", Arial, sans-serif',
                  letterSpacing: 0.5,
                }}
              >
                {template.companyName}
              </span>
            ) : (
              /* Yellow badge with underline */
              <div
                style={{
                  backgroundColor: acc,
                  padding: '3px 12px',
                  borderRadius: 3,
                  borderBottom: `3px solid ${nav}`,
                }}
              >
                <span
                  style={{
                    color: '#1a1a1a',
                    fontWeight: 900,
                    fontStyle: 'italic',
                    fontSize: 20,
                    fontFamily: '"Arial Black", Arial, sans-serif',
                    letterSpacing: 0.5,
                  }}
                >
                  {template.companyName}
                </span>
              </div>
            )}
            {/* Tagline */}
            <span
              style={{
                color: '#111',
                fontWeight: 700,
                fontSize: 18,
                fontFamily: 'Arial, sans-serif',
              }}
            >
              {template.tagline}
            </span>
          </div>

          {/* Row 3: Address */}
          <div style={{ color: '#333', fontSize: 11.5, marginLeft: 2 }}>
            {template.address}
            {template.phone ? `   •   ${template.phone}` : ''}
          </div>
        </div>

        {/* Right — brand badge */}
        {template.logo ? (
          /* ── Logo uploaded: show ONLY the logo ── */
          <div
            style={{
              border: '1px solid #ccc',
              borderRadius: 3,
              padding: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 90,
              minHeight: 90,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={template.logo}
              alt='logo'
              style={{ maxHeight: 90, maxWidth: 90, objectFit: 'contain' }}
            />
          </div>
        ) : (
          /* ── No logo: show parentBrand + geometric + company name ── */
          <div
            style={{
              border: '1px solid #ccc',
              borderRadius: 3,
              padding: '6px 8px',
              textAlign: 'center',
              minWidth: 90,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
          >
            {template.parentBrand && (
              <div
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: '#7a5c0a',
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                }}
              >
                {template.parentBrand}
              </div>
            )}
            <div
              style={{
                width: 72,
                height: 44,
                background:
                  'linear-gradient(135deg, #8B1A1A 0%, #B22222 20%, #CD853F 40%, #D2691E 60%, #8B4513 80%, #A0522D 100%)',
                borderRadius: 2,
              }}
            />
          </div>
        )}
      </div>

      {/* ══ DIVIDER ══════════════════════════════════════════════════════ */}
      <div style={{ borderTop: '1.5px solid #333', margin: '0 32px' }} />

      {/* ══ CUSTOMER INFO ════════════════════════════════════════════════ */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '10px 32px 10px',
          gap: 16,
        }}
      >
        {/* Left: Name / Phone / Address */}
        <div
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            <span
              style={{ fontWeight: 600, whiteSpace: 'nowrap', minWidth: 58 }}
            >
              Name:
            </span>
            <span
              style={{
                flex: 1,
                borderBottom: '1px solid #333',
                paddingBottom: 1,
                minHeight: 16,
              }}
            >
              {invoice.customerName ?? ''}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            <span
              style={{ fontWeight: 600, whiteSpace: 'nowrap', minWidth: 58 }}
            >
              Phone:
            </span>
            <span
              style={{
                minWidth: 160,
                borderBottom: '1px solid #333',
                paddingBottom: 1,
                minHeight: 16,
              }}
            >
              {invoice.customerPhone ?? ''}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            <span
              style={{ fontWeight: 600, whiteSpace: 'nowrap', minWidth: 58 }}
            >
              Address:
            </span>
            <span
              style={{
                flex: 1,
                borderBottom: '1px solid #333',
                paddingBottom: 1,
                minHeight: 16,
              }}
            >
              {invoice.customerAddress ?? ''}
            </span>
          </div>
        </div>

        {/* Right: Bill No / Date */}
        <div
          style={{
            minWidth: 210,
            display: 'flex',
            flexDirection: 'column',
            gap: 7,
            alignItems: 'flex-end',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
              Bill No:
            </span>
            <span
              style={{
                minWidth: 110,
                borderBottom: '1.5px solid #333',
                paddingBottom: 1,
                textAlign: 'left',
                minHeight: 16,
              }}
            >
              {invoice.billNo ?? ''}
            </span>
          </div>
          {/* Spacer to align Date with Address row */}
          <div style={{ height: 22 }} />
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Date:</span>
            <span style={{ minHeight: 16 }}>{dateStr}</span>
          </div>
        </div>
      </div>

      {/* ══ TABLE ═════════════════════════════════════════════════════════ */}
      <div style={{ padding: '0 32px' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1.5px solid #333',
          }}
        >
          <thead>
            <tr>
              <th style={th(46)}>S.No.</th>
              <th
                style={{
                  ...th(),
                  textAlign: 'left',
                  paddingLeft: 10,
                  borderRight: '1px solid #555',
                }}
              >
                Description
              </th>
              {template.showSize && <th style={th(88)}>Size</th>}
              {template.showSqft && <th style={th(66)}>sq. ft</th>}
              {template.showRate !== false && <th style={th(80)}>Rate</th>}
              <th style={{ ...th(110), borderRight: 'none' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #bbb' }}>
                <td style={td(46)}>{i + 1}</td>
                <td style={td(undefined, 'left', 10)}>{item.description}</td>
                {template.showSize && <td style={td(88)}>{item.size}</td>}
                {template.showSqft && <td style={td(66)}>{item.sqft}</td>}
                {template.showRate !== false && (
                  <td style={td(80, 'right', 4, 8)}>{item.rate}</td>
                )}
                <td style={{ ...td(110, 'right', 4, 8), borderRight: 'none' }}>
                  {item.amount > 0 ? item.amount.toLocaleString('en-IN') : ''}
                </td>
              </tr>
            ))}
            {Array.from({ length: emptyRows }).map((_, i) => (
              <tr
                key={`e${i}`}
                style={{ height: 38, borderBottom: '1px solid #bbb' }}
              >
                <td style={{ borderRight: '1px solid #999', height: 38 }} />
                <td style={{ borderRight: '1px solid #999' }} />
                {template.showSize && (
                  <td style={{ borderRight: '1px solid #999' }} />
                )}
                {template.showSqft && (
                  <td style={{ borderRight: '1px solid #999' }} />
                )}
                {template.showRate !== false && (
                  <td style={{ borderRight: '1px solid #999' }} />
                )}
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ══ TOTAL ══════════════════════════════════════════════════════════ */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '8px 32px 4px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            borderTop: '1px solid #333',
            paddingTop: 5,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 13 }}>TOTAL =</span>
          <span
            style={{
              borderBottom: '1.5px solid #333',
              minWidth: 130,
              textAlign: 'right',
              fontSize: 13,
              fontWeight: 600,
              paddingBottom: 2,
            }}
          >
            {(invoice.total ?? 0) > 0
              ? `${template.currencySymbol} ${invoice.total!.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
              : ''}
          </span>
        </div>
      </div>

      {/* ══ CHECKED BY ARCHITECT ══════════════════════════════════════════ */}
      {invoice.checkedByArchitect && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            padding: '10px 32px 0',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 12 }}>
            Checked By Architect
          </span>
          <div style={{ textAlign: 'right', fontSize: 11 }}>
            {/* Signing space */}
            <div style={{ height: 48 }} />
            <div
              style={{
                borderTop: '1px solid #444',
                paddingTop: 5,
                minWidth: 180,
                color: '#222',
                fontWeight: 700,
              }}
            >
              Architect Signature
            </div>
          </div>
        </div>
      )}

      {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          padding: '18px 32px 28px',
        }}
      >
        {/* Thank You */}
        <div
          style={{
            color: '#C8C8C8',
            fontSize: 58,
            fontWeight: 900,
            fontFamily: '"Arial Black", Arial, sans-serif',
            lineHeight: 1,
            letterSpacing: -1,
          }}
        >
          {template.footerText}
        </div>

        {/* Authorised Signature */}
        {template.showSignature && (
          <div style={{ textAlign: 'right', fontSize: 11 }}>
            <div
              style={{
                borderTop: '1px solid #444',
                paddingTop: 5,
                minWidth: 180,
                color: '#222',
              }}
            >
              Authorised Signature
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
