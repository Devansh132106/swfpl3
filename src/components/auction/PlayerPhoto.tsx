import { useState } from "react";

import {
  driveImageDirectUrls,
  driveImageProxyUrl,
  extractDriveFileId,
} from "@/lib/auction/drivePhoto";

interface Props {
  photoUrl: string;
  name: string;
  className?: string;
}

export function PlayerPhoto({ photoUrl, name, className = "h-full w-full object-cover" }: Props) {
  const fileId = extractDriveFileId(photoUrl);
  const candidates = fileId
    ? [driveImageProxyUrl(fileId), ...driveImageDirectUrls(fileId)]
    : photoUrl
      ? [photoUrl]
      : [];

  const [index, setIndex] = useState(0);
  const src = candidates[index];

  if (!src) {
    return (
      <div className="grid h-full w-full place-items-center bg-gradient-to-b from-white/10 to-white/5 text-7xl">
        ⚽
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={className}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => {
        if (index < candidates.length - 1) setIndex((i) => i + 1);
      }}
    />
  );
}
