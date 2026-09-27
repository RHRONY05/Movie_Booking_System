import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { checkContrast } from '../utils/contrast';

export const AccessibilityDashboard = ({ activeRoles }) => {
  if (!activeRoles) return null;

  // The standardized test pairs per WCAG 2.1 AA specifications
  const testPairs = [
    {
      label: 'Primary Text on Canvas',
      category: 'Normal Text (AA ≥ 4.5)',
      textToken: 'textPrimary',
      textHex: activeRoles.textPrimary,
      bgToken: 'bgCanvas',
      bgHex: activeRoles.bgCanvas,
      required: 'aa'
    },
    {
      label: 'Primary Text on Card',
      category: 'Normal Text (AA ≥ 4.5)',
      textToken: 'textPrimary',
      textHex: activeRoles.textPrimary,
      bgToken: 'bgCard',
      bgHex: activeRoles.bgCard,
      required: 'aa'
    },
    {
      label: 'Primary Text on Surface',
      category: 'Normal Text (AA ≥ 4.5)',
      textToken: 'textPrimary',
      textHex: activeRoles.textPrimary,
      bgToken: 'bgSurface',
      bgHex: activeRoles.bgSurface,
      required: 'aa'
    },
    {
      label: 'Secondary Text on Canvas',
      category: 'Normal Text (AA ≥ 4.5)',
      textToken: 'textSecondary',
      textHex: activeRoles.textSecondary,
      bgToken: 'bgCanvas',
      bgHex: activeRoles.bgCanvas,
      required: 'aa'
    },
    {
      label: 'Secondary Text on Card',
      category: 'Normal Text (AA ≥ 4.5)',
      textToken: 'textSecondary',
      textHex: activeRoles.textSecondary,
      bgToken: 'bgCard',
      bgHex: activeRoles.bgCard,
      required: 'aa'
    },
    {
      label: 'Button Label on Button BG',
      category: 'Interactive Action (AA ≥ 4.5)',
      textToken: 'btnText',
      textHex: activeRoles.btnText,
      bgToken: 'btnPrimary',
      bgHex: activeRoles.btnPrimary,
      required: 'aa'
    },
    {
      label: 'Accent on Canvas',
      category: 'Large Text / Badges (AA Large ≥ 3.0)',
      textToken: 'accentPrimary',
      textHex: activeRoles.accentPrimary,
      bgToken: 'bgCanvas',
      bgHex: activeRoles.bgCanvas,
      required: 'aaLarge'
    },
    {
      label: 'Accent on Card',
      category: 'Large Text / Badges (AA Large ≥ 3.0)',
      textToken: 'accentPrimary',
      textHex: activeRoles.accentPrimary,
      bgToken: 'bgCard',
      bgHex: activeRoles.bgCard,
      required: 'aaLarge'
    }
  ];

  const results = testPairs.map(pair => {
    const contrast = checkContrast(pair.textHex, pair.bgHex);
    const passed = pair.required === 'aa' ? contrast.aa : contrast.aaLarge;
    return { ...pair, contrast, passed };
  });

  const totalPassed = results.filter(r => r.passed).length;
  const allPassed = totalPassed === results.length;

  return (
    <div style={{
      marginTop: '28px',
      padding: '24px',
      borderRadius: '16px',
      backgroundColor: activeRoles.bgCard,
      border: `1px solid ${activeRoles.borderSubtle}`,
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: allPassed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${allPassed ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: allPassed ? '#22c55e' : '#ef4444'
          }}>
            {allPassed ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
          </div>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              color: activeRoles.textPrimary
            }}>
              Panel 2: Accessibility & WCAG AA Contrast Dashboard
            </h3>
            <p style={{
              margin: '3px 0 0 0',
              fontSize: '13px',
              color: activeRoles.textSecondary
            }}>
              Mathematical verification using WCAG 2.1 relative luminance formulas. Normal text requires ≥ 4.5:1; UI components require ≥ 3.0:1.
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '999px',
          fontSize: '13px',
          fontWeight: 700,
          backgroundColor: allPassed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
          border: `1px solid ${allPassed ? 'rgba(34, 197, 94, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
          color: allPassed ? '#22c55e' : '#f59e0b'
        }}>
          {allPassed ? (
            <>
              <CheckCircle2 size={16} />
              <span>{totalPassed}/{results.length} Tests Passed (WCAG AA Compliant)</span>
            </>
          ) : (
            <>
              <AlertTriangle size={16} />
              <span>{totalPassed}/{results.length} Tests Passed (Review Warnings)</span>
            </>
          )}
        </div>
      </div>

      {/* Grid of Results */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '12px'
      }}>
        {results.map((item, idx) => (
          <div
            key={idx}
            style={{
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: activeRoles.bgSurface,
              border: `1px solid ${item.passed ? 'rgba(255,255,255,0.06)' : 'rgba(239, 68, 68, 0.4)'}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '10px'
            }}
          >
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '4px'
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: activeRoles.textPrimary }}>
                  {item.label}
                </span>
                {item.passed ? (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}>
                    PASS {item.contrast.aaa ? 'AAA' : 'AA'}
                  </span>
                ) : (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}>
                    FAIL
                  </span>
                )}
              </div>
              <div style={{ fontSize: '11px', color: activeRoles.textSecondary }}>
                {item.category}
              </div>
            </div>

            {/* Live Contrast Preview Box */}
            <div style={{
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: item.bgHex,
              color: item.textHex,
              border: `1px solid ${activeRoles.borderSubtle}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>
                Sample Preview
              </span>
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                opacity: 0.9,
                fontFamily: 'monospace'
              }}>
                {item.contrast.ratio}:1
              </span>
            </div>

            {/* Token details footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: activeRoles.textSecondary,
              fontFamily: 'monospace'
            }}>
              <span>{item.textToken}: {item.textHex}</span>
              <span>on</span>
              <span>{item.bgToken}: {item.bgHex}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
