import Link from "next/link";
import { supabase, publicImageUrl } from "@/lib/supabase";

export const revalidate = 60;

type Photo = {
  id: string;
  album_id: string;
  title: string | null;
  image_path: string;
};

export default async function PhotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: currentPhoto } = await supabase
    .from("photos")
    .select("id,album_id,title,image_path")
    .eq("id", id)
    .single();

  if (!currentPhoto) {
    return <main className="p-8 text-3xl">Fant ikke bildet.</main>;
  }

  const { data: photos } = await supabase
    .from("photos")
    .select("id,album_id,title,image_path")
    .eq("album_id", currentPhoto.album_id)
    .order("sort_order");

  const list = (photos ?? []) as Photo[];
  const index = list.findIndex((p) => p.id === id);

  const previous = list[index - 1];
  const next = list[index + 1];

  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <div className="flex items-center justify-between p-4">
        <Link
          href={`/album/${currentPhoto.album_id}`}
          className="rounded-2xl bg-white/20 px-5 py-3 text-2xl font-bold"
        >
          ← Tilbake
        </Link>

        <div className="text-xl">
          {index + 1} / {list.length}
        </div>
      </div>

      <div className="flex flex-1 snap-x snap-mandatory overflow-x-auto">
        {list.map((photo) => (
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

      <div className="flex justify-between p-4">
        {previous ? (
          <Link
            href={`/photo/${previous.id}`}
            className="rounded-xl bg-white/20 px-5 py-3 text-xl font-bold"
          >
            ← Forrige
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={`/photo/${next.id}`}
            className="rounded-xl bg-white/20 px-5 py-3 text-xl font-bold"
          >
            Neste →
          </Link>
        ) : (
          <div />
        )}
      </div>
    </main>
  );
}