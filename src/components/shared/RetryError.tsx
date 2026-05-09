interface RetryErrorProps {
  message: string;
  onRetry?: () => void;
  align?: "center" | "start";
}

const BUTTON_CLASS =
  "inline-flex items-center justify-center min-w-11 min-h-11 px-4 py-2 rounded-lg bg-clay-surface text-clay-text text-sm font-medium hover:opacity-80 transition-opacity border border-clay-border";

export function RetryError({
  message,
  onRetry,
  align = "center",
}: RetryErrorProps) {
  const isStart = align === "start";
  const wrapperClass = isStart
    ? "flex flex-col items-start gap-3"
    : "text-center py-4";
  const messageClass = isStart
    ? "text-clay-text-muted text-sm"
    : "text-clay-text-muted text-sm mb-3";

  return (
    <div className={wrapperClass} role="alert">
      <p className={messageClass}>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className={BUTTON_CLASS}>
          Try again
        </button>
      )}
    </div>
  );
}
