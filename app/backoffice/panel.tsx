"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { supabase, uploadMedia } from "@/lib/supabase";
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
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1800 / bitmap.width, 1800 / bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare this photo for the local preview.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Could not prepare this photo for the local preview.")), "image/webp", 0.78));
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read this photo."));
    reader.readAsDataURL(blob);
  });
}

function PhotoRow({ src, label, index, count, busy, onUrl, onMove, onRemove, onFile, allowRemove = true }: {
  src: string; label: string; index: number; count: number; busy: boolean;
  onUrl: (value: string) => void; onMove: (direction: -1 | 1) => void; onRemove: () => void; onFile: (file?: File) => void; allowRemove?: boolean;
}) {
  return <div className="media-row">
    <div className="media-row-preview">{src ? <img src={src} alt={label}/> : <span>No photo</span>}</div>
    <div className="media-row-fields"><b>{label} · {String(index + 1).padStart(2, "0")}</b><input aria-label={`${label} image URL`} value={src} onChange={(event) => onUrl(event.target.value)} placeholder="Paste a photo URL"/><div className="media-row-actions"><label className="media-file-button">Replace photo<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => { onFile(event.target.files?.[0]); event.currentTarget.value = ""; }}/></label><button type="button" onClick={() => onMove(-1)} disabled={busy || index === 0} aria-label="Move photo left">←</button><button type="button" onClick={() => onMove(1)} disabled={busy || index >= count - 1} aria-label="Move photo right">→</button><button type="button" className="media-remove" onClick={onRemove} disabled={busy || !allowRemove}>Remove</button></div></div>
  </div>;
}

export default function BackofficePanel() {
  const [status, setStatus] = useState<AdminStatus>("checking");
  const [content, setContent] = useState<HomeContent>(DEFAULT_HOME_CONTENT);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(DEFAULT_HOME_CONTENT));
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"manual" | "visual">("manual");
  const [draggedSection, setDraggedSection] = useState<HomeSection | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<EditorTab>("hero");
  const [localPreview, setLocalPreview] = useState(false);
  const previewFrame = useRef<HTMLIFrameElement>(null);
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
    const { data, error } = await supabase.from("admin_users").select("user_id").eq("user_id", userId).maybeSingle();
    if (error) { setMessage("Could not verify admin access. Run the Supabase setup SQL and add your user as an admin."); setStatus("not-admin"); return; }
    if (!data) { setMessage("This account is signed in but is not on the Weskos admin list."); setStatus("not-admin"); return; }
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
    setSavedSnapshot(JSON.stringify(DEFAULT_HOME_CONTENT));
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (localPreview || !supabase) {
      setMessage("Sign in to Supabase to change the admin password.");
      return;
    }
    if (newPassword.length < 8) {
      setMessage("Use at least 8 characters for the new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("The new passwords do not match.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setMessage(`Could not change password: ${error.message}`);
        return;
      }
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password changed. Use the new password next time you sign in.");
    } catch (error) {
      setMessage(error instanceof Error ? `Could not change password: ${error.message}` : "Could not change the password. Check your connection and try again.");
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
    previewFrame.current?.contentWindow?.postMessage(draft, window.location.origin);
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
    if (previewOpen || editorMode === "visual") sendPreviewDraft();
  }, [content, previewOpen, editorMode]);

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
      <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)}/></label>
      <button className="admin-button" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
    </form>
    {message && <p className="admin-message" role="status">{message}</p>}</section></main>;

  return <main className="backoffice-app"><aside className="admin-sidebar"><a href="/" className="admin-brand">← View website</a><img src="/images/weskos-logo.webp" alt="Weskos"/><p>BACKOFFICE</p><nav><a className="admin-nav-active" href="#home-editor">⌂ &nbsp; Homepage</a><a href="/#services">↗ &nbsp; View services</a></nav><div className="admin-sidebar-bottom"><span>{localPreview ? "LOCAL PREVIEW" : "SUPABASE ADMIN"}</span>{localPreview ? <a href="/">Exit</a> : <button onClick={signOut}>Sign out</button>}</div></aside>
    <section className="admin-main"><div className="admin-topbar"><div><p className="eyebrow">CONTENT MANAGEMENT</p><h1>Homepage editor</h1><p>Update the first impression your visitors see.</p></div><button className="admin-preview-link" type="button" onClick={() => setPreviewOpen(true)}>Preview website <span>↗</span></button></div>
    <div className="admin-editor-modes" role="group" aria-label="Editing mode"><button type="button" className={editorMode === "manual" ? "is-active" : ""} aria-pressed={editorMode === "manual"} onClick={() => setEditorMode("manual")}>Manual</button><button type="button" className={editorMode === "visual" ? "is-active" : ""} aria-pressed={editorMode === "visual"} onClick={() => setEditorMode("visual")}>Visual</button></div>
    {localPreview && <p className="local-preview-note">Local preview: edits are saved only in this browser. Supabase and live website are untouched.</p>}
    {editorMode === "manual" && <nav className="admin-editor-tabs" role="tablist" aria-label="Homepage sections">{([ ["hero", "Hero"], ["photos", "Photos"], ["copy", "All text"], ["story", "Story"], ["services", "Services"], ["contact", "Contact"], ["account", "Account"] ] as const).map(([tab, label], index) => <button key={tab} type="button" role="tab" id={`editor-tab-${tab}`} aria-selected={activeTab === tab} aria-controls="editor-panel" className={activeTab === tab ? "is-active" : ""} onClick={() => setActiveTab(tab)}><span>{String(index + 1).padStart(2, "0")}</span>{label}</button>)}</nav>}
    {editorMode === "manual" && <div className="admin-tab-content" id="editor-panel" role="tabpanel" aria-labelledby={`editor-tab-${activeTab}`}>
    {activeTab === "hero" && <div className="admin-editor" id="home-editor"><div className="editor-title"><span>01</span><div><h2>Hero section</h2><p>Set the opening clip duration and how often the hero photos change.</p></div></div>
      <label>Hero title<input value={content.heroTitle} onChange={(event) => update("heroTitle", event.target.value)}/></label>
      <label>Rotating phrases <small>One phrase per line · changes every 4 seconds</small><textarea rows={4} value={content.heroPhrases.join("\n")} onChange={(event) => update("heroPhrases", event.target.value.split("\n").map((line) => line.trim()).filter(Boolean))}/></label>
      <label>Supporting text<textarea rows={3} value={content.heroLead} onChange={(event) => update("heroLead", event.target.value)}/></label>
      <div className="media-settings"><label>Opening video duration <small>Seconds before the photo rotation starts</small><span className="number-field"><input type="number" min={0} max={30} value={content.heroVideoDurationSeconds} onChange={(event) => update("heroVideoDurationSeconds", Number(event.target.value))}/><b>sec</b></span></label><label>Hero photo interval <small>Time each photo stays on screen</small><span className="number-field"><input type="number" min={3} max={120} value={content.heroSlideIntervalSeconds} onChange={(event) => update("heroSlideIntervalSeconds", Number(event.target.value))}/><b>sec</b></span></label></div>
      <label>Opening video URL<input value={content.heroVideo} onChange={(event) => update("heroVideo", event.target.value)} placeholder="/images/krui-surf-intro.mp4"/><small>Use a local path or a public Supabase Storage URL. Leave blank to skip the opening video.</small></label>
      {status === "admin" && !localPreview && <label>Replace opening video<input type="file" accept="video/mp4" disabled={busy} onChange={(event) => { void (async () => { const file = event.target.files?.[0]; if (!file) return; setBusy(true); try { const url = await uploadMedia(file, "home"); update("heroVideo", url); setMessage("Opening video uploaded. Save homepage to publish it."); } catch (error) { setMessage(error instanceof Error ? error.message : "Video upload failed."); } finally { setBusy(false); } })(); event.currentTarget.value = ""; }}/></label>}
      <div className="media-manager"><div className="media-manager-heading"><div><b>Hero photos</b><small>Krui landscapes play first, then the surf video and surf photos. The first photo is the video poster.</small></div><label className="media-file-button media-add-button">+ Add photo<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => { void uploadPhoto(event.target.files?.[0], "hero"); event.currentTarget.value = ""; }}/></label></div>
        <div className="media-list">{content.heroImages.map((src, index) => <PhotoRow key={`hero-${index}`} src={src} label="Hero" index={index} count={content.heroImages.length} busy={busy} onUrl={(value) => update("heroImages", content.heroImages.map((photo, i) => i === index ? value : photo))} onMove={(direction) => movePhoto("hero", index, direction)} onRemove={() => update("heroImages", content.heroImages.filter((_, i) => i !== index))} onFile={(file) => void uploadPhoto(file, "hero", index)} allowRemove={content.heroImages.length > 1}/>)}</div>
      </div>
    </div>}
    {activeTab === "photos" && <div className="admin-editor"><div className="editor-title"><span>02</span><div><h2>Website photos</h2><p>Replace, remove, and arrange every other homepage photo.</p></div></div>
      <div className="media-manager"><div className="media-manager-heading"><div><b>Coast, property & location photos</b><small>New photos are added to the homepage photo story.</small></div><label className="media-file-button media-add-button">+ Add photo<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => { void uploadPhoto(event.target.files?.[0], "coastAndLocation"); event.currentTarget.value = ""; }}/></label></div><div className="media-list">{([["apparel", "Krui landscape · 01", content.photos.apparel], ["surfGoods", "Krui landscape · 02", content.photos.surfGoods], ["manifesto", "Coastal feature", content.photos.manifesto], ["storefront", "Weskos location", content.photos.storefront]] as const).map(([area, label, src]) => <PhotoRow key={area} src={src} label={label} index={0} count={1} busy={busy} onUrl={(value) => updatePhoto(area, value)} onMove={() => undefined} onRemove={() => updatePhoto(area, "")} onFile={(file) => void uploadPhoto(file, area)}/>)}</div><div className="media-list">{(content.photos.coastAndLocation ?? []).map((src, index, coastPhotos) => <PhotoRow key={index} src={src} label="Coast & location" index={index} count={coastPhotos.length} busy={busy} onUrl={(value) => updatePhoto("coastAndLocation", coastPhotos.map((photo, i) => i === index ? value : photo))} onMove={(direction) => movePhoto("coastAndLocation", index, direction)} onRemove={() => updatePhoto("coastAndLocation", coastPhotos.filter((_, i) => i !== index))} onFile={(file) => void uploadPhoto(file, "coastAndLocation", index)}/>)}</div><div className="media-add-row"><label className="media-file-button media-add-button">+ Add photo<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => { void uploadPhoto(event.target.files?.[0], "coastAndLocation"); event.currentTarget.value = ""; }}/></label></div></div>
      <div className="media-manager"><div className="media-manager-heading"><div><b>Photo story gallery</b><small>Displayed in order on the homepage.</small></div><label className="media-file-button media-add-button">+ Add photo<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => { void uploadPhoto(event.target.files?.[0], "gallery"); event.currentTarget.value = ""; }}/></label></div>
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
    {activeTab === "account" && <div className="admin-editor"><div className="editor-title"><span>07</span><div><h2>Account password</h2><p>Change the password you use to sign in to this Weskos admin account.</p></div></div>
      {localPreview ? <p className="admin-account-note">Password changes are available after signing in with Supabase. Local preview does not connect to an account.</p> : <form className="admin-form account-password-form" onSubmit={(event) => void changePassword(event)}><label>New password<input type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)}/></label><label>Confirm new password<input type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)}/></label><button className="admin-button" type="submit" disabled={busy}>{busy ? "Changing password…" : "Change password"}</button></form>}
    </div>}
    </div>}
    {editorMode === "visual" && <div className="visual-editor-shell"><aside className="visual-section-panel"><h2>Page sections</h2><p>Drag to change their order. Double-click page text to edit it.</p><div className="visual-section-list">{content.sectionOrder.map((section, index) => <div key={section} className={`visual-section-row ${draggedSection === section ? "is-dragging" : ""}`} draggable onDragStart={(event) => { setDraggedSection(section); event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", section); }} onDragEnd={() => setDraggedSection(null)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const dragged = event.dataTransfer.getData("text/plain") as HomeSection; const from = content.sectionOrder.indexOf(dragged); if (from >= 0) moveSection(from, index); setDraggedSection(null); }}><button type="button" aria-label={`Drag ${SECTION_LABELS[section]}`}>⠿ &nbsp;{SECTION_LABELS[section]}</button><span className="visual-section-actions"><button type="button" aria-label={`Move ${SECTION_LABELS[section]} up`} disabled={index === 0} onClick={() => moveSection(index, index - 1)}>↑</button><button type="button" aria-label={`Move ${SECTION_LABELS[section]} down`} disabled={index === content.sectionOrder.length - 1} onClick={() => moveSection(index, index + 1)}>↓</button></span></div>)}</div></aside><div className="visual-frame-wrap"><iframe ref={visualFrame} src="/?admin-preview=1&visual-edit=1" title="Visual homepage editor" onLoad={sendPreviewDraft}/></div></div>}
    <div className="admin-savebar"><p role="status">{message || (isDirty ? "Unsaved changes" : "All changes saved.")}</p><button className="admin-button" onClick={saveContent} disabled={busy || !isDirty}>{busy ? "Saving…" : "Save homepage"}</button></div>
    </section>{previewOpen && <div className="admin-preview-backdrop" onClick={() => setPreviewOpen(false)}><aside className="admin-preview-drawer" role="dialog" aria-modal="true" aria-label="Homepage preview" onClick={(event) => event.stopPropagation()}><div className="admin-preview-toolbar"><div><b>Homepage preview</b><small>Changes update as you edit.</small></div><div className="admin-preview-controls"><button type="button" className={previewMode === "desktop" ? "is-selected" : ""} onClick={() => setPreviewMode("desktop")}>Desktop</button><button type="button" className={previewMode === "mobile" ? "is-selected" : ""} onClick={() => setPreviewMode("mobile")}>Mobile</button><button type="button" className="admin-preview-close" onClick={() => setPreviewOpen(false)} aria-label="Close preview">×</button></div></div><div className={`admin-preview-viewport admin-preview-${previewMode}`}><iframe ref={previewFrame} src="/?admin-preview=1" title="Live Weskos homepage preview" onLoad={sendPreviewDraft}/></div></aside></div>}</main>;
}
