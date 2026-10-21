"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase, uploadMedia } from "@/lib/supabase";
import { DEFAULT_HOME_CONTENT, HOME_CONTENT_KEY, HOME_CONTENT_STORAGE_KEY, normalizeHomeContent, type HomeContent } from "@/lib/home-content";

type AdminStatus = "checking" | "signed-out" | "demo" | "admin" | "not-admin";
type PhotoArea = "hero" | "gallery" | "apparel" | "surfGoods" | "manifesto" | "storefront" | "boardArtwork";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<HomeContent>(DEFAULT_HOME_CONTENT);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadContent(mode: "demo" | "admin") {
    if (mode === "admin" && supabase) {
      const { data } = await supabase.from("site_content").select("content").eq("id", HOME_CONTENT_KEY).maybeSingle();
      setContent(normalizeHomeContent(data?.content));
    } else {
      const local = localStorage.getItem(HOME_CONTENT_STORAGE_KEY);
      if (local) {
        try { setContent(normalizeHomeContent(JSON.parse(local))); }
        catch { setContent(DEFAULT_HOME_CONTENT); }
      } else setContent(DEFAULT_HOME_CONTENT);
    }
    setStatus(mode);
  }

  async function checkUser(userId: string | undefined) {
    if (!supabase || !userId) { setStatus("signed-out"); return; }
    const { data, error } = await supabase.from("admin_users").select("user_id").eq("user_id", userId).maybeSingle();
    if (error) { setMessage("Could not verify admin access. Run the Supabase setup SQL and add your user as an admin."); setStatus("not-admin"); return; }
    if (!data) { setMessage("This account is signed in but is not on the Weskos admin list."); setStatus("not-admin"); return; }
    await loadContent("admin");
  }

  useEffect(() => {
    if (!supabase) { setStatus("signed-out"); return; }
    void supabase.auth.getSession().then(({ data }) => checkUser(data.session?.user.id));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { void checkUser(session?.user.id); });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setMessage("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else await checkUser(data.user?.id);
    setBusy(false);
  }

  async function signOut() {
    if (status === "demo") { setStatus("signed-out"); setContent(DEFAULT_HOME_CONTENT); return; }
    await supabase?.auth.signOut();
    setStatus("signed-out"); setContent(DEFAULT_HOME_CONTENT);
  }

  async function saveContent() {
    setBusy(true); setMessage("");
    if (status === "demo") {
      localStorage.setItem(HOME_CONTENT_STORAGE_KEY, JSON.stringify(content));
      setMessage("Saved to this browser's demo preview. Add Supabase keys to save content for all visitors.");
    } else if (status === "admin" && supabase) {
      const { error } = await supabase.from("site_content").upsert({ id: HOME_CONTENT_KEY, content, updated_at: new Date().toISOString() });
      setMessage(error ? `Could not save: ${error.message}` : "Homepage saved to Supabase.");
    }
    setBusy(false);
  }

  async function uploadPhoto(file: File | undefined, area: PhotoArea, index?: number) {
    if (!file) return;
    setBusy(true); setMessage("");
    try {
      let photoUrl: string;
      if (status === "admin") {
        photoUrl = await uploadMedia(file, "home");
      } else {
        if (file.size > 1_400_000) throw new Error("Demo uploads are limited to 1.4 MB per image. Connect Supabase for larger files.");
        photoUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read the selected image."));
          reader.onerror = () => reject(new Error("Could not read the selected image."));
          reader.readAsDataURL(file);
        });
        if (JSON.stringify(content).length + photoUrl.length > 2_200_000) throw new Error("Demo photo storage is full. Connect Supabase Storage for more images.");
      }
      if (area === "hero") update("heroImages", index === undefined ? [...content.heroImages, photoUrl] : content.heroImages.map((photo, i) => i === index ? photoUrl : photo));
      else if (area === "gallery") updatePhoto("gallery", index === undefined ? [...content.photos.gallery, photoUrl] : content.photos.gallery.map((photo, i) => i === index ? photoUrl : photo));
      else updatePhoto(area, photoUrl);
      setMessage("Photo updated. Save homepage to publish your changes.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed. Check your storage settings.");
    }
    setBusy(false);
  }

  const update = <K extends keyof HomeContent>(field: K, value: HomeContent[K]) => setContent((current) => ({ ...current, [field]: value }));
  const updatePhoto = <K extends keyof HomeContent["photos"]>(field: K, value: HomeContent["photos"][K]) => setContent((current) => ({ ...current, photos: { ...current.photos, [field]: value } }));
  const movePhoto = (area: "hero" | "gallery", index: number, direction: -1 | 1) => {
    const field = area === "hero" ? "heroImages" : "gallery";
    const photos = [...(area === "hero" ? content.heroImages : content.photos.gallery)];
    const target = index + direction;
    if (target < 0 || target >= photos.length) return;
    [photos[index], photos[target]] = [photos[target], photos[index]];
    if (area === "hero") update("heroImages", photos); else updatePhoto("gallery", photos);
  };

  if (status === "checking") return <main className="backoffice-shell"><div className="backoffice-loading">Loading Weskos backoffice…</div></main>;
  if (status === "signed-out" || status === "not-admin") return <main className="backoffice-shell"><section className="login-card"><a className="admin-brand" href="/">← Back to Weskos</a><img src="/images/weskos-logo.png" alt="Weskos"/><p className="eyebrow">WESKOS LEGAL & REAL ESTATE · PRIVATE AREA</p><h1>Welcome back.</h1><p className="login-copy">Sign in to update the Weskos homepage and service imagery.</p>
    {supabase ? <form className="admin-form" onSubmit={signIn}><label>Email address<input autoComplete="username" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com"/></label><label>Password<input autoComplete="current-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password"/></label><button className="admin-button" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form> : <div className="demo-notice"><b>Supabase is not connected yet</b><p>No credentials are stored in the project. You can test the CMS in demo mode; changes stay in this browser only.</p><button className="admin-button" onClick={() => void loadContent("demo")}>Open demo editor</button></div>}
    {message && <p className="admin-message" role="status">{message}</p>}{supabase && <p className="auth-note">Admin accounts are added in Supabase Auth, then approved in the admin list.</p>}</section></main>;

  return <main className="backoffice-app"><aside className="admin-sidebar"><a href="/" className="admin-brand">← View website</a><img src="/images/weskos-logo.png" alt="Weskos"/><p>BACKOFFICE</p><nav><a className="admin-nav-active" href="#home-editor">⌂ &nbsp; Homepage</a><a href="/#services">↗ &nbsp; View services</a></nav><div className="admin-sidebar-bottom"><span>{status === "demo" ? "DEMO PREVIEW" : "SUPABASE ADMIN"}</span><button onClick={signOut}>Sign out</button></div></aside>
    <section className="admin-main"><div className="admin-topbar"><div><p className="eyebrow">CONTENT MANAGEMENT</p><h1>Homepage editor</h1><p>Update the first impression your visitors see.</p></div><a className="admin-preview-link" href="/">Preview website <span>↗</span></a></div>
    {status === "demo" && <div className="demo-banner"><span>Demo mode</span> Edits save to this browser only. Connect Supabase when you are ready to publish changes.</div>}
    <div className="admin-editor" id="home-editor"><div className="editor-title"><span>01</span><div><h2>Hero section</h2><p>Set the opening clip duration and how often the hero photos change.</p></div></div>
      <label>Hero title<input value={content.heroTitle} onChange={(event) => update("heroTitle", event.target.value)}/></label>
      <label>Rotating phrases <small>One phrase per line · changes every 4 seconds</small><textarea rows={4} value={content.heroPhrases.join("\n")} onChange={(event) => update("heroPhrases", event.target.value.split("\n").map((line) => line.trim()).filter(Boolean))}/></label>
      <label>Supporting text<textarea rows={3} value={content.heroLead} onChange={(event) => update("heroLead", event.target.value)}/></label>
      <div className="media-settings"><label>Opening video duration <small>Seconds before the photo rotation starts</small><span className="number-field"><input type="number" min={0} max={30} value={content.heroVideoDurationSeconds} onChange={(event) => update("heroVideoDurationSeconds", Number(event.target.value))}/><b>sec</b></span></label><label>Hero photo interval <small>Time each photo stays on screen</small><span className="number-field"><input type="number" min={3} max={120} value={content.heroSlideIntervalSeconds} onChange={(event) => update("heroSlideIntervalSeconds", Number(event.target.value))}/><b>sec</b></span></label></div>
      <label>Opening video URL<input value={content.heroVideo} onChange={(event) => update("heroVideo", event.target.value)} placeholder="/images/krui-surf-intro.mp4"/><small>Use a local path or a public Supabase Storage URL. Leave blank to skip the opening video.</small></label>
      {status === "admin" && <label>Replace opening video<input type="file" accept="video/mp4" disabled={busy} onChange={(event) => { void (async () => { const file = event.target.files?.[0]; if (!file) return; setBusy(true); try { const url = await uploadMedia(file, "home"); update("heroVideo", url); setMessage("Opening video uploaded. Save homepage to publish it."); } catch (error) { setMessage(error instanceof Error ? error.message : "Video upload failed."); } finally { setBusy(false); } })(); event.currentTarget.value = ""; }}/></label>}
      <div className="media-manager"><div className="media-manager-heading"><div><b>Hero photos</b><small>Drag order with arrows. The first photo is the video poster.</small></div><label className="media-file-button media-add-button">+ Add photo<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => { void uploadPhoto(event.target.files?.[0], "hero"); event.currentTarget.value = ""; }}/></label></div>
        <div className="media-list">{content.heroImages.map((src, index) => <PhotoRow key={`hero-${index}`} src={src} label="Hero" index={index} count={content.heroImages.length} busy={busy} onUrl={(value) => update("heroImages", content.heroImages.map((photo, i) => i === index ? value : photo))} onMove={(direction) => movePhoto("hero", index, direction)} onRemove={() => update("heroImages", content.heroImages.filter((_, i) => i !== index))} onFile={(file) => void uploadPhoto(file, "hero", index)} allowRemove={content.heroImages.length > 1}/>)}</div>
      </div>
    </div>
    <div className="admin-editor"><div className="editor-title"><span>02</span><div><h2>Website photos</h2><p>Replace, remove, and arrange every other homepage photo.</p></div></div>
      <div className="media-manager"><div className="media-manager-heading"><div><b>Coast, property & location photos</b><small>These images appear in the landscape collage, feature section, or contact section.</small></div></div><div className="media-list">{([["apparel", "Krui landscape · 01", content.photos.apparel], ["surfGoods", "Krui landscape · 02", content.photos.surfGoods], ["manifesto", "Coastal feature", content.photos.manifesto], ["storefront", "Weskos location", content.photos.storefront]] as const).map(([area, label, src]) => <PhotoRow key={area} src={src} label={label} index={0} count={1} busy={busy} onUrl={(value) => updatePhoto(area, value)} onMove={() => undefined} onRemove={() => updatePhoto(area, "")} onFile={(file) => void uploadPhoto(file, area)}/>)}</div></div>
      <div className="media-manager"><div className="media-manager-heading"><div><b>Photo story gallery</b><small>Displayed in order on the homepage.</small></div><label className="media-file-button media-add-button">+ Add photo<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => { void uploadPhoto(event.target.files?.[0], "gallery"); event.currentTarget.value = ""; }}/></label></div>
        <div className="media-list">{content.photos.gallery.map((src, index) => <PhotoRow key={`gallery-${index}`} src={src} label="Gallery" index={index} count={content.photos.gallery.length} busy={busy} onUrl={(value) => updatePhoto("gallery", content.photos.gallery.map((photo, i) => i === index ? value : photo))} onMove={(direction) => movePhoto("gallery", index, direction)} onRemove={() => updatePhoto("gallery", content.photos.gallery.filter((_, i) => i !== index))} onFile={(file) => void uploadPhoto(file, "gallery", index)}/>)}</div>
      </div>
      {status === "demo" && <p className="upload-demo-note">Demo uploads are stored in this browser (up to 1.4 MB per image). For larger files and shared publishing, connect Supabase Storage.</p>}
    </div>
    <div className="admin-editor"><div className="editor-title"><span>03</span><div><h2>Our story</h2><p>Keep the introduction short and personal.</p></div></div><label>Section headline<input value={content.introTitle} onChange={(event) => update("introTitle", event.target.value)}/></label><label>Section description<textarea rows={4} value={content.introBody} onChange={(event) => update("introBody", event.target.value)}/></label></div>
    <div className="admin-savebar"><p role="status">{message}</p><button className="admin-button" onClick={saveContent} disabled={busy}>{busy ? "Saving…" : "Save homepage"}</button></div>
    </section></main>;
}
