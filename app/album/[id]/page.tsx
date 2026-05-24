import Link from "next/link";
import { supabase, publicImageUrl } from "@/lib/supabase";

export const revalidate = 60;

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
    .select("title")
    .eq("id", id)
    .single();

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
          href="/"
          className="rounded-2xl bg-stone-900 px-6 py-4 text-3xl font-bold text-white"
        >
          ← Back
        </Link>

        <h1 className="text-4xl font-bold text-stone-900">
          {album?.title ?? "Album"}
        </h1>
      </div>

      <div className="snap-x snap-mandatory overflow-x-auto whitespace-nowrap">
        {(photos as Photo[]).map((photo) => (
          <section
            key={photo.id}
            className="inline-flex h-[82vh] w-full snap-center flex-col items-center justify-center p-2"
          >
            <img
              src={publicImageUrl(photo.image_path)}
              alt={photo.title ?? "Family photo"}
              className="max-h-[70vh] max-w-full rounded-3xl object-contain shadow-lg"
            />

            <div className="mt-4 text-center text-3xl font-semibold text-stone-900">
              {photo.title}
            </div>

            {photo.taken_at && (
              <div className="mt-2 text-center text-2xl text-stone-600">
                {new Date(photo.taken_at).toLocaleDateString()}
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}