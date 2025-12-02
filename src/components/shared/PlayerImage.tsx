import React, { useCallback, useEffect } from "react";
import { getBaseUrl } from "../../utils/baseUrl";

interface PlayerImageProps {
  filename: string;
  alt?: string;
  className?: string;
  /**
   * The folder under assets/ where the image is located.
   * Defaults to "player".
   */
  folder?: string;
  /**
   * The fallback image path (relative to assets/) when both jpg and png fail.
   * Defaults to "cat.jpg".
   */
  fallback?: string;
}

/**
 * A reusable player image component that handles:
 * - Trying .jpg first, then .png
 * - Falling back to a default image if both fail
 */
export function PlayerImage({
  filename,
  alt,
  className = "w-8 h-8 rounded-full mx-auto",
  folder = "player",
  fallback = "cat.jpg",
}: PlayerImageProps) {
  const base = getBaseUrl();
  const [imgExt, setImgExt] = React.useState<"jpg" | "png">("jpg");

  // Reset extension to 'jpg' when filename changes
  useEffect(() => {
    setImgExt("jpg");
  }, [filename]);

  const imageSrc = `${base}assets/${folder}/${filename}.${imgExt}`;

  const handleImgError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (imgExt === "jpg") {
        setImgExt("png");
      } else {
        e.currentTarget.src = `${base}assets/${fallback}`;
      }
    },
    [imgExt, base, fallback]
  );

  return (
    <img
      src={imageSrc}
      alt={alt ?? filename}
      className={className}
      onError={handleImgError}
    />
  );
}
