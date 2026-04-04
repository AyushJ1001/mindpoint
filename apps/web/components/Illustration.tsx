import Image from "next/image";
import { cn } from "@/lib/utils";
import type { StaticImport } from "next/dist/shared/lib/get-img-props";

type RasterSrc = string | StaticImport;

type IllustrationProps = {
  src: RasterSrc;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  decorative?: boolean;
};

export function Illustration({
  src,
  alt,
  className,
  priority,
  sizes,
  decorative,
}: IllustrationProps) {
  return (
    <Image
      src={src}
      alt={decorative ? "" : alt}
      priority={priority}
      sizes={sizes}
      className={cn("h-auto w-full select-none", className)}
    />
  );
}
