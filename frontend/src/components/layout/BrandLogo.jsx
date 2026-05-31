import { BRAND_NAME } from "../../constants/brand";

export function BrandLogo({ compact = false, inverse = false }) {
  return (
    <div className="flex items-center">
      <div
        className={`shrink-0 ${
          compact ? "h-16 w-auto" : "h-24 w-auto"
        }`}
      >
        <img
          src="/flowos-logo.png"
          alt={BRAND_NAME}
          className="h-full w-auto object-contain"
        />
      </div>
    </div>
  );
}