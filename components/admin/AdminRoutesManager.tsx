"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { z } from "zod";
import { routeInputSchema, type RouteInput, type RouteRecord } from "@/app/lib/tramassso-content";
import CloudinaryUploader from "@/components/admin/CloudinaryUploader";

interface AdminRoutesManagerProps {
  initialRoutes: RouteRecord[];
}

const emptyValues: RouteInput = {
  title: "",
  description: "",
  start_point: "",
  end_point: "",
  distance_km: 0,
  drive_time_minutes: 0,
  cover_image_url: "",
  gallery_urls: [],
};

export default function AdminRoutesManager({ initialRoutes }: AdminRoutesManagerProps) {
  const [routes, setRoutes] = useState<RouteRecord[]>(initialRoutes);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedRoute = useMemo(
    () => routes.find((route) => route.id === selectedId) ?? null,
    [routes, selectedId],
  );

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<z.input<typeof routeInputSchema>, undefined, z.output<typeof routeInputSchema>>({
    resolver: zodResolver(routeInputSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!selectedRoute) {
      reset(emptyValues);
      return;
    }

    reset({
      title: selectedRoute.title,
      description: selectedRoute.description,
      start_point: selectedRoute.start_point,
      end_point: selectedRoute.end_point,
      distance_km: selectedRoute.distance_km,
      drive_time_minutes: selectedRoute.drive_time_minutes,
      cover_image_url: selectedRoute.cover_image_url ?? "",
      gallery_urls: selectedRoute.gallery_urls,
    });
  }, [reset, selectedRoute]);

  const coverImageUrl = watch("cover_image_url");
  const galleryUrls = watch("gallery_urls") ?? [];

  const saveRoute = async (values: RouteInput) => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/content", {
        method: selectedId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind: "routes",
          id: selectedId,
          payload: values,
        }),
      });

      const data: { item?: RouteRecord; error?: string } = await response.json();

      if (!response.ok || !data.item) {
        throw new Error(data.error ?? "Unable to save route");
      }

      setRoutes((current) => {
        const filtered = current.filter((route) => route.id !== data.item?.id);
        return [data.item as RouteRecord, ...filtered].sort((left, right) => right.created_at.localeCompare(left.created_at));
      });
      setSelectedId(null);
      reset(emptyValues);
      setMessage("Route saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save route");
    } finally {
      setSaving(false);
    }
  };

  const deleteRoute = async (id: string) => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/content", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind: "routes",
          id,
        }),
      });

      const data: { success?: boolean; error?: string } = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Unable to delete route");
      }

      setRoutes((current) => current.filter((route) => route.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
      }
      setMessage("Route deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete route");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5 shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.45em] text-zinc-500">Routes</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-50">Route inventory</h2>
          </div>
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="rounded-full border border-zinc-800 px-4 py-2 text-xs uppercase tracking-[0.28em] text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            New route
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-800">
          <table className="min-w-full divide-y divide-zinc-800 text-sm">
            <thead className="bg-zinc-900/70 text-left text-[10px] uppercase tracking-[0.35em] text-zinc-500">
              <tr>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Distance</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 bg-black/20">
              {routes.map((route) => (
                <tr key={route.id} className="align-top">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                        {route.cover_image_url ? (
                          <Image src={route.cover_image_url} alt={route.title} fill className="object-cover" sizes="56px" />
                        ) : null}
                      </div>
                      <div>
                        <div className="font-medium text-zinc-50">{route.title}</div>
                        <div className="max-w-[22rem] text-xs text-zinc-500 line-clamp-2">{route.start_point} → {route.end_point}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-zinc-300">{route.distance_km} km</td>
                  <td className="px-4 py-4 text-zinc-300">{route.drive_time_minutes} min</td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedId(route.id)}
                        className="rounded-full border border-zinc-800 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-zinc-300 transition hover:border-white hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteRoute(route.id)}
                        className="rounded-full border border-zinc-800 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-zinc-300 transition hover:border-red-500 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(saveRoute)}
        className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5 shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
      >
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-[0.45em] text-zinc-500">Create / Edit</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-50">Route form</h2>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Title</span>
            <input {...register("title")} className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-50 outline-none transition focus:border-zinc-400" />
            {errors.title ? <span className="text-xs text-red-400">{errors.title.message}</span> : null}
          </label>

          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Description</span>
            <textarea {...register("description")} rows={6} className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-50 outline-none transition focus:border-zinc-400" />
            {errors.description ? <span className="text-xs text-red-400">{errors.description.message}</span> : null}
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Start point</span>
              <input {...register("start_point")} className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-50 outline-none transition focus:border-zinc-400" />
              {errors.start_point ? <span className="text-xs text-red-400">{errors.start_point.message}</span> : null}
            </label>

            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">End point</span>
              <input {...register("end_point")} className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-50 outline-none transition focus:border-zinc-400" />
              {errors.end_point ? <span className="text-xs text-red-400">{errors.end_point.message}</span> : null}
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Distance km</span>
              <input type="number" step="0.1" {...register("distance_km")} className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-50 outline-none transition focus:border-zinc-400" />
              {errors.distance_km ? <span className="text-xs text-red-400">{errors.distance_km.message}</span> : null}
            </label>

            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Drive time minutes</span>
              <input type="number" {...register("drive_time_minutes")} className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-50 outline-none transition focus:border-zinc-400" />
              {errors.drive_time_minutes ? <span className="text-xs text-red-400">{errors.drive_time_minutes.message}</span> : null}
            </label>
          </div>

          <div className="grid gap-3">
            <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Cover image</span>
            <input
              {...register("cover_image_url")}
              placeholder="Cloudinary secure URL"
              className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-50 outline-none transition focus:border-zinc-400"
            />
            <div className="flex flex-wrap gap-3">
              <CloudinaryUploader label="Upload cover" onUploadComplete={(url) => setValue("cover_image_url", url, { shouldDirty: true, shouldValidate: true })} />
              <button
                type="button"
                onClick={() => setValue("cover_image_url", "", { shouldDirty: true, shouldValidate: true })}
                className="rounded-2xl border border-zinc-800 px-4 py-2 text-xs uppercase tracking-[0.28em] text-zinc-400 transition hover:border-zinc-500 hover:text-white"
              >
                Clear
              </button>
            </div>
            {coverImageUrl ? (
              <div className="relative h-48 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
                <Image src={coverImageUrl} alt="Route cover preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 40vw" />
              </div>
            ) : null}
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Gallery</span>
              <CloudinaryUploader
                label="Add photo"
                multiple
                onUploadComplete={(url) => {
                  setValue("gallery_urls", [...galleryUrls, url], { shouldDirty: true, shouldValidate: true });
                }}
              />
            </div>
            <div className="grid gap-2">
              {galleryUrls.length > 0 ? (
                galleryUrls.map((url) => (
                  <div key={url} className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-black/30 px-4 py-2 text-xs text-zinc-300">
                    <span className="truncate">{url}</span>
                    <button
                      type="button"
                      onClick={() => setValue("gallery_urls", galleryUrls.filter((item) => item !== url), { shouldDirty: true, shouldValidate: true })}
                      className="text-zinc-500 transition hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-800 px-4 py-5 text-xs uppercase tracking-[0.3em] text-zinc-600">
                  No gallery images yet
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-white px-5 py-3 text-xs font-medium uppercase tracking-[0.32em] text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving" : selectedId ? "Update route" : "Create route"}
            </button>
            <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">{message ?? "Ready"}</span>
          </div>
        </div>
      </form>
    </section>
  );
}