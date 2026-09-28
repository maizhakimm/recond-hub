/** <Callout title="Tip">…</Callout> inside MDX articles. */
export function Callout({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <aside className="not-prose my-6 rounded-xl border-l-4 border-gold bg-card p-4">
      {title && <p className="mb-1 font-semibold">{title}</p>}
      <div className="text-ink-2 [&>p]:m-0">{children}</div>
    </aside>
  );
}
