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
    return <main className="p-8 text-3xl">Kunne ikke laste album.</main>;
  }

  return (
   <main className="min-h-screen bg-stone-50 p-5">
      <header className="mb-8 text-center">
        <div className="mb-2 text-5xl">📷</div>
        <h1 className="text-4xl font-bold text-stone-900">Familiebilder</h1>
        <p className="mt-2 text-lg text-stone-500">
          Bilder fra familie, turer og små øyeblikk
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {(albums as Album[]).map((album) => (
          <Link
            key={album.id}
            href={`/album/${album.id}`}
            className="overflow-hidden rounded-3xl bg-white shadow-md transition active:scale-95"
          >
            {album.cover_path ? (
              <img
                src={publicImageUrl(album.cover_path)}
                alt=""
                className="h-36 w-full object-cover"
              />
            ) : (
              <div className="flex h-36 items-center justify-center bg-stone-200 text-4xl">
                📁
              </div>
            )}

            <div className="p-3 text-center">
              <div className="text-xl font-bold text-stone-900">
                {album.title}
              </div>
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