"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { showBackofficeToast } from "@/lib/backoffice-toast";
import PasswordField from "./password-field";

export default function BackofficeLoginPanel() {
  const router = useRouter();
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const loginName = identity.trim();
    if (!loginName || !password) return;
    setBusy(true);
    setErrorMessage("");
    try {
      const officeResponse = await fetch("/api/backoffice/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: loginName, password }),
      });
      const officeResult = await officeResponse.json() as { error?: string };
      if (officeResponse.ok) {
        await supabase?.auth.signOut();
        showBackofficeToast("Office sign-in successful.", "success");
        router.replace("/backoffice/homepage");
        return;
      }

      if (officeResponse.status === 404 && loginName.includes("@") && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email: loginName, password });
        if (error || !data.user) throw new Error(error?.message || "Dev sign-in failed. Check the Supabase email and password.");
        const { data: dev, error: devError } = await supabase.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
        if (devError) {
          await supabase.auth.signOut();
          throw new Error("Could not check Dev access. Check the Supabase admin_users table.");
        }
        if (!dev) {
          await supabase.auth.signOut();
          throw new Error("This Supabase account is not allowlisted as Dev.");
        }
        if (data.session?.access_token) {
          await fetch("/api/backoffice/auth/logout", { method: "POST", credentials: "include" });
          await fetch("/api/backoffice/dev/logs", { method: "POST", headers: { Authorization: `Bearer ${data.session.access_token}`, "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ action: "dev_login" }) });
        }
        showBackofficeToast("Dev sign-in successful.", "success");
        router.replace("/backoffice/dev");
        return;
      }
      throw new Error(officeResult.error || "Username/email or password is incorrect.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign-in failed. Check the username and password.";
      setErrorMessage(message);
      showBackofficeToast(message, "error");
    } finally {
      setBusy(false);
    }
  }

  return <main className="backoffice-shell"><section className="login-card"><img src="/images/weskos-logo.webp" alt="Weskos"/><h1>Welcome back.</h1><p className="login-copy">Use your Supabase Dev account or the office login set by Dev.</p>
    <form className="admin-form" onSubmit={(event) => void login(event)}>
      <label>Username / Dev email<input type="text" inputMode="text" autoCapitalize="none" spellCheck={false} autoComplete="username" required value={identity} onChange={(event) => setIdentity(event.target.value)} placeholder="Username or Dev email"/></label>
      <PasswordField label="Password" autoComplete="current-password" value={password} onChange={setPassword}/>
      <button className="admin-button" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
    </form>
    {errorMessage && <p className="admin-message" role="alert">{errorMessage}</p>}
  </section></main>;
}
