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
  return <Image src={src} alt={alt} unoptimized={src.endsWith(".svg")} {...rest} />;
}
