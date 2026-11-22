"use client";

import { useEffect, useState } from "react";

type Toast = { id: number; message: string; kind: "info" | "success" | "error" };

export default function BackofficeToastViewport() {
  const [toast, setToast] = useState<Toast | null>(null);
  useEffect(() => {
    let nextId = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const receive = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string; kind?: "info" | "success" | "error" }>).detail;
      if (!detail?.message) return;
      const id = ++nextId;
      setToast({ id, message: detail.message, kind: detail.kind === "error" ? "error" : detail.kind === "info" ? "info" : "success" });
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => setToast((current) => current?.id === id ? null : current), 4200);
    };
    window.addEventListener("weskos-backoffice-toast", receive);
    return () => {
      window.removeEventListener("weskos-backoffice-toast", receive);
      if (timeout) clearTimeout(timeout);
    };
  }, []);
  if (!toast) return null;
  return <div className={`backoffice-toast backoffice-toast-${toast.kind}`} role={toast.kind === "error" ? "alert" : "status"}><span aria-hidden="true">{toast.kind === "error" ? "!" : toast.kind === "info" ? "i" : "✓"}</span>{toast.message}<button type="button" aria-label="Dismiss notification" onClick={() => setToast(null)}>×</button></div>;
}
