import type { ReactNode } from "react";
import BackofficeToastViewport from "./toast-viewport";

export default function BackofficeLayout({ children }: { children: ReactNode }) {
  return <>{children}<BackofficeToastViewport/></>;
}
