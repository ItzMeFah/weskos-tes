"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { showBackofficeToast } from "@/lib/backoffice-toast";
import PasswordField from "../password-field";

type OfficeUser = { id: string; username: string; is_active: boolean; last_login_at: string | null; password_changed_at?: string | null; created_at: string; updated_at: string; role: "dev" | "office" };
type AuditLog = { id: number; actor_role: string; actor_username: string; action: string; details: Record<string, unknown>; created_at: string };

export default function DevControlPanel() {
  const router = useRouter();
  const [users, setUsers] = useState<OfficeUser[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const request = useCallback(async (url: string, init: RequestInit = {}) => {
    const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
    const headers = new Headers(init.headers);
    if (data.session?.access_token) headers.set("Authorization", `Bearer ${data.session.access_token}`);
    if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
    return fetch(url, { ...init, headers, credentials: "include" });
  }, []);

  const refresh = useCallback(async () => {
    const [usersResponse, logsResponse] = await Promise.all([request("/api/backoffice/dev/users"), request("/api/backoffice/dev/logs")]);
    if (usersResponse.status === 403 || logsResponse.status === 403 || usersResponse.status === 401 || logsResponse.status === 401) {
      showBackofficeToast("Dev access required. Sign in with the Supabase Dev account.", "error");
      router.replace("/backoffice");
      return;
    }
    const [userData, logData] = await Promise.all([usersResponse.json(), logsResponse.json()]) as [{ users?: OfficeUser[]; error?: string }, { logs?: AuditLog[]; error?: string }];
    if (!usersResponse.ok) throw new Error(userData.error || "Could not load office users.");
    if (!logsResponse.ok) throw new Error(logData.error || "Could not load audit history.");
    setUsers(userData.users ?? []);
    setLogs(logData.logs ?? []);
  }, [request, router]);

  useEffect(() => {
    let active = true;
    void (async () => {
      if (!supabase) { router.replace("/backoffice"); return; }
      const { data } = await supabase.auth.getSession();
      if (!data.session) { router.replace("/backoffice"); return; }
      try { await refresh(); }
      catch (error) { showBackofficeToast(error instanceof Error ? error.message : "Could not load the Dev panel.", "error"); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [refresh, router]);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true);
    try {
      const response = await request("/api/backoffice/dev/users", { method: "POST", body: JSON.stringify({ username, password: newPassword }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not create office user.");
      setUsername(""); setNewPassword("");
      await refresh();
      showBackofficeToast("Office user created. Store the initial password safely; it cannot be viewed later.", "success");
    } catch (error) { showBackofficeToast(error instanceof Error ? error.message : "Could not create office user.", "error"); }
    finally { setBusy(false); }
  }

  async function updateUser(id: string, payload: { password?: string; is_active?: boolean }) {
    setBusy(true);
    try {
      const response = await request("/api/backoffice/dev/users", { method: "PATCH", body: JSON.stringify({ id, ...payload }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not update office user.");
      await refresh();
      showBackofficeToast(payload.password ? "Office password reset." : "Office access updated.", "success");
    } catch (error) { showBackofficeToast(error instanceof Error ? error.message : "Could not update office user.", "error"); }
    finally { setBusy(false); }
  }

  async function signOut() {
    const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
    if (data.session?.access_token) await fetch("/api/backoffice/dev/logs", { method: "POST", headers: { Authorization: `Bearer ${data.session.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ action: "dev_logout" }) });
    await supabase?.auth.signOut();
    router.replace("/backoffice");
  }

  if (loading) return <main className="backoffice-shell"><div className="backoffice-loading">Loading Dev control panel…</div></main>;
  return <main className="backoffice-app"><aside className="admin-sidebar"><a href="/" className="admin-brand">← View website</a><img src="/images/weskos-logo.webp" alt="Weskos"/><p>BACKOFFICE · DEV</p><div className="admin-role-badge"><small>LOGGED IN AS</small><strong>Dev</strong></div><nav aria-label="Backoffice navigation"><a href="/backoffice/homepage">⌂ &nbsp; Homepage</a><a className="admin-nav-active" href="/backoffice/dev">⚙ &nbsp; Dev control panel</a></nav><div className="admin-sidebar-bottom"><button onClick={() => void signOut()}>Sign out</button></div></aside>
    <section className="admin-main"><div className="admin-topbar"><div><p className="eyebrow">DEVELOPER ACCESS</p><h1>Office accounts</h1><p>Create login credentials and review sign-in and CMS activity.</p></div></div>
      <section className="admin-editor"><div className="editor-title"><span>01</span><div><h2>Create office login</h2><p>Set a username or email and initial password for an office admin.</p></div></div><form className="admin-form dev-create-user" onSubmit={(event) => void createUser(event)}><label>Username or email<input type="text" autoCapitalize="none" spellCheck={false} autoComplete="off" minLength={3} maxLength={254} required value={username} onChange={(event) => setUsername(event.target.value)} placeholder="office.admin@weskoslegal.com"/></label><PasswordField label="Initial password" autoComplete="new-password" minLength={10} value={newPassword} onChange={setNewPassword}/><p className="admin-account-note">Passwords are stored as scrypt hashes. You can reset one later, but nobody can read it back.</p><button className="admin-button" type="submit" disabled={busy}>{busy ? "Creating…" : "Create office login"}</button></form></section>
      <section className="admin-editor"><div className="editor-title"><span>02</span><div><h2>Backoffice accounts</h2><p>Accounts, role, status, last login, and password update time.</p></div></div>{users.length ? <div className="dev-table-scroll"><table className="dev-table"><thead><tr><th>Username</th><th>Role / status</th><th>Last login</th><th>Created</th><th>Password set</th><th>Actions</th></tr></thead><tbody>{users.map((user) => <tr key={`${user.role}-${user.id}`}><td><strong>{user.username}</strong></td><td><span className={user.role === "dev" ? "status-dev" : user.is_active ? "status-active" : "status-disabled"}>{user.role === "dev" ? "DEV" : user.is_active ? "OFFICE · ACTIVE" : "OFFICE · DISABLED"}</span></td><td>{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "Never"}</td><td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</td><td>{user.role === "office" && user.password_changed_at ? new Date(user.password_changed_at).toLocaleDateString() : "—"}</td><td>{user.role === "office" ? <div className="dev-account-actions"><details className="dev-reset-form"><summary>Reset password</summary><form className="admin-form" onSubmit={(event) => { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); const value = String(data.get("password") ?? ""); void updateUser(user.id, { password: value }).then(() => form.reset()); }}><PasswordField label="New password" name="password" autoComplete="new-password" minLength={10}/><button className="admin-button" type="submit" disabled={busy}>{busy ? "Saving…" : "Set new password"}</button></form></details><button className="admin-button admin-user-toggle" type="button" disabled={busy} onClick={() => void updateUser(user.id, { is_active: !user.is_active })}>{user.is_active ? "Disable" : "Enable"}</button></div> : "—"}</td></tr>)}</tbody></table></div> : <p className="admin-account-note">No backoffice accounts found yet. Create an office login above; Dev accounts appear after they are allowlisted in Supabase.</p>}</section>
      <section className="admin-editor"><div className="editor-title"><span>03</span><div><h2>Login and edit activity</h2><p>Recent sign-ins, password updates, and homepage changes.</p></div></div>{logs.length ? <div className="dev-table-scroll"><table className="dev-table dev-audit-table"><thead><tr><th>Date & time</th><th>Account</th><th>Role</th><th>Activity</th><th>Details</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id}><td><time dateTime={log.created_at}>{new Date(log.created_at).toLocaleString()}</time></td><td>{log.actor_username}</td><td>{log.actor_role === "dev" ? "Dev" : "Admin Weskos"}</td><td>{log.action.replaceAll("_", " ")}</td><td>{Object.keys(log.details ?? {}).length > 0 ? JSON.stringify(log.details) : "—"}</td></tr>)}</tbody></table></div> : <p className="admin-account-note">No activity recorded yet.</p>}</section>
    </section>
  </main>;
}
