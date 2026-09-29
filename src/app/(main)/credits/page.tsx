import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ProsePage } from "@/components/site/Prose";

export const metadata: Metadata = {
  title: "Photo credits",
  robots: { index: false },
  alternates: { canonical: "/credits" },
};

type Credit = { file: string; title: string; author: string; license: string; source: string };

/** Attribution for the Wikimedia Commons demo photos in /public/photos (required by CC BY / CC BY-SA). */
export default async function CreditsPage() {
  let credits: Credit[] = [];
  try {
    credits = JSON.parse(await readFile(path.join(process.cwd(), "public", "photos", "credits.json"), "utf8"));
  } catch {
    // no demo photos shipped
  }
  return (
    <ProsePage title="Photo credits" path="/credits" intro="Demo photos from Wikimedia Commons, used under their open licences. They illustrate the models and are not our stock.">
      <ul>
        {credits.map((c) => (
          <li key={c.file}>
            <a href={c.source} rel="noopener" target="_blank">
              {c.title}
            </a>{" "}
            by {c.author || "unknown"}, {c.license}
          </li>
        ))}
      </ul>
    </ProsePage>
  );
}
