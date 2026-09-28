import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

/** Simple text page wrapper for About / Privacy / Terms. */
export function ProsePage({ title, path, intro, children }: { title: string; path: string; intro?: string; children: React.ReactNode }) {
  return (
    <div className="container-page max-w-3xl py-6">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: title, href: path },
        ]}
      />
      <h1 className="text-4xl sm:text-5xl">{title}</h1>
      {intro && <p className="mt-2 text-lg text-ink-2">{intro}</p>}
      <div className="prose prose-stone mt-8 max-w-none prose-headings:font-serif prose-a:text-gold-text">{children}</div>
    </div>
  );
}
