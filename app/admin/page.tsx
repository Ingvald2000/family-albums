"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Album = {
  id: string;
  title: string;
  parent_id: string | null;
  cover_path: string | null;
};

type Photo = {
  id: string;
  album_id: string;
  title: string | null;
  image_path: string;
  taken_at: string | null;
};

const PASSWORD = "family123";
const BUCKET = "family-photos";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [message, setMessage] = useState("");

  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [newAlbumParentId, setNewAlbumParentId] = useState("");

  const [uploadAlbumId, setUploadAlbumId] = useState("");
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoDate, setPhotoDate] = useState("");
  const [file, setFile] = useState<File | null>(null);

  async function loadData() {
    const albumsResult = await supabase
      .from("albums")
      .select("id,title,parent_id,cover_path")
      .order("sort_order");

    const photosResult = await supabase
      .from("photos")
      .select("id,album_id,title,image_path,taken_at")
      .order("created_at", { ascending: false });

    setAlbums(albumsResult.data ?? []);
    setPhotos(photosResult.data ?? []);
  }

  useEffect(() => {
    if (unlocked) loadData();
  }, [unlocked]);

  function unlock() {
    if (password === PASSWORD) {
      setUnlocked(true);
      setMessage("");
    } else {
      setMessage("Wrong password");
    }
  }

  async function createAlbum() {
    if (!newAlbumTitle.trim()) {
      setMessage("Album title is missing");
      return;
    }

    const { error } = await supabase.from("albums").insert({
      title: newAlbumTitle.trim(),
      parent_id: newAlbumParentId || null,
      sort_order: albums.length + 1,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setNewAlbumTitle("");
    setNewAlbumParentId("");
    setMessage("Album created");
    loadData();
  }

  async function renameAlbum(album: Album) {
    const title = prompt("New album name:", album.title);
    if (!title) return;

    const { error } = await supabase
      .from("albums")
      .update({ title })
      .eq("id", album.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Album renamed");
    loadData();
  }

  async function deleteAlbum(album: Album) {
    const ok = confirm(
      `Delete album "${album.title}"?\n\nThis also deletes sub-albums and database photo rows.`
    );
    if (!ok) return;

    const { error } = await supabase.from("albums").delete().eq("id", album.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Album deleted");
    loadData();
  }

  async function uploadPhoto() {
    if (!file || !uploadAlbumId) {
      setMessage("Choose an album and photo first");
      return;
    }

    const safeName = file.name.replaceAll(" ", "-").toLowerCase();
    const path = `${uploadAlbumId}/${Date.now()}-${safeName}`;

    const upload = await supabase.storage.from(BUCKET).upload(path, file);

    if (upload.error) {
      setMessage(upload.error.message);
      return;
    }

    const insert = await supabase.from("photos").insert({
      album_id: uploadAlbumId,
      title: photoTitle || null,
      image_path: path,
      taken_at: photoDate || null,
      sort_order: 1,
    });

    if (insert.error) {
      setMessage(insert.error.message);
      return;
    }

    await supabase
      .from("albums")
      .update({ cover_path: path })
      .eq("id", uploadAlbumId)
      .is("cover_path", null);

    setPhotoTitle("");
    setPhotoDate("");
    setFile(null);
    setMessage("Photo uploaded");
    loadData();
  }

  async function editPhoto(photo: Photo) {
    const title = prompt("Photo title:", photo.title ?? "");
    if (title === null) return;

    const { error } = await supabase
      .from("photos")
      .update({ title })
      .eq("id", photo.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Photo updated");
    loadData();
  }

  async function deletePhoto(photo: Photo) {
    const ok = confirm("Delete this photo?");
    if (!ok) return;

    await supabase.storage.from(BUCKET).remove([photo.image_path]);

    const { error } = await supabase
      .from("photos")
      .delete()
      .eq("id", photo.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Photo deleted");
    loadData();
  }

  async function setCover(photo: Photo) {
    const { error } = await supabase
      .from("albums")
      .update({ cover_path: photo.image_path })
      .eq("id", photo.album_id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Album cover updated");
    loadData();
  }

  function albumName(id: string) {
    return albums.find((a) => a.id === id)?.title ?? "Unknown album";
  }

  if (!unlocked) {
    return (
      <main className="min-h-screen p-8">
        <a
          href="/"
          className="mb-8 inline-block rounded-xl bg-stone-900 px-6 py-4 text-2xl font-bold text-white"
        >
          ← Back to albums
        </a>

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

        {message && <p className="mt-4 text-2xl font-bold">{message}</p>}
      </main>
    );
  }

  return (
    <main className="min-h-screen space-y-10 bg-stone-50 p-6">
      <a
        href="/"
        className="inline-block rounded-xl bg-stone-900 px-6 py-4 text-2xl font-bold text-white"
      >
        ← Back to albums
      </a>

      <h1 className="text-5xl font-bold">Admin</h1>

      <section className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-4 text-3xl font-bold">Create album</h2>

        <input
          placeholder="Album name"
          className="mb-4 w-full rounded-xl border p-4 text-2xl"
          value={newAlbumTitle}
          onChange={(e) => setNewAlbumTitle(e.target.value)}
        />

        <select
          className="mb-4 w-full rounded-xl border p-4 text-2xl"
          value={newAlbumParentId}
          onChange={(e) => setNewAlbumParentId(e.target.value)}
        >
          <option value="">Main album</option>
          {albums.map((album) => (
            <option key={album.id} value={album.id}>
              Sub-album under: {album.title}
            </option>
          ))}
        </select>

        <button
          onClick={createAlbum}
          className="rounded-xl bg-black px-6 py-4 text-2xl font-bold text-white"
        >
          Create album
        </button>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-4 text-3xl font-bold">Upload photo</h2>

        <select
          className="mb-4 w-full rounded-xl border p-4 text-2xl"
          value={uploadAlbumId}
          onChange={(e) => setUploadAlbumId(e.target.value)}
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

      <section className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-4 text-3xl font-bold">Albums</h2>

        <div className="space-y-3">
          {albums.map((album) => (
            <div
              key={album.id}
              className="rounded-xl border p-4 text-xl"
            >
              <div className="font-bold">{album.title}</div>
              <div className="text-stone-500">
                {album.parent_id ? `Sub-album of ${albumName(album.parent_id)}` : "Main album"}
              </div>

              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => renameAlbum(album)}
                  className="rounded-lg bg-stone-200 px-4 py-2 font-bold"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteAlbum(album)}
                  className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-4 text-3xl font-bold">Photos</h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map((photo) => (
            <div key={photo.id} className="overflow-hidden rounded-xl border">
              <img
                src={
                  supabase.storage
                    .from(BUCKET)
                    .getPublicUrl(photo.image_path).data.publicUrl
                }
                alt=""
                className="aspect-square w-full object-cover"
              />

              <div className="space-y-2 p-3">
                <div className="text-lg font-bold">
                  {photo.title || "Untitled"}
                </div>

                <div className="text-sm text-stone-500">
                  {albumName(photo.album_id)}
                </div>

                <button
                  onClick={() => editPhoto(photo)}
                  className="w-full rounded-lg bg-stone-200 px-3 py-2 font-bold"
                >
                  Edit
                </button>

                <button
                  onClick={() => setCover(photo)}
                  className="w-full rounded-lg bg-stone-800 px-3 py-2 font-bold text-white"
                >
                  Set cover
                </button>

                <button
                  onClick={() => deletePhoto(photo)}
                  className="w-full rounded-lg bg-red-600 px-3 py-2 font-bold text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {message && (
        <div className="fixed bottom-4 left-4 right-4 rounded-xl bg-black p-4 text-center text-xl font-bold text-white">
          {message}
        </div>
      )}
    </main>
  );
}