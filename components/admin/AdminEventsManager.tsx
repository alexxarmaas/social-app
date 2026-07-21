"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { z } from "zod";
import { eventInputSchema, type EventRecord } from "@/app/lib/tramassso-content";
import CloudinaryUploader from "@/components/admin/CloudinaryUploader";

interface AdminEventsManagerProps {
  initialEvents: EventRecord[];
}

type EventFormInput = z.input<typeof eventInputSchema>;
type EventFormOutput = z.output<typeof eventInputSchema>;

const emptyValues: EventFormInput = {
  title: "",
  description: "",
  date: "",
  location: "",
  cover_image_url: "",
  gallery_urls: [],
  participation_mode: "information",
  organizer_name: "",
  external_registration_url: "",
  max_participants: null,
};

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
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

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<EventFormInput, undefined, EventFormOutput>({
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
      participation_mode: selectedEvent.participation_mode,
      organizer_name: selectedEvent.organizer_name ?? "",
      external_registration_url: selectedEvent.external_registration_url ?? "",
      max_participants: selectedEvent.max_participants,
    });
  }, [reset, selectedEvent]);

  const coverImageUrl = watch("cover_image_url");
  const galleryUrls = watch("gallery_urls") ?? [];
  const participationMode = watch("participation_mode");

  const saveEvent = async (values: EventFormOutput) => {
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
    if (!window.confirm("¿Eliminar este evento? Esta accion no se puede deshacer.")) {
      return;
    }
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
    <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.8fr)]">
      <div className="min-w-0 rounded-[1.5rem] border border-zinc-800 bg-zinc-950/80 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.25)] sm:rounded-[1.75rem] sm:p-5">
        <div className="mb-5 grid gap-4 sm:flex sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.45em] text-zinc-500">Eventos</p>
            <h2 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-zinc-50">Inventario de eventos</h2>
          </div>
          <button type="button" onClick={() => setSelectedId(null)} className="rounded-full border border-zinc-800 px-4 py-2 text-xs uppercase tracking-[0.28em] text-zinc-300 transition hover:border-zinc-500 hover:text-white">
            Nuevo evento
          </button>
        </div>

        <div className="overflow-x-auto rounded-[1.35rem] border border-zinc-800">
          <table className="min-w-[46rem] divide-y divide-zinc-800 text-sm">
            <thead className="bg-zinc-900/70 text-left text-[10px] uppercase tracking-[0.35em] text-zinc-500">
              <tr>
                <th className="px-4 py-3">Evento</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Ubicacion</th>
                <th className="px-4 py-3">Participacion</th>
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
                  <td className="px-4 py-4 text-zinc-300">{{ information: "Informativo", interest: "Interesados", managed: "Gestion Tramassso", external: "Externa" }[event.participation_mode]}</td>
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
                  <td colSpan={5} className="px-4 py-8 text-center text-xs uppercase tracking-[0.3em] text-zinc-600">
                    No hay eventos todavia
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <form onSubmit={handleSubmit(saveEvent)} className="min-w-0 rounded-[1.5rem] border border-zinc-800 bg-zinc-950/80 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.25)] sm:rounded-[1.75rem] sm:p-5">
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-[0.45em] text-zinc-500">Crear / editar</p>
          <h2 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-zinc-50">Formulario de evento</h2>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Titulo</span>
            <input {...register("title")} className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-50 outline-none transition focus:border-zinc-400" />
            {errors.title ? <span className="text-xs text-red-400">{errors.title.message}</span> : null}
          </label>

          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Descripcion</span>
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
              <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Ubicacion</span>
              <input {...register("location")} className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-50 outline-none transition focus:border-zinc-400" />
              {errors.location ? <span className="text-xs text-red-400">{errors.location.message}</span> : null}
            </label>
          </div>

          <div className="grid gap-4 rounded-3xl border border-zinc-800 bg-black/25 p-4">
            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Participacion</span>
              <select {...register("participation_mode")} className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-50 outline-none transition focus:border-zinc-400">
                <option value="information">Solo informacion</option>
                <option value="interest">Lista de interesados de Tramassso</option>
                <option value="managed">Inscripcion gestionada por Tramassso</option>
                <option value="external">Inscripcion externa</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Organizador indicado (opcional)</span>
              <input {...register("organizer_name")} placeholder="Nombre mostrado como organizador" className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-50 outline-none transition focus:border-zinc-400" />
              {errors.organizer_name ? <span className="text-xs text-red-400">{errors.organizer_name.message}</span> : null}
            </label>
            {participationMode === "external" ? (
              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Enlace oficial de inscripcion</span>
                <input {...register("external_registration_url")} type="url" placeholder="https://..." className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-50 outline-none transition focus:border-zinc-400" />
                {errors.external_registration_url ? <span className="text-xs text-red-400">{errors.external_registration_url.message}</span> : null}
              </label>
            ) : null}
            {participationMode === "managed" ? (
              <label className="grid max-w-64 gap-2">
                <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Aforo (opcional)</span>
                <input {...register("max_participants")} type="number" min={1} max={10000} placeholder="Sin limite" className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-50 outline-none transition focus:border-zinc-400" />
                {errors.max_participants ? <span className="text-xs text-red-400">{errors.max_participants.message}</span> : null}
              </label>
            ) : null}
            <p className="text-xs leading-6 text-zinc-500">Los organizadores externos no reciben una cuenta. Tramassso publica y gestiona cada evento desde este panel.</p>
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
              <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Galeria</span>
              <CloudinaryUploader label="Agregar foto" multiple onUploadComplete={(url) => setValue("gallery_urls", [...galleryUrls, url], { shouldDirty: true, shouldValidate: true })} />
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
                  Aun no hay imagenes en la galeria
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-3 pt-2 sm:flex sm:items-center">
            <button type="submit" disabled={saving} className="w-full rounded-full bg-white px-5 py-3 text-xs font-medium uppercase tracking-[0.24em] text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:tracking-[0.32em]">
              {saving ? "Guardando" : selectedId ? "Actualizar evento" : "Crear evento"}
            </button>
            <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">{message ?? "Listo"}</span>
          </div>
        </div>
      </form>
    </section>
  );
}
