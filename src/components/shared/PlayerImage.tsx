import React, { useCallback, useEffect } from "react";
import { getBaseUrl } from "../../utils/baseUrl";

interface PlayerImageProps {
  /** Chinese name of the player (e.g. "张文豪") */
  name: string;
  /** 1 = detail page, 2 = listing/card page */
  variant?: 1 | 2;
  alt?: string;
  className?: string;
  folder?: string;
  fallback?: string;
}

export function PlayerImage({
  name,
  variant = 2,
  alt,
  className = "w-8 h-8 rounded-full mx-auto",
  folder = "player",
  fallback = "pep.png",
}: PlayerImageProps) {
  const base = getBaseUrl();
  const [failed, setFailed] = React.useState(false);

  useEffect(() => {
    setFailed(false);
  }, [name, variant]);

  const cleanName = name.replace("(C)", "").trim();
  const imageSrc = failed
    ? `${base}assets/${folder}/${fallback}`
    : `${base}assets/${folder}/${cleanName}${variant}.png`;

  const handleImgError = useCallback(() => {
    setFailed(true);
  }, []);

  return (
    <img
      src={imageSrc}
      alt={alt ?? cleanName}
      className={className}
      onError={handleImgError}
    />
  );
}
