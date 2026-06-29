"use client";

import { useEffect, useRef } from "react";
import { publicImageUrl } from "@/lib/supabase";

type Photo = {
  id: string;
  album_id: string;
  title: string | null;
  image_path: string;
};

export default function PhotoViewer({
  photos,
  startIndex,
}: {
  photos: Photo[];
  startIndex: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      left: container.clientWidth * startIndex,
      behavior: "instant",
    });
  }, [startIndex]);

  return (
    <div
      ref={containerRef}
      className="flex flex-1 snap-x snap-mandatory overflow-x-auto"
    >
      {photos.map((photo) => (
        <section
          key={photo.id}
          className="flex min-w-full snap-center flex-col items-center justify-center p-4"
        >
          <img
            src={publicImageUrl(photo.image_path)}
            alt={photo.title ?? "Familiebilde"}
            className="max-h-[75vh] max-w-full object-contain"
          />

          {photo.title && (
            <div className="mt-4 text-center text-2xl font-bold">
              {photo.title}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}