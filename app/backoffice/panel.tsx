"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { supabase, uploadMedia } from "@/lib/supabase";
import { convertImageToWebP } from "@/lib/image-conversion";
import { DEFAULT_HOME_CONTENT, HOME_CONTENT_KEY, normalizeHomeContent, type HomeContent } from "@/lib/home-content";

type AdminStatus = "checking" | "not-configured" | "signed-out" | "admin" | "not-admin";
type EditorTab = "hero" | "photos" | "copy" | "story" | "services" | "contact" | "account";
type CopyTextKey = Exclude<keyof HomeContent["copy"], "manifestoStamp">;
type PhotoArea = "hero" | "gallery" | "coastAndLocation" | "apparel" | "surfGoods" | "manifesto" | "storefront" | "boardArtwork";
type HomeSection = HomeContent["sectionOrder"][number];
const SECTION_LABELS: Record<HomeSection, string> = { intro: "Introduction", services: "Services", photoStory: "Photo story", manifesto: "Feature banner", contact: "Contact" };
const LOCAL_PREVIEW_KEY = "weskos-local-preview-content";

function setContentAtPath(content: HomeContent, path: string, value: string): HomeContent {
  if (!/^[\w.[\]-]+$/.test(path)) return content;
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  function replace(current: unknown, index: number): unknown {
    if (index >= parts.length) return value;
    const part = parts[index];
    if (Array.isArray(current)) {
      const arrayIndex = Number(part);
      if (!Number.isInteger(arrayIndex) || arrayIndex < 0 || arrayIndex >= current.length) return current;
      const copy = [...current];
      copy[arrayIndex] = replace(copy[arrayIndex], index + 1);
      return copy;
    }
    if (current && typeof current === "object" && Object.hasOwn(current, part)) {
      return { ...current, [part]: replace((current as Record<string, unknown>)[part], index + 1) };
    }
    return current;
  }
  return replace(content, 0) as HomeContent;
}

async function localImageUrl(file: File): Promise<string> {
  const webpFile = await convertImageToWebP(file);
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read this photo."));
    reader.readAsDataURL(webpFile);
  });
}

function PhotoRow({ src, label, index, count, busy, onUrl, onMove, onRemove, onFile, allowRemove = true }: {
  src: string; label: string; index: number; count: number; busy: boolean;
  onUrl: (value: string) => void; onMove: (direction: -1 | 1) => void; onRemove: () => void; onFile: (file?: File) => void; allowRemove?: boolean;
}) {
  return <div className="media-row">
    <div className="media-row-preview">{src ? <img src={src} alt={label}/> : <span>No photo</span>}</div>
    <div className="media-row-fields"><b>{label} · {String(index + 1).padStart(2, "0")}</b><input aria-label={`${label} image URL`} value={src} onChange={(event) => onUrl(event.target.value)} placeholder="Paste a photo URL"/><div className="media-row-actions"><label className="media-file-button">Replace photo<input type="file" accept="image/*" disabled={busy} onChange={(event) => { onFile(event.target.files?.[0]); event.currentTarget.value = ""; }}/></label><button type="button" onClick={() => onMove(-1)} disabled={busy || index === 0} aria-label="Move photo left">←</button><button type="button" onClick={() => onMove(1)} disabled={busy || index >= count - 1} aria-label="Move photo right">→</button><button type="button" className="media-remove" onClick={onRemove} disabled={busy || !allowRemove}>Remove</button></div></div>
  </div>;
}

function PasswordInput({ label, value, autoComplete, onChange, required = true, minLength }: {
  label: string; value: string; autoComplete: string; onChange: (value: string) => void; required?: boolean; minLength?: number;
}) {
  const [visible, setVisible] = useState(false);
  return <label className="password-field-label">{label}<span className="password-field-wrap"><input type={visible ? "text" : "password"} autoComplete={autoComplete} required={required} minLength={minLength} value={value} onChange={(event) => onChange(event.target.value)}/><button className="password-visibility-toggle" type="button" aria-label={visible ? "Hide password" : "Show password"} title={visible ? "Hide password" : "Show password"} onClick={() => setVisible((current) => !current)}><svg viewBox="0 0 24 24" aria-hidden="true">{visible ? <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></> : <><path d="M3 3 21 21"/><path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a14.8 14.8 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7a10.5 10.5 0 0 0 4.2-.9"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></>}</svg></button></span></label>;
}

export default function BackofficePanel() {
  const [status, setStatus] = useState<AdminStatus>("checking");
  const [content, setContent] = useState<HomeContent>(DEFAULT_HOME_CONTENT);
  const [message, setMessage] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [usernameColumnReady, setUsernameColumnReady] = useState(true);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(DEFAULT_HOME_CONTENT));
  const [editorMode, setEditorMode] = useState<"manual" | "visual">("manual");
  const [draggedSection, setDraggedSection] = useState<HomeSection | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<EditorTab>("hero");
  const [localPreview, setLocalPreview] = useState(false);
  const visualFrame = useRef<HTMLIFrameElement>(null);

  async function loadContent() {
    if (!supabase) { setStatus("not-configured"); return; }
    const { data, error } = await supabase.from("site_content").select("content").eq("id", HOME_CONTENT_KEY).maybeSingle();
    if (error) { setMessage("Could not load homepage content. Check the Supabase table and access policies."); setStatus("not-admin"); return; }
    const normalized = normalizeHomeContent(data?.content);
    setContent(normalized);
    setSavedSnapshot(JSON.stringify(normalized));
    setStatus("admin");
  }

  async function checkUser(userId: string | undefined) {
    if (!supabase || !userId) { setStatus("signed-out"); return; }
    let { data, error } = await supabase.from("admin_users").select("user_id, username").eq("user_id", userId).maybeSingle();
    if (error && (error.code === "42703" || error.code === "PGRST204")) {
      setUsernameColumnReady(false);
      const legacyResult = await supabase.from("admin_users").select("user_id").eq("user_id", userId).maybeSingle();
      data = legacyResult.data as typeof data;
      error = legacyResult.error;
    } else if (!error) {
      setUsernameColumnReady(true);
    }
    if (error) { setMessage("Could not verify admin access. Check the Supabase setup SQL and admin allowlist."); setStatus("not-admin"); return; }
    if (!data) { setMessage("This account is signed in but is not on the Weskos admin list."); setStatus("not-admin"); return; }
    setUsername("username" in data ? data.username ?? "" : "");
    await loadContent();
  }

  useEffect(() => {
    const requestedLocalPreview = process.env.NODE_ENV === "development" && new URLSearchParams(window.location.search).has("local-preview");
    if (requestedLocalPreview) {
      setLocalPreview(true);
      try {
        const stored = window.localStorage.getItem(LOCAL_PREVIEW_KEY);
        const normalized = normalizeHomeContent(stored ? JSON.parse(stored) : DEFAULT_HOME_CONTENT);
        setContent(normalized);
        setSavedSnapshot(JSON.stringify(normalized));
      } catch {
        setContent(DEFAULT_HOME_CONTENT);
        setSavedSnapshot(JSON.stringify(DEFAULT_HOME_CONTENT));
      }
      setStatus("admin");
      return;
    }
    if (!supabase) { setStatus("not-configured"); return; }
    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) { setMessage("Could not connect to Supabase Auth. Check the project URL and anon key."); setStatus("signed-out"); return; }
      return checkUser(data.session?.user.id);
    }).catch(() => { setMessage("Could not connect to Supabase Auth. Check the project URL and anon key."); setStatus("signed-out"); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { void checkUser(session?.user.id); });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) { setStatus("not-configured"); return; }
    setBusy(true); setMessage("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) setMessage(`Sign-in failed: ${error.message}`);
    } catch (error) {
      setMessage(error instanceof Error ? `Sign-in failed: ${error.message}` : "Sign-in failed. Check your Supabase Auth settings.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setStatus("signed-out"); setContent(DEFAULT_HOME_CONTENT);
    setUsername("");
    setSavedSnapshot(JSON.stringify(DEFAULT_HOME_CONTENT));
  }

  async function saveUsername(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (localPreview || !supabase) { setUsernameMessage("Sign in to Supabase to change the admin username."); return; }
    if (!usernameColumnReady) { setUsernameMessage("Run the updated supabase/setup.sql in Supabase SQL Editor first, then reload this page."); return; }
    const nextUsername = username.trim();
    if (!nextUsername) { setUsernameMessage("Enter a username before saving."); return; }
    setBusy(true); setUsernameMessage("");
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.refreshSession();
      if (sessionError || !sessionData.session) throw new Error("Your Supabase session expired. Sign in again, then retry.");
      const { data, error } = await supabase.from("admin_users").update({ username: nextUsername }).eq("user_id", sessionData.session.user.id).select("user_id").maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("No matching admin row was updated. Check the admin_users update policy.");
      setUsername(nextUsername);
      setUsernameMessage("Admin username saved.");
    } catch (error) {
      setUsernameMessage(error instanceof Error ? `Could not change username: ${error.message}` : "Could not change the username. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (localPreview || !supabase) {
      setPasswordMessage("Sign in to Supabase to change the admin password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage("Use at least 8 characters for the new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage("The new passwords do not match.");
      return;
    }
    setBusy(true);
    setPasswordMessage("");
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.refreshSession();
      if (sessionError || !sessionData.session) throw new Error("Your Supabase session expired. Sign in again, then retry.");
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        throw error;
      }
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Password changed. Use the new password next time you sign in.");
    } catch (error) {
      setPasswordMessage(error instanceof Error ? `Could not change password: ${error.message}` : "Could not change the password. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function saveContent() {
    setBusy(true); setMessage("");
    if (localPreview) {
      try {
        const snapshot = JSON.stringify(content);
        window.localStorage.setItem(LOCAL_PREVIEW_KEY, snapshot);
        setSavedSnapshot(snapshot);
        setMessage("Saved in this browser only. Supabase was not changed.");
      } catch {
        setMessage("Could not save this local preview in browser storage.");
      }
      setBusy(false);
      return;
    }
    if (status === "admin" && supabase) {
      const snapshot = JSON.stringify(content);
      const { error } = await supabase.from("site_content").upsert({ id: HOME_CONTENT_KEY, content, updated_at: new Date().toISOString() });
      setMessage(error ? `Could not save: ${error.message}` : "Homepage saved.");
      if (!error) setSavedSnapshot(snapshot);
    }
    setBusy(false);
  }

  async function uploadPhoto(file: File | undefined, area: PhotoArea, index?: number) {
    if (!file) return;
    setBusy(true); setMessage("");
    try {
      let photoUrl: string;
      if (localPreview) photoUrl = await localImageUrl(file);
      else {
        if (status !== "admin") throw new Error("Sign in with an approved Weskos admin account to upload media.");
        photoUrl = await uploadMedia(file, "home");
      }
      if (area === "hero") update("heroImages", index === undefined ? [...content.heroImages, photoUrl] : content.heroImages.map((photo, i) => i === index ? photoUrl : photo));
      else if (area === "gallery") updatePhoto("gallery", index === undefined ? [...content.photos.gallery, photoUrl] : content.photos.gallery.map((photo, i) => i === index ? photoUrl : photo));
      else if (area === "coastAndLocation") {
        const photos = content.photos.coastAndLocation ?? [];
        updatePhoto("coastAndLocation", index === undefined ? [...photos, photoUrl] : photos.map((photo, i) => i === index ? photoUrl : photo));
      }
      else updatePhoto(area, photoUrl);
      setMessage(localPreview ? "Photo added to local preview. Save homepage to keep it in this browser." : "Photo updated. Save homepage to publish your changes.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed. Check your storage settings.");
    }
    setBusy(false);
  }

  const update = <K extends keyof HomeContent>(field: K, value: HomeContent[K]) => { setMessage(""); setContent((current) => ({ ...current, [field]: value })); };
  const updatePhoto = <K extends keyof HomeContent["photos"]>(field: K, value: HomeContent["photos"][K]) => { setMessage(""); setContent((current) => ({ ...current, photos: { ...current.photos, [field]: value } })); };
  const removeVisualPhoto = (area: PhotoArea, index: number) => {
    if (area === "hero") {
      if (content.heroImages.length <= 1) { setMessage("Keep at least one hero photo. Add another photo before deleting this one."); return; }
      update("heroImages", content.heroImages.filter((_, photoIndex) => photoIndex !== index));
    } else if (area === "gallery" || area === "coastAndLocation") {
      const photos = content.photos[area] ?? [];
      if (index < 0 || index >= photos.length) return;
      updatePhoto(area, photos.filter((_, photoIndex) => photoIndex !== index));
    } else if (area === "apparel" || area === "surfGoods" || area === "manifesto" || area === "storefront") {
      updatePhoto(area, "");
    }
    setMessage("Photo removed from the homepage draft. Save homepage to publish your changes.");
  };
  const updateService = (index: number, field: "category" | "title" | "description", value: string) => { setMessage(""); setContent((current) => ({ ...current, services: current.services.map((service, i) => i === index ? { ...service, [field]: value } : service) })); };
  const updateCopy = <K extends CopyTextKey>(field: K, value: HomeContent["copy"][K]) => { setMessage(""); setContent((current) => ({ ...current, copy: { ...current.copy, [field]: value } })); };
  const updateManifestoStamp = (index: number, value: string) => { setMessage(""); setContent((current) => ({ ...current, copy: { ...current.copy, manifestoStamp: current.copy.manifestoStamp.map((line, i) => i === index ? value : line) } })); };
  const updateManifesto = <K extends keyof HomeContent["manifesto"]>(field: K, value: HomeContent["manifesto"][K]) => { setMessage(""); setContent((current) => ({ ...current, manifesto: { ...current.manifesto, [field]: value } })); };
  const updateContact = <K extends keyof HomeContent["contact"]>(field: K, value: HomeContent["contact"][K]) => { setMessage(""); setContent((current) => ({ ...current, contact: { ...current.contact, [field]: value } })); };
  const movePhoto = (area: "hero" | "gallery" | "coastAndLocation", index: number, direction: -1 | 1) => {
    const photos = [...(area === "hero" ? content.heroImages : (content.photos[area] ?? []))];
    const target = index + direction;
    if (target < 0 || target >= photos.length) return;
    [photos[index], photos[target]] = [photos[target], photos[index]];
    if (area === "hero") update("heroImages", photos); else updatePhoto(area, photos);
  };

  const copyFieldGroups: { title: string; fields: [CopyTextKey, string][] }[] = [
    { title: "Navigation & header", fields: [["navHome", "Home link"], ["navServices", "Services link"], ["navAbout", "About link"], ["navInsights", "Insights link"], ["navContact", "Contact link"], ["navProduct", "Product link"], ["navSurf", "Surf link"], ["navWhatsappLabel", "WhatsApp icon label"], ["navInstagramLabel", "Instagram icon label"], ["navEmailLabel", "Email icon label"], ["homeAriaLabel", "Logo accessibility label"], ["navAriaLabel", "Navigation accessibility label"], ["servicesMenuAriaLabel", "Services menu accessibility label"], ["insightsMenuAriaLabel", "Insights menu accessibility label"], ["headerActionsAriaLabel", "Header actions accessibility label"]] },
    { title: "Hero button & location", fields: [["heroCta", "Hero button text"], ["heroLocation", "Hero location text"]] },
    { title: "Introduction", fields: [["introEyebrow", "Section label"], ["introTagLine1", "Image tag line 1"], ["introTagLine2", "Image tag line 2"], ["introLinkText", "Introduction link text"]] },
    { title: "Services section", fields: [["servicesEyebrow", "Section label"], ["servicesHeadingLine1", "Heading line 1"], ["servicesHeadingLine2", "Heading line 2"], ["servicesLead", "Section description"], ["serviceLinkText", "Service card link text"]] },
    { title: "Photo story", fields: [["photoStoryEyebrow", "Section label"], ["photoStoryTitleStart", "Heading first part"], ["photoStoryTitleEm", "Heading emphasized part"], ["photoStoryCaption", "Photo caption"], ["photoStoryAltPrefix", "Image description prefix"]] },
    { title: "Feature image & map", fields: [["manifestoImageAlt", "Feature image description"], ["manifestoImageCaption", "Feature image caption"], ["mapAriaLabel", "Map link accessibility label"], ["mapPhotoAlt", "Location photo description"], ["mapEyebrow", "Map label"], ["mapTitle", "Map link text"]] },
    { title: "Contact labels", fields: [["contactWhatsappLabel", "WhatsApp label"], ["contactEmailLabel", "Email label"], ["contactInstagramLabel", "Instagram label"]] },
    { title: "Footer", fields: [["footerBrandText", "Brand description"], ["footerVisitLabel", "Visit link text"], ["footerServicesHeading", "Services column title"], ["footerExploreHeading", "Explore column title"], ["footerAboutLabel", "About link"], ["footerSurfLabel", "Surf link"], ["footerProductsLabel", "Products link"], ["footerPhotoCreditsLabel", "Photo credits link"], ["footerLegalHeading", "Legal column title"], ["footerTermsLabel", "Terms link"], ["footerPrivacyLabel", "Privacy link"], ["footerCookiesLabel", "Cookies link"], ["footerContactHeading", "Contact column title"], ["footerDirectionsLabel", "Directions link"], ["footerInstagramLabel", "Instagram link"], ["footerCopyrightName", "Copyright name"], ["footerLocation", "Footer location"], ["footerAdminLabel", "Admin link"]] },
  ];
  const multilineCopyFields = new Set<CopyTextKey>(["servicesLead", "footerBrandText"]);
  const isDirty = JSON.stringify(content) !== savedSnapshot;
  const sendPreviewDraft = () => {
    const draft = { type: "weskos-admin-preview", content };
    visualFrame.current?.contentWindow?.postMessage(draft, window.location.origin);
  };

  const moveSection = (from: number, to: number) => setContent((current) => {
    if (to < 0 || to >= current.sectionOrder.length) return current;
    const sectionOrder = [...current.sectionOrder];
    const [section] = sectionOrder.splice(from, 1);
    sectionOrder.splice(to, 0, section);
    return { ...current, sectionOrder };
  });

  useEffect(() => {
    if (editorMode === "visual") sendPreviewDraft();
  }, [content, editorMode]);

  useEffect(() => {
    const receiveVisualEdit = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "weskos-visual-edit" && typeof event.data.field === "string" && typeof event.data.value === "string") {
        setMessage("");
        setContent((current) => setContentAtPath(current, event.data.field, event.data.value));
      }
      const droppedFile = event.data?.file;
      if (event.data?.type === "weskos-visual-photo-drop" && droppedFile && typeof droppedFile.type === "string" && typeof droppedFile.arrayBuffer === "function" && typeof event.data.area === "string") {
        void uploadPhoto(droppedFile as File, event.data.area as PhotoArea, typeof event.data.index === "number" ? event.data.index : undefined);
      }
      if (event.data?.type === "weskos-visual-photo-delete" && typeof event.data.area === "string" && typeof event.data.index === "number") {
        removeVisualPhoto(event.data.area as PhotoArea, event.data.index);
      }
    };
    window.addEventListener("message", receiveVisualEdit);
    return () => window.removeEventListener("message", receiveVisualEdit);
  }, [content, localPreview, status]);

  if (status === "checking") return <main className="backoffice-shell"><div className="backoffice-loading">Loading Weskos backoffice…</div></main>;
  if (status === "not-configured") return <main className="backoffice-shell"><section className="login-card"><a className="admin-brand" href="/">← Back to Weskos</a><img src="/images/weskos-logo.webp" alt="Weskos"/><p className="eyebrow">WESKOS LEGAL CO. · PRIVATE AREA</p><h1>Backoffice setup required.</h1><p className="login-copy">The CMS is locked until Supabase is connected. Configure the Supabase project URL and anon key, enable email and password sign-in, then create and allowlist an admin user.</p></section></main>;
  if (status === "signed-out" || status === "not-admin") return <main className="backoffice-shell"><section className="login-card"><img src="/images/weskos-logo.webp" alt="Weskos"/><h1>Welcome back.</h1>
    <form className="admin-form" onSubmit={(event) => void signIn(event)}>
      <label>Email<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com"/></label>
      <PasswordInput label="Password" autoComplete="current-password" value={password} onChange={setPassword}/>
      <button className="admin-button" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
    </form>
    {message && <p className="admin-message" role="status">{message}</p>}</section></main>;

  return <main className="backoffice-app"><aside className="admin-sidebar"><a href="/" className="admin-brand">← View website</a><img src="/images/weskos-logo.webp" alt="Weskos"/><p>BACKOFFICE</p><nav aria-label="Backoffice navigation"><button type="button" className={activeTab !== "account" ? "admin-nav-active" : ""} onClick={() => { setEditorMode("manual"); setActiveTab("hero"); }}>⌂ &nbsp; Homepage</button><button id="admin-nav-account" type="button" className={activeTab === "account" ? "admin-nav-active" : ""} onClick={() => { setEditorMode("manual"); setActiveTab("account"); }}>⚙ &nbsp; Account settings</button><a href="/#services">↗ &nbsp; View services</a></nav><div className="admin-sidebar-bottom"><span>{localPreview ? "LOCAL PREVIEW" : "SUPABASE ADMIN"}</span>{localPreview ? <a href="/">Exit</a> : <button onClick={signOut}>Sign out</button>}</div></aside>
    <section className={`admin-main ${editorMode === "visual" ? "admin-main-visual" : ""}`}><div className="admin-topbar"><div><p className="eyebrow">{activeTab === "account" ? "ADMIN PROFILE" : "CONTENT MANAGEMENT"}</p><h1>{activeTab === "account" ? "Account settings" : "Homepage editor"}</h1><p>{activeTab === "account" ? "Manage your admin username and sign-in password." : "Update the first impression your visitors see."}</p></div></div>
    {activeTab !== "account" && <div className="admin-editor-modes" role="group" aria-label="Editing mode"><button type="button" className={editorMode === "manual" ? "is-active" : ""} aria-pressed={editorMode === "manual"} onClick={() => setEditorMode("manual")}>Manual</button><button type="button" className={editorMode === "visual" ? "is-active" : ""} aria-pressed={editorMode === "visual"} onClick={() => setEditorMode("visual")}>Visual</button></div>}
    {localPreview && activeTab !== "account" && <p className="local-preview-note">Local preview: edits are saved only in this browser. Supabase and live website are untouched.</p>}
    {editorMode === "manual" && activeTab !== "account" && <nav className="admin-editor-tabs" role="tablist" aria-label="Homepage sections">{([ ["hero", "Hero"], ["photos", "Photos"], ["copy", "All text"], ["story", "Story"], ["services", "Services"], ["contact", "Contact"] ] as const).map(([tab, label], index) => <button key={tab} type="button" role="tab" id={`editor-tab-${tab}`} aria-selected={activeTab === tab} aria-controls="editor-panel" className={activeTab === tab ? "is-active" : ""} onClick={() => setActiveTab(tab)}><span>{String(index + 1).padStart(2, "0")}</span>{label}</button>)}</nav>}
    {editorMode === "manual" && <div className="admin-tab-content" id="editor-panel" role="tabpanel" aria-labelledby={activeTab === "account" ? "admin-nav-account" : `editor-tab-${activeTab}`}>
    {activeTab === "hero" && <div className="admin-editor" id="home-editor"><div className="editor-title"><span>01</span><div><h2>Hero section</h2><p>Edit the Hero message and the order and timing of its photos.</p></div></div>
      <label>Hero title<input value={content.heroTitle} onChange={(event) => update("heroTitle", event.target.value)}/></label>
      <label>Rotating phrases <small>One phrase per line · changes every {content.heroPhraseIntervalSeconds} seconds</small><textarea rows={4} value={content.heroPhrases.join("\n")} onChange={(event) => update("heroPhrases", event.target.value.split("\n").map((line) => line.trim()).filter(Boolean))}/></label>
      <label>Supporting text<textarea rows={3} value={content.heroLead} onChange={(event) => update("heroLead", event.target.value)}/></label>
      <div className="media-settings"><label>Hero photo interval <small>Time each photo stays on screen</small><span className="number-field"><input type="number" min={3} max={120} value={content.heroSlideIntervalSeconds} onChange={(event) => update("heroSlideIntervalSeconds", Number(event.target.value))}/><b>sec</b></span></label><label>Hero phrase interval <small>Time each phrase stays on screen</small><span className="number-field"><input type="number" min={1} max={60} value={content.heroPhraseIntervalSeconds} onChange={(event) => update("heroPhraseIntervalSeconds", Number(event.target.value))}/><b>sec</b></span></label></div>


      <div className="media-manager"><div className="media-manager-heading"><div><b>Hero photos</b><small>Hero images play in the order listed below.</small></div><label className="media-file-button media-add-button">+ Add photo<input type="file" accept="image/*" disabled={busy} onChange={(event) => { void uploadPhoto(event.target.files?.[0], "hero"); event.currentTarget.value = ""; }}/></label></div>
        <div className="media-list">{content.heroImages.map((src, index) => <PhotoRow key={`hero-${index}`} src={src} label="Hero" index={index} count={content.heroImages.length} busy={busy} onUrl={(value) => update("heroImages", content.heroImages.map((photo, i) => i === index ? value : photo))} onMove={(direction) => movePhoto("hero", index, direction)} onRemove={() => update("heroImages", content.heroImages.filter((_, i) => i !== index))} onFile={(file) => void uploadPhoto(file, "hero", index)} allowRemove={content.heroImages.length > 1}/>)}</div>
      </div>
    </div>}
    {activeTab === "photos" && <div className="admin-editor"><div className="editor-title"><span>02</span><div><h2>Website photos</h2><p>Replace, remove, and arrange every other homepage photo.</p></div></div>
      <div className="media-manager"><div className="media-manager-heading"><div><b>Coast, property & location photos</b><small>New photos are added to the homepage photo story.</small></div><label className="media-file-button media-add-button">+ Add photo<input type="file" accept="image/*" disabled={busy} onChange={(event) => { void uploadPhoto(event.target.files?.[0], "coastAndLocation"); event.currentTarget.value = ""; }}/></label></div><div className="media-list">{([["apparel", "Krui landscape · 01", content.photos.apparel], ["surfGoods", "Krui landscape · 02", content.photos.surfGoods], ["manifesto", "Coastal feature", content.photos.manifesto], ["storefront", "Weskos location", content.photos.storefront]] as const).map(([area, label, src]) => <PhotoRow key={area} src={src} label={label} index={0} count={1} busy={busy} onUrl={(value) => updatePhoto(area, value)} onMove={() => undefined} onRemove={() => updatePhoto(area, "")} onFile={(file) => void uploadPhoto(file, area)}/>)}</div><div className="media-list">{(content.photos.coastAndLocation ?? []).map((src, index, coastPhotos) => <PhotoRow key={index} src={src} label="Coast & location" index={index} count={coastPhotos.length} busy={busy} onUrl={(value) => updatePhoto("coastAndLocation", coastPhotos.map((photo, i) => i === index ? value : photo))} onMove={(direction) => movePhoto("coastAndLocation", index, direction)} onRemove={() => updatePhoto("coastAndLocation", coastPhotos.filter((_, i) => i !== index))} onFile={(file) => void uploadPhoto(file, "coastAndLocation", index)}/>)}</div><div className="media-add-row"><label className="media-file-button media-add-button">+ Add photo<input type="file" accept="image/*" disabled={busy} onChange={(event) => { void uploadPhoto(event.target.files?.[0], "coastAndLocation"); event.currentTarget.value = ""; }}/></label></div></div>
      <div className="media-manager"><div className="media-manager-heading"><div><b>Photo story gallery</b><small>Displayed in order on the homepage.</small></div><label className="media-file-button media-add-button">+ Add photo<input type="file" accept="image/*" disabled={busy} onChange={(event) => { void uploadPhoto(event.target.files?.[0], "gallery"); event.currentTarget.value = ""; }}/></label></div>
        <div className="media-list">{content.photos.gallery.map((src, index) => <PhotoRow key={`gallery-${index}`} src={src} label="Gallery" index={index} count={content.photos.gallery.length} busy={busy} onUrl={(value) => updatePhoto("gallery", content.photos.gallery.map((photo, i) => i === index ? value : photo))} onMove={(direction) => movePhoto("gallery", index, direction)} onRemove={() => updatePhoto("gallery", content.photos.gallery.filter((_, i) => i !== index))} onFile={(file) => void uploadPhoto(file, "gallery", index)}/>)}</div>
      </div>
    </div>}
    {activeTab === "copy" && <div className="admin-editor admin-copy-editor"><div className="editor-title"><span>03</span><div><h2>All landing page text</h2><p>These fields are saved in Supabase and shown on the live homepage after saving.</p></div></div>
      {copyFieldGroups.map((group) => <details className="admin-copy-group" key={group.title} open={group.title === "Navigation & header"}><summary>{group.title}</summary><div className="admin-copy-grid">{group.fields.map(([field, label]) => <label key={field}>{label}{multilineCopyFields.has(field) ? <textarea rows={3} value={content.copy[field]} onChange={(event) => updateCopy(field, event.target.value)}/> : <input value={content.copy[field]} onChange={(event) => updateCopy(field, event.target.value)}/>}</label>)}</div>{group.title === "Feature image & map" && <div className="admin-copy-grid admin-copy-stamp">{content.copy.manifestoStamp.map((line, index) => <label key={index}>Feature stamp line {index + 1}<input value={line} onChange={(event) => updateManifestoStamp(index, event.target.value)}/></label>)}</div>}</details>)}
    </div>}
    {activeTab === "story" && <div className="admin-editor"><div className="editor-title"><span>04</span><div><h2>Our story</h2><p>Keep the introduction short and personal.</p></div></div><label>Section headline<input value={content.introTitle} onChange={(event) => update("introTitle", event.target.value)}/></label><label>Section description<textarea rows={4} value={content.introBody} onChange={(event) => update("introBody", event.target.value)}/></label></div>}
    {activeTab === "services" && <div className="admin-editor"><div className="editor-title"><span>05</span><div><h2>Services</h2><p>Change the category, title, and description shown on the homepage.</p></div></div>
      {content.services.map((service, index) => <div className="admin-service-fields" key={`service-${index}`}><b>{String(index + 1).padStart(2, "0")} · Service</b><label>Category<input value={service.category} onChange={(event) => updateService(index, "category", event.target.value)}/></label><label>Title<input value={service.title} onChange={(event) => updateService(index, "title", event.target.value)}/></label><label>Description<textarea rows={3} value={service.description} onChange={(event) => updateService(index, "description", event.target.value)}/></label></div>)}
    </div>}
    {activeTab === "contact" && <div className="admin-editor"><div className="editor-title"><span>06</span><div><h2>Contact & calls to action</h2><p>Update contact details and the closing messages on the homepage.</p></div></div>
      <div className="admin-contact-grid"><label>WhatsApp number<input value={content.contact.phone} onChange={(event) => updateContact("phone", event.target.value)}/></label><label>Contact email<input type="email" value={content.contact.email} onChange={(event) => updateContact("email", event.target.value)}/></label><label>Instagram username<input value={content.contact.instagram} onChange={(event) => updateContact("instagram", event.target.value)}/></label><label>Address<input value={content.contact.address} onChange={(event) => updateContact("address", event.target.value)}/></label></div>
      <div className="admin-subsection"><h3>Feature banner</h3><label>Eyebrow<input value={content.manifesto.eyebrow} onChange={(event) => updateManifesto("eyebrow", event.target.value)}/></label><label>Headline <small>Put each line on a new line.</small><textarea rows={2} value={content.manifesto.title} onChange={(event) => updateManifesto("title", event.target.value)}/></label><label>Description<textarea rows={3} value={content.manifesto.body} onChange={(event) => updateManifesto("body", event.target.value)}/></label><label>Button text<input value={content.manifesto.buttonText} onChange={(event) => updateManifesto("buttonText", event.target.value)}/></label></div>
      <div className="admin-subsection"><h3>Contact section</h3><label>Eyebrow<input value={content.contact.eyebrow} onChange={(event) => updateContact("eyebrow", event.target.value)}/></label><label>Headline <small>Put each line on a new line.</small><textarea rows={2} value={content.contact.title} onChange={(event) => updateContact("title", event.target.value)}/></label><label>Description<textarea rows={3} value={content.contact.body} onChange={(event) => updateContact("body", event.target.value)}/></label><label>Button text<input value={content.contact.buttonText} onChange={(event) => updateContact("buttonText", event.target.value)}/></label></div>
    </div>}
    {activeTab === "account" && <div className="admin-editor"><div className="editor-title"><div><h2>Profile and sign-in</h2><p>Update the admin username or change the password used to sign in.</p></div></div>
      <div className="admin-account-settings">
        <section className="admin-subsection"><h3>Admin username</h3>
          {localPreview ? <p className="admin-account-note">Username changes are available after signing in with Supabase. Local preview does not connect to an account.</p> : <form className="admin-form account-username-form" onSubmit={(event) => void saveUsername(event)}><label>Username<input autoComplete="nickname" maxLength={40} required value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Admin username"/></label><p className="admin-account-note">Username is saved in the <code>admin_users</code> table. Sign in with your email.</p>{!usernameColumnReady && <p className="admin-message" role="status">Run the updated <code>supabase/setup.sql</code> in Supabase SQL Editor to enable username editing.</p>}<button className="admin-button" type="submit" disabled={busy || !usernameColumnReady}>{busy ? "Saving username…" : "Save username"}</button>{usernameMessage && <p className="admin-message" role="status">{usernameMessage}</p>}</form>}
        </section>
        <section className="admin-subsection"><h3>Change password</h3>
          {localPreview ? <p className="admin-account-note">Password changes are available after signing in with Supabase. Local preview does not connect to an account.</p> : <form className="admin-form account-password-form" onSubmit={(event) => void changePassword(event)}><PasswordInput label="New password" autoComplete="new-password" minLength={8} value={newPassword} onChange={setNewPassword}/><PasswordInput label="Confirm new password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={setConfirmPassword}/><p className="admin-account-note">Password is changed securely through Supabase Auth; it is never written to a normal table.</p><button className="admin-button" type="submit" disabled={busy}>{busy ? "Changing password…" : "Change password"}</button>{passwordMessage && <p className="admin-message" role="status">{passwordMessage}</p>}</form>}
        </section>
      </div>
    </div>}
    </div>}
    {editorMode === "visual" && <div className="visual-editor-shell">
      <aside className="visual-section-panel">
        <h2>Page sections</h2>
        <p>Drag to change their order. Double-click page text to edit it.</p>
        <div className="visual-section-list">{content.sectionOrder.map((section, index) => <div key={section} className={`visual-section-row ${draggedSection === section ? "is-dragging" : ""}`} draggable onDragStart={(event) => { setDraggedSection(section); event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", section); }} onDragEnd={() => setDraggedSection(null)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const dragged = event.dataTransfer.getData("text/plain") as HomeSection; const from = content.sectionOrder.indexOf(dragged); if (from >= 0) moveSection(from, index); setDraggedSection(null); }}><button type="button" aria-label={`Drag ${SECTION_LABELS[section]}`}>⠿ &nbsp;{SECTION_LABELS[section]}</button><span className="visual-section-actions"><button type="button" aria-label={`Move ${SECTION_LABELS[section]} up`} disabled={index === 0} onClick={() => moveSection(index, index - 1)}>↑</button><button type="button" aria-label={`Move ${SECTION_LABELS[section]} down`} disabled={index === content.sectionOrder.length - 1} onClick={() => moveSection(index, index + 1)}>↓</button></span></div>)}</div>
        <details className="visual-control-group" open>
          <summary>Hero rotation</summary>
          <label>Hero title<input value={content.heroTitle} onChange={(event) => update("heroTitle", event.target.value)}/></label>
          <label>Rotating phrases <small>One phrase per line</small><textarea rows={4} value={content.heroPhrases.join("\n")} onChange={(event) => update("heroPhrases", event.target.value.split("\n").map((line) => line.trim()).filter(Boolean))}/></label>


          <div className="visual-timing-grid">

            <label>Photo interval (sec)<input type="number" min={3} max={120} value={content.heroSlideIntervalSeconds} onChange={(event) => update("heroSlideIntervalSeconds", Number(event.target.value))}/></label>
            <label>Phrase interval (sec)<input type="number" min={1} max={60} value={content.heroPhraseIntervalSeconds} onChange={(event) => update("heroPhraseIntervalSeconds", Number(event.target.value))}/></label>
          </div>
          <label className="visual-add-photo">+ Add hero photo<input type="file" accept="image/*" disabled={busy} onChange={(event) => { void uploadPhoto(event.target.files?.[0], "hero"); event.currentTarget.value = ""; }}/></label>
          <ol className="visual-hero-photo-list">{content.heroImages.map((src, index) => <li key={`${src}-${index}`}><img src={src} alt=""/><span>{String(index + 1).padStart(2, "0")} · {src.split("/").pop()}</span><div><button type="button" aria-label={`Move hero photo ${index + 1} up`} disabled={index === 0 || busy} onClick={() => movePhoto("hero", index, -1)}>↑</button><button type="button" aria-label={`Move hero photo ${index + 1} down`} disabled={index === content.heroImages.length - 1 || busy} onClick={() => movePhoto("hero", index, 1)}>↓</button><button type="button" aria-label={`Delete hero photo ${index + 1}`} disabled={content.heroImages.length <= 1 || busy} onClick={() => removeVisualPhoto("hero", index)}>×</button></div></li>)}</ol>
        </details>
        <div className="visual-gallery-tools"><h3>Photo story gallery</h3><p>New photos are added to the end of the gallery.</p><label className="visual-add-photo">+ Add photo to gallery<input type="file" accept="image/*" disabled={busy} onChange={(event) => { void uploadPhoto(event.target.files?.[0], "gallery"); event.currentTarget.value = ""; }}/></label></div>
      </aside>
      <section className="visual-preview-pane" aria-label="Landing page preview">
        <div className="visual-preview-toolbar"><strong>Landing page</strong><div role="group" aria-label="Preview size"><button type="button" aria-label="Desktop preview" aria-pressed={previewMode === "desktop"} className={previewMode === "desktop" ? "is-selected" : ""} onClick={() => setPreviewMode("desktop")}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="1"/><path d="M8 21h8m-4-4v4"/></svg>Desktop</button><button type="button" aria-label="Mobile preview" aria-pressed={previewMode === "mobile"} className={previewMode === "mobile" ? "is-selected" : ""} onClick={() => setPreviewMode("mobile")}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>Mobile</button></div></div>
        <div className={`visual-frame-wrap visual-frame-${previewMode}`}><iframe ref={visualFrame} src="/?admin-preview=1&visual-edit=1" title="Visual homepage editor" onLoad={sendPreviewDraft}/></div>
      </section>
    </div>}
    {activeTab !== "account" && <div className="admin-savebar"><p role="status">{message || (isDirty ? "Unsaved changes" : "All changes saved.")}</p><button className="admin-button" onClick={saveContent} disabled={busy || !isDirty}>{busy ? "Saving…" : "Save homepage"}</button></div>}
    </section></main>;
}
