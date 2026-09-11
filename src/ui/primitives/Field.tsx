'use client';
import * as React from 'react';
export interface FieldProps { id: string; label: string; helper?: string; error?: string; children: React.ReactNode }
/** Core/Field: label + control + helper/error wired with aria-describedby / aria-invalid (DOC-04). */
export function Field({ id, label, helper, error, children }: FieldProps) {
  const descId = error ? id + '-err' : helper ? id + '-help' : undefined;
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <label htmlFor={id} style={{ font: '700 14px/20px var(--am-font-ui)' }}>{label}</label>
    {React.isValidElement(children) ? React.cloneElement(children as React.ReactElement<any>, { id, 'aria-describedby': descId, 'aria-invalid': error ? true : undefined }) : children}
    {error ? <span id={id + '-err'} role="alert" style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-error-text)' }}>{error}</span> : helper ? <span id={id + '-help'} style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>{helper}</span> : null}
  </div>;
}
