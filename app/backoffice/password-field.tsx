"use client";

import { useState } from "react";

export default function PasswordField({ label, name, autoComplete, value, onChange, required = true, minLength, placeholder }: {
  label: string; name?: string; autoComplete: string; value?: string; onChange?: (value: string) => void;
  required?: boolean; minLength?: number; placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  return <label className="password-field-label">{label}<span className="password-field-wrap"><input name={name} type={visible ? "text" : "password"} autoComplete={autoComplete} required={required} minLength={minLength} placeholder={placeholder} {...(value === undefined ? {} : { value, onChange: (event) => onChange?.(event.target.value) })}/><button className="password-visibility-toggle" type="button" aria-label={visible ? "Hide password" : "Show password"} title={visible ? "Hide password" : "Show password"} onClick={() => setVisible((current) => !current)}><svg viewBox="0 0 24 24" aria-hidden="true">{visible ? <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></> : <><path d="M3 3 21 21"/><path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a14.8 14.8 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7a10.5 10.5 0 0 0 4.2-.9"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></>}</svg></button></span></label>;
}
