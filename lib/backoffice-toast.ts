export type BackofficeToastKind = "info" | "success" | "error";

export function showBackofficeToast(message: string, kind: BackofficeToastKind) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("weskos-backoffice-toast", { detail: { message, kind } }));
}
