"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { showBackofficeToast } from "@/lib/backoffice-toast";
import PasswordField from "../password-field";

type OfficeAccount = { id: string; username: string; last_login_at: string | null };

export default function OfficeAccountPanel() {
  const router = useRouter();
  const [account, setAccount] = useState<OfficeAccount | null>(null);
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetch("/api/backoffice/account", { credentials: "include" }).then(async (response) => {
      const result = await response.json() as { account?: OfficeAccount; error?: string };
      if (!response.ok || !result.account) { router.replace("/backoffice"); return; }
      setAccount(result.account); setUsername(result.account.username);
    }).catch(() => { showBackofficeToast("Could not load the office account.", "error"); router.replace("/backoffice"); });
  }, [router]);

  async function submit(payload: Record<string, string>, success: string) {
    setBusy(true);
    try {
      const response = await fetch("/api/backoffice/account", { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { username?: string; error?: string };
      if (!response.ok) throw new Error(result.error || "Could not save account settings.");
      if (result.username) { setUsername(result.username); setAccount((current) => current ? { ...current, username: result.username! } : current); }
      showBackofficeToast(success, "success");
      return true;
    } catch (error) {
      showBackofficeToast(error instanceof Error ? error.message : "Could not save account settings.", "error");
      return false;
    } finally { setBusy(false); }
  }

  async function saveUsername(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit({ username }, "Username saved.");
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword !== confirmPassword) { showBackofficeToast("The new passwords do not match.", "error"); return; }
    if (newPassword.length < 10) { showBackofficeToast("Use at least 10 characters for the new password.", "error"); return; }
    const saved = await submit({ currentPassword, newPassword }, "Password changed. Sign in with the new password next time.");
    if (saved) { setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }
  }

  async function signOut() {
    await fetch("/api/backoffice/auth/logout", { method: "POST", credentials: "include" });
    router.replace("/backoffice");
  }

  if (!account) return <main className="backoffice-shell"><div className="backoffice-loading">Loading account…</div></main>;
  return <main className="backoffice-app"><aside className="admin-sidebar"><a href="/" className="admin-brand">← View website</a><img src="/images/weskos-logo.webp" alt="Weskos"/><p>BACKOFFICE · OFFICE</p><div className="admin-role-badge"><small>LOGGED IN AS</small><strong>Admin Weskos</strong></div><nav aria-label="Backoffice navigation"><a href="/backoffice/homepage">⌂ &nbsp; Homepage</a><a className="admin-nav-active" href="/backoffice/account">♙ &nbsp; Account settings</a></nav><div className="admin-sidebar-bottom"><button onClick={() => void signOut()}>Sign out</button></div></aside>
    <section className="admin-main"><div className="admin-topbar"><div><p className="eyebrow">OFFICE ADMIN</p><h1>Account settings</h1><p>Change your username or sign-in password.</p></div></div>
      <section className="admin-editor"><div className="editor-title"><div><h2>Username or email</h2><p>Use either one to sign in to the office account.</p></div></div><form className="admin-form account-username-form" onSubmit={(event) => void saveUsername(event)}><label>Username or email<input type="text" autoCapitalize="none" spellCheck={false} autoComplete="username" minLength={3} maxLength={254} required value={username} onChange={(event) => setUsername(event.target.value)}/></label><button className="admin-button" type="submit" disabled={busy}>{busy ? "Saving…" : "Save username/email"}</button></form></section>
      <section className="admin-editor"><div className="editor-title"><div><h2>Change password</h2><p>Confirm your current password before setting a new one.</p></div></div><form className="admin-form account-password-form" onSubmit={(event) => void changePassword(event)}><PasswordField label="Current password" autoComplete="current-password" value={currentPassword} onChange={setCurrentPassword}/><PasswordField label="New password" autoComplete="new-password" minLength={10} value={newPassword} onChange={setNewPassword}/><PasswordField label="Confirm new password" autoComplete="new-password" minLength={10} value={confirmPassword} onChange={setConfirmPassword}/><p className="admin-account-note">Passwords are stored as one-way hashes. Dev can reset your password but cannot read it.</p><button className="admin-button" type="submit" disabled={busy}>{busy ? "Changing…" : "Change password"}</button></form></section>
    </section>
  </main>;
}
