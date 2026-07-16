'use client'

export function TypingIndicator() {
  return (
    <div
      role="status"
      aria-label="Wildcat Navigator is typing"
      aria-live="polite"
      className="flex items-center gap-1.5 px-4 py-3.5"
    >
      <span className="sr-only">Wildcat Navigator is typing…</span>
      <span className="typing-dot" aria-hidden="true" />
      <span className="typing-dot" aria-hidden="true" />
      <span className="typing-dot" aria-hidden="true" />
    </div>
  )
}
