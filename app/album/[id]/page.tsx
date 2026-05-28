import Link from "next/link";
import { supabase, publicImageUrl } from "@/lib/supabase";

export const revalidate = 60;

type Album = {
  id: string;
  title: string;
  cover_path: string | null;
};

type Photo = {
  id: string;
  title: string | null;
  image_path: string;
  taken_at: string | null;
};

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: album } = await supabase
    .from("albums")
    .select("title,parent_id")
    .eq("id", id)
    .single();

  const { data: subAlbums } = await supabase
    .from("albums")
    .select("id,title,cover_path")
    .eq("parent_id", id)
    .order("sort_order");

  const { data: photos, error } = await supabase
    .from("photos")
    .select("id,title,image_path,taken_at")
    .eq("album_id", id)
    .order("sort_order");

  if (error) {
    return <main className="p-8 text-3xl">Could not load photos.</main>;
  }

  return (
    <main className="min-h-screen bg-stone-50 p-4">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={album?.parent_id ? `/album/${album.parent_id}` : "/"}
          className="rounded-2xl bg-stone-900 px-6 py-4 text-3xl font-bold text-white"
        >
          ← Back
        </Link>

        <h1 className="text-4xl font-bold text-stone-900">
          {album?.title ?? "Album"}
        </h1>
      </div>

      {(subAlbums as Album[]).length > 0 && (
        <>
          <h2 className="mb-4 text-3xl font-bold">Albums</h2>

          <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {(subAlbums as Album[]).map((sub) => (
              <Link
                key={sub.id}
                href={`/album/${sub.id}`}
                className="overflow-hidden rounded-2xl bg-white shadow"
              >
                {sub.cover_path ? (
                  <img
                    src={publicImageUrl(sub.cover_path)}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="aspect-square bg-stone-200" />
                )}

                <div className="p-4 text-center text-2xl font-bold">
                  {sub.title}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      <h2 className="mb-4 text-3xl font-bold">Photos</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {(photos as Photo[]).map((photo) => (
          <a
            key={photo.id}
            href={publicImageUrl(photo.image_path)}
            target="_blank"
            className="overflow-hidden rounded-2xl bg-white shadow"
          >
            <img
              src={publicImageUrl(photo.image_path)}
              alt={photo.title ?? "Family photo"}
              className="aspect-square w-full object-cover"
            />

            {photo.title && (
              <div className="p-3 text-center text-xl font-bold">
                {photo.title}
              </div>
            )}
          </a>
        ))}
      </div>
    </main>
  );
}