/**
 * VisuallyHidden Component
 * Hides content visually but keeps it accessible to screen readers.
 * Useful for Dialog titles and labels that may not need visual display.
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <div className="sr-only">
      {children}
    </div>
  )
}
