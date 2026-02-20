// Sonner toast integration with claymorphism styling (INTR-05)

import { Toaster, toast } from "sonner";

/**
 * ToastProvider — Renders the sonner Toaster with clay theme styling.
 *
 * Place this once at the app root (in App.tsx or layout component).
 * Toast messages rendered via showToast() will appear with clay surface styling.
 */
export function ToastProvider() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        className: "clay-toast",
        style: {
          background: "var(--clay-surface)",
          color: "var(--clay-text)",
          border: "2px solid var(--clay-border)",
          borderRadius: "12px",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.1)",
          fontFamily: "var(--font-body)",
        },
      }}
    />
  );
}

/**
 * showToast — Display a toast notification with optional type styling.
 *
 * @param message - Text content of the toast
 * @param type - 'success' | 'error' | 'info' (default: 'info')
 */
export function showToast(
  message: string,
  type: "success" | "error" | "info" = "info",
) {
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    default:
      toast(message);
  }
}
