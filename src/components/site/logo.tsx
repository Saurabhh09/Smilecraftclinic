import { Link } from "@tanstack/react-router";

import { CLINIC } from "@/lib/clinic";

interface LogoProps {
  className?: string;
  imageClassName?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-7 sm:h-8",
  md: "h-9 sm:h-10 md:h-11 lg:h-12",
  lg: "h-12 sm:h-14 md:h-16",
  xl: "h-16 sm:h-20 md:h-24",
};

export function Logo({ className, imageClassName, size = "md" }: LogoProps) {
  const heightClass = sizeClasses[size];

  return (
    <Link
      to="/"
      className={`inline-flex items-center shrink-0 rounded-md transition-opacity hover:opacity-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className ?? ""}`}
      aria-label={`${CLINIC.name} — Home`}
    >
      <img
        src="/smilecraft-logo.png"
        srcSet="/smilecraft-logo.png 1x, /smilecraft-logo@2x.png 2x"
        alt={CLINIC.name}
        width={300}
        height={97}
        className={`w-auto object-contain select-none shrink-0 transition-all ${heightClass} ${imageClassName ?? ""}`}
        loading="eager"
        decoding="async"
      />
    </Link>
  );
}
