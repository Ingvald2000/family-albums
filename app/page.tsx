import Link from "next/link";
import { supabase, publicImageUrl } from "@/lib/supabase";

export const revalidate = 60;

type Album = {
  id: string;
  title: string;
  cover_path: string | null;
};

export default async function HomePage() {
  const { data: albums, error } = await supabase
    .from("albums")
    .select("id,title,cover_path")
    .is("parent_id", null)
    .order("sort_order");

  if (error) {
    return <main className="p-8 text-3xl">Could not load albums.</main>;
  }

  return (
    <main className="min-h-screen bg-stone-50 p-6">
      <h1 className="mb-8 text-center text-5xl font-bold text-stone-900">
        Family Photos
      </h1>

      <div className="grid gap-6 sm:grid-cols-2">
        {(albums as Album[]).map((album) => (
          <Link
            key={album.id}
            href={`/album/${album.id}`}
            className="overflow-hidden rounded-3xl bg-white shadow-lg active:scale-95"
          >
            {album.cover_path ? (
              <img
                src={publicImageUrl(album.cover_path)}
                alt=""
                className="h-56 w-full object-cover"
              />
            ) : (
              <div className="h-56 bg-stone-200" />
            )}

            <div className="p-6 text-center text-4xl font-bold text-stone-900">
              {album.title}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-center">
        <a href="/admin" className="text-sm text-stone-400">
          Admin
        </a>
      </div>
    </main>
  );
}
