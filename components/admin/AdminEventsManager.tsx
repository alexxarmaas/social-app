"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { eventInputSchema, type EventInput, type EventRecord } from "@/app/lib/tramassso-content";
import CloudinaryUploader from "@/components/admin/CloudinaryUploader";

interface AdminEventsManagerProps {
  initialEvents: EventRecord[];
}

const emptyValues: EventInput = {
  title: "",
  description: "",
  date: "",
  location: "",
  cover_image_url: "",
  gallery_urls: [],
};

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 16);
}

export default function AdminEventsManager({ initialEvents }: AdminEventsManagerProps) {
  const [events, setEvents] = useState<EventRecord[]>(initialEvents);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedId) ?? null,
    [events, selectedId],
  );

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<EventInput>({
    resolver: zodResolver(eventInputSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!selectedEvent) {
      reset(emptyValues);
      return;
    }

    reset({
      title: selectedEvent.title,
      description: selectedEvent.description,
      date: toDateTimeLocalValue(selectedEvent.date),
      location: selectedEvent.location,
      cover_image_url: selectedEvent.cover_image_url ?? "",
      gallery_urls: selectedEvent.gallery_urls,
    });
  }, [reset, selectedEvent]);

  const coverImageUrl = watch("cover_image_url");
  const galleryUrls = watch("gallery_urls") ?? [];

  const saveEvent = async (values: EventInput) => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/content", {
        method: selectedId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind: "events",
          id: selectedId,
          payload: values,
        }),
      });

      const data: { item?: EventRecord; error?: string } = await response.json();

      if (!response.ok || !data.item) {
        throw new Error(data.error ?? "No se pudo guardar el evento.");
      }

      setEvents((current) => {
        const filtered = current.filter((event) => event.id !== data.item?.id);
        return [data.item as EventRecord, ...filtered].sort((left, right) => right.date.localeCompare(left.date));
      });
      setSelectedId(null);
      reset(emptyValues);
      setMessage("Evento guardado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar el evento.");
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (id: string) => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/content", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind: "events",
          id,
        }),
      });

      const data: { success?: boolean; error?: string } = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "No se pudo eliminar el evento.");
      }

      setEvents((current) => current.filter((event) => event.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
      }
      setMessage("Evento eliminado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo eliminar el evento.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5 shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.45em] text-zinc-500">Eventos</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-50">Inventario de eventos</h2>
          </div>
          <button type="button" onClick={() => setSelectedId(null)} className="rounded-full border border-zinc-800 px-4 py-2 text-xs uppercase tracking-[0.28em] text-zinc-300 transition hover:border-zinc-500 hover:text-white">
            Nuevo evento
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-800">
          <table className="min-w-full divide-y divide-zinc-800 text-sm">
            <thead className="bg-zinc-900/70 text-left text-[10px] uppercase tracking-[0.35em] text-zinc-500">
              <tr>
                <th className="px-4 py-3">Evento</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Ubicación</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 bg-black/20">
              {events.map((event) => (
                <tr key={event.id} className="align-top">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                        {event.cover_image_url ? (
                          <Image src={event.cover_image_url} alt={event.title} fill className="object-cover" sizes="56px" />
                        ) : null}
                      </div>
                      <div>
                        <div className="font-medium text-zinc-50">{event.title}</div>
                        <div className="max-w-[22rem] text-xs text-zinc-500 line-clamp-2">{event.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-zinc-300">{new Date(event.date).toLocaleString("es-ES")}</td>
                  <td className="px-4 py-4 text-zinc-300">{event.location}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button type="button" onClick={() => setSelectedId(event.id)} className="rounded-full border border-zinc-800 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-zinc-300 transition hover:border-white hover:text-white">
                        Editar
                      </button>
                      <button type="button" onClick={() => void deleteEvent(event.id)} className="rounded-full border border-zinc-800 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-zinc-300 transition hover:border-red-500 hover:text-red-300">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!events.length ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-xs uppercase tracking-[0.3em] text-zinc-600">
                    No hay eventos todavía
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <form onSubmit={handleSubmit(saveEvent)} className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5 shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-[0.45em] text-zinc-500">Crear / editar</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-50">Formulario de evento</h2>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Título</span>
            <input {...register("title")} className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-50 outline-none transition focus:border-zinc-400" />
            {errors.title ? <span className="text-xs text-red-400">{errors.title.message}</span> : null}
          </label>

          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Descripción</span>
            <textarea {...register("description")} rows={6} className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-50 outline-none transition focus:border-zinc-400" />
            {errors.description ? <span className="text-xs text-red-400">{errors.description.message}</span> : null}
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Fecha</span>
              <input type="datetime-local" {...register("date")} className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-50 outline-none transition focus:border-zinc-400" />
              {errors.date ? <span className="text-xs text-red-400">{errors.date.message}</span> : null}
            </label>

            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Ubicación</span>
              <input {...register("location")} className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-50 outline-none transition focus:border-zinc-400" />
              {errors.location ? <span className="text-xs text-red-400">{errors.location.message}</span> : null}
            </label>
          </div>

          <div className="grid gap-3">
            <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Imagen principal</span>
            <input {...register("cover_image_url")} placeholder="URL segura de Cloudinary" className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-50 outline-none transition focus:border-zinc-400" />
            <div className="flex flex-wrap gap-3">
              <CloudinaryUploader label="Subir portada" onUploadComplete={(url) => setValue("cover_image_url", url, { shouldDirty: true, shouldValidate: true })} />
              <button type="button" onClick={() => setValue("cover_image_url", "", { shouldDirty: true, shouldValidate: true })} className="rounded-2xl border border-zinc-800 px-4 py-2 text-xs uppercase tracking-[0.28em] text-zinc-400 transition hover:border-zinc-500 hover:text-white">
                Limpiar
              </button>
            </div>
            {coverImageUrl ? (
              <div className="relative h-48 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
                <Image src={coverImageUrl} alt="Vista previa de la portada" fill className="object-cover" sizes="(max-width: 768px) 100vw, 40vw" />
              </div>
            ) : null}
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Galería</span>
              <CloudinaryUploader label="Añadir foto" multiple onUploadComplete={(url) => setValue("gallery_urls", [...galleryUrls, url], { shouldDirty: true, shouldValidate: true })} />
            </div>
            <div className="grid gap-2">
              {galleryUrls.length > 0 ? (
                galleryUrls.map((url) => (
                  <div key={url} className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-black/30 px-4 py-2 text-xs text-zinc-300">
                    <span className="truncate">{url}</span>
                    <button type="button" onClick={() => setValue("gallery_urls", galleryUrls.filter((item) => item !== url), { shouldDirty: true, shouldValidate: true })} className="text-zinc-500 transition hover:text-red-300">
                      Quitar
                    </button>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-800 px-4 py-5 text-xs uppercase tracking-[0.3em] text-zinc-600">
                  Aún no hay imágenes en la galería
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving} className="rounded-full bg-white px-5 py-3 text-xs font-medium uppercase tracking-[0.32em] text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? "Guardando" : selectedId ? "Actualizar evento" : "Crear evento"}
            </button>
            <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">{message ?? "Listo"}</span>
          </div>
        </div>
      </form>
    </section>
  );
}
