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
   <main className="min-h-screen bg-stone-100 px-4 py-6">
  <header className="mx-auto mb-8 max-w-5xl">
  <div className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-stone-200">
    <div className="mb-3 text-8xl">📷</div>

    <h1 className="text-5xl font-extrabold tracking-tight text-stone-900">
      Familiebilder
    </h1>

    <p className="mt-2 text-lg text-stone-500">
      Bilder fra familie, turer og små øyeblikk
    </p>
  </div>
</header>

  <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
    {(albums as Album[]).map((album) => (
      <Link
        key={album.id}
        href={`/album/${album.id}`}
        className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-200 transition-all duration-300 hover:shadow-lg active:scale-95"
      >
        {album.cover_path ? (
          <img
            src={publicImageUrl(album.cover_path)}
            alt=""
            className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-36 items-center justify-center bg-stone-200 text-4xl">
            📁
          </div>
        )}

        <div className="p-4">
          <h2 className="truncate text-lg font-semibold text-stone-900">
            {album.title}
          </h2>

            <p className="mt-1 text-sm text-stone-500">
                  Trykk for å åpne
            </p>
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