"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { z } from "zod";
import { partnerInputSchema, type PartnerRecord } from "@/app/lib/tramassso-content";
import CloudinaryUploader from "@/components/admin/CloudinaryUploader";

interface AdminPartnersManagerProps {
  initialPartners: PartnerRecord[];
}

type PartnerFormInput = z.input<typeof partnerInputSchema>;
type PartnerFormOutput = z.output<typeof partnerInputSchema>;

const emptyValues: PartnerFormInput = {
  name: "",
  category: "",
  logo_url: "",
  website_url: "",
  description: "",
  is_featured: false,
};

export default function AdminPartnersManager({ initialPartners }: AdminPartnersManagerProps) {
  const [partners, setPartners] = useState<PartnerRecord[]>(initialPartners);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedPartner = useMemo(
    () => partners.find((partner) => partner.id === selectedId) ?? null,
    [partners, selectedId],
  );

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PartnerFormInput, undefined, PartnerFormOutput>({
    resolver: zodResolver(partnerInputSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!selectedPartner) {
      reset(emptyValues);
      return;
    }

    reset({
      name: selectedPartner.name,
      category: selectedPartner.category,
      logo_url: selectedPartner.logo_url ?? "",
      website_url: selectedPartner.website_url ?? "",
      description: selectedPartner.description ?? "",
      is_featured: selectedPartner.is_featured,
    });
  }, [reset, selectedPartner]);

  const logoUrl = watch("logo_url");

  const savePartner = async (values: PartnerFormOutput) => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/content", {
        method: selectedId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind: "partners",
          id: selectedId,
          payload: values,
        }),
      });

      const data: { item?: PartnerRecord; error?: string } = await response.json();

      if (!response.ok || !data.item) {
        throw new Error(data.error ?? "No se pudo guardar el colaborador.");
      }

      setPartners((current) => {
        const filtered = current.filter((partner) => partner.id !== data.item?.id);
        return [data.item as PartnerRecord, ...filtered].sort((left, right) => {
          if (left.is_featured !== right.is_featured) {
            return Number(right.is_featured) - Number(left.is_featured);
          }

          return right.created_at.localeCompare(left.created_at);
        });
      });
      setSelectedId(null);
      reset(emptyValues);
      setMessage("Colaborador guardado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar el colaborador.");
    } finally {
      setSaving(false);
    }
  };

  const deletePartner = async (id: string) => {
    if (!window.confirm("¿Eliminar este colaborador?")) {
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
          kind: "partners",
          id,
        }),
      });

      const data: { success?: boolean; error?: string } = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "No se pudo eliminar el colaborador.");
      }

      setPartners((current) => current.filter((partner) => partner.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
      }
      setMessage("Colaborador eliminado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo eliminar el colaborador.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="grid gap-6 xl:grid-cols-[1.25fr_0.8fr]">
      <div className="rounded-[1.75rem] border border-zinc-800 bg-zinc-950/80 p-5 shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.45em] text-zinc-500">Colaboradores</p>
            <h2 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-zinc-50">Directorio de partners</h2>
          </div>
          <button type="button" onClick={() => setSelectedId(null)} className="rounded-full border border-zinc-800 px-4 py-2 text-xs uppercase tracking-[0.28em] text-zinc-300 transition hover:border-zinc-500 hover:text-white">
            Nuevo colaborador
          </button>
        </div>

        <div className="overflow-hidden rounded-[1.35rem] border border-zinc-800">
          <table className="min-w-full divide-y divide-zinc-800 text-sm">
            <thead className="bg-zinc-900/70 text-left text-[10px] uppercase tracking-[0.35em] text-zinc-500">
              <tr>
                <th className="px-4 py-3">Colaborador</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Destacado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 bg-black/20">
              {partners.map((partner) => (
                <tr key={partner.id} className="align-top">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                        {partner.logo_url ? (
                          <Image src={partner.logo_url} alt={partner.name} fill className="object-contain p-2" sizes="56px" />
                        ) : null}
                      </div>
                      <div>
                        <div className="font-medium text-zinc-50">{partner.name}</div>
                        <div className="max-w-[22rem] text-xs text-zinc-500 line-clamp-2">{partner.description ?? "Sin descripción"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-zinc-300">{partner.category}</td>
                  <td className="px-4 py-4 text-zinc-300">{partner.is_featured ? "Sí" : "No"}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button type="button" onClick={() => setSelectedId(partner.id)} className="rounded-full border border-zinc-800 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-zinc-300 transition hover:border-white hover:text-white">
                        Editar
                      </button>
                      <button type="button" onClick={() => void deletePartner(partner.id)} className="rounded-full border border-zinc-800 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-zinc-300 transition hover:border-red-500 hover:text-red-300">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!partners.length ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-xs uppercase tracking-[0.3em] text-zinc-600">
                    No hay colaboradores todavía
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <form onSubmit={handleSubmit(savePartner)} className="rounded-[1.75rem] border border-zinc-800 bg-zinc-950/80 p-5 shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-[0.45em] text-zinc-500">Crear / editar</p>
          <h2 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-zinc-50">Formulario de colaborador</h2>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Nombre</span>
            <input {...register("name")} className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-50 outline-none transition focus:border-zinc-400" />
            {errors.name ? <span className="text-xs text-red-400">{errors.name.message}</span> : null}
          </label>

          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Categoría</span>
            <input {...register("category")} placeholder="Taller, detailing, marca..." className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-50 outline-none transition placeholder:text-zinc-700 focus:border-zinc-400" />
            {errors.category ? <span className="text-xs text-red-400">{errors.category.message}</span> : null}
          </label>

          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Descripción</span>
            <textarea {...register("description")} rows={5} className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-50 outline-none transition focus:border-zinc-400" />
            {errors.description ? <span className="text-xs text-red-400">{errors.description.message}</span> : null}
          </label>

          <div className="grid gap-3">
            <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Logo</span>
            <input {...register("logo_url")} placeholder="URL segura de Cloudinary" className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-50 outline-none transition placeholder:text-zinc-700 focus:border-zinc-400" />
            <div className="flex flex-wrap gap-3">
              <CloudinaryUploader label="Subir logo" onUploadComplete={(url) => setValue("logo_url", url, { shouldDirty: true, shouldValidate: true })} />
              <button type="button" onClick={() => setValue("logo_url", "", { shouldDirty: true, shouldValidate: true })} className="rounded-2xl border border-zinc-800 px-4 py-2 text-xs uppercase tracking-[0.28em] text-zinc-400 transition hover:border-zinc-500 hover:text-white">
                Limpiar
              </button>
            </div>
            {logoUrl ? (
              <div className="relative h-36 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
                <Image src={logoUrl} alt="Vista previa del logo" fill className="object-contain p-5" sizes="(max-width: 768px) 100vw, 40vw" />
              </div>
            ) : null}
            {errors.logo_url ? <span className="text-xs text-red-400">{errors.logo_url.message}</span> : null}
          </div>

          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Web</span>
            <input {...register("website_url")} placeholder="https://ejemplo.com" className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-50 outline-none transition placeholder:text-zinc-700 focus:border-zinc-400" />
            {errors.website_url ? <span className="text-xs text-red-400">{errors.website_url.message}</span> : null}
          </label>

          <label className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-black/30 px-4 py-3">
            <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Destacado</span>
            <input type="checkbox" {...register("is_featured")} className="h-5 w-5 accent-white" />
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving} className="rounded-full bg-white px-5 py-3 text-xs font-medium uppercase tracking-[0.32em] text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? "Guardando" : selectedId ? "Actualizar colaborador" : "Crear colaborador"}
            </button>
            <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">{message ?? "Listo"}</span>
          </div>
        </div>
      </form>
    </section>
  );
}
