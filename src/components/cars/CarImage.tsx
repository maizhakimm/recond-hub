import Image, { type ImageProps } from "next/image";

/**
 * All car photos go through next/image (AVIF/WebP, resized, cached on Vercel), so visitors never hit
 * Google Drive directly. Local SVG placeholders are served as-is.
 */
export function CarImage({ src, alt, ...rest }: Omit<ImageProps, "src"> & { src?: string }) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-paper-2 text-sm text-muted" role="img" aria-label={alt}>
        Photo coming soon
      </div>
    );
  }
  const img = <Image src={src} alt={alt} unoptimized={src.endsWith(".svg")} {...rest} />;
  // Wikimedia Commons demo photos: labelled so nobody mistakes them for real stock. Credits at /credits.
  if (!src.startsWith("/photos/")) return img;
  return (
    <>
      {img}
      <span className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">Demo photo</span>
    </>
  );
}
