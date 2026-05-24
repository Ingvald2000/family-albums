"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Album = {
  id: string;
  title: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const [albums, setAlbums] = useState<Album[]>([]);
  const [albumTitle, setAlbumTitle] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoDate, setPhotoDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  async function loadAlbums() {
    const { data } = await supabase
      .from("albums")
      .select("id,title")
      .order("sort_order");

    setAlbums(data ?? []);
  }

  useEffect(() => {
    if (unlocked) loadAlbums();
  }, [unlocked]);

  function unlock() {
    if (password === "family123") {
      setUnlocked(true);
    } else {
      setMessage("Wrong password");
    }
  }

  async function createAlbum() {
    setMessage("");

    const { error } = await supabase.from("albums").insert({
      title: albumTitle,
      sort_order: albums.length + 1,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setAlbumTitle("");
    setMessage("Album created");
    loadAlbums();
  }

  async function uploadPhoto() {
    setMessage("");

    if (!file || !selectedAlbum) {
      setMessage("Choose an album and a photo first");
      return;
    }

    const path = `${selectedAlbum}/${Date.now()}-${file.name}`;

    const upload = await supabase.storage
      .from("family-photos")
      .upload(path, file);

    if (upload.error) {
      setMessage(upload.error.message);
      return;
    }

    const insert = await supabase.from("photos").insert({
      album_id: selectedAlbum,
      title: photoTitle,
      image_path: path,
      taken_at: photoDate || null,
      sort_order: 1,
    });

    if (insert.error) {
      setMessage(insert.error.message);
      return;
    }

    setPhotoTitle("");
    setPhotoDate("");
    setFile(null);
    setMessage("Photo uploaded");
  }

  if (!unlocked) {
    return (
      <main className="min-h-screen p-8">
        <h1 className="mb-6 text-4xl font-bold">Admin</h1>

        <input
          type="password"
          placeholder="Password"
          className="mb-4 w-full rounded-xl border p-4 text-2xl"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={unlock}
          className="rounded-xl bg-black px-6 py-4 text-2xl font-bold text-white"
        >
          Open admin
        </button>

        {message && <p className="mt-4 text-2xl">{message}</p>}
      </main>
    );
  }

  return (
    <main className="min-h-screen space-y-10 p-8">
      <h1 className="text-4xl font-bold">Admin</h1>

      <section className="rounded-2xl bg-stone-100 p-6">
        <h2 className="mb-4 text-3xl font-bold">Create album</h2>

        <input
          placeholder="Album title"
          className="mb-4 w-full rounded-xl border p-4 text-2xl"
          value={albumTitle}
          onChange={(e) => setAlbumTitle(e.target.value)}
        />

        <button
          onClick={createAlbum}
          className="rounded-xl bg-black px-6 py-4 text-2xl font-bold text-white"
        >
          Create album
        </button>
      </section>

      <section className="rounded-2xl bg-stone-100 p-6">
        <h2 className="mb-4 text-3xl font-bold">Upload photo</h2>

        <select
          className="mb-4 w-full rounded-xl border p-4 text-2xl"
          value={selectedAlbum}
          onChange={(e) => setSelectedAlbum(e.target.value)}
        >
          <option value="">Choose album</option>
          {albums.map((album) => (
            <option key={album.id} value={album.id}>
              {album.title}
            </option>
          ))}
        </select>

        <input
          placeholder="Photo title"
          className="mb-4 w-full rounded-xl border p-4 text-2xl"
          value={photoTitle}
          onChange={(e) => setPhotoTitle(e.target.value)}
        />

        <input
          type="date"
          className="mb-4 w-full rounded-xl border p-4 text-2xl"
          value={photoDate}
          onChange={(e) => setPhotoDate(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          className="mb-4 w-full text-2xl"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <button
          onClick={uploadPhoto}
          className="rounded-xl bg-black px-6 py-4 text-2xl font-bold text-white"
        >
          Upload photo
        </button>
      </section>

      {message && <p className="text-2xl font-bold">{message}</p>}
    </main>
  );
}