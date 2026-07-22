"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { partnerInputSchema, type PartnerRecord } from "@/app/lib/tramassso-content";
import CloudinaryUploader from "@/components/admin/CloudinaryUploader";
import PartnerLogo from "@/components/partners/PartnerLogo";

interface AdminPartnersManagerProps {
  initialPartners: PartnerRecord[];
}

type PartnerFormInput = z.input<typeof partnerInputSchema>;
type PartnerFormOutput = z.output<typeof partnerInputSchema>;

type PartnerServiceDraft = {
  key: string;
  name: string;
  description: string;
};

type PartnerServicesResponse = {
  services?: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
  error?: string;
};

const emptyValues: PartnerFormInput = {
  name: "",
  category: "",
  logo_url: "",
  website_url: "",
  instagram_url: "",
  description: "",
  is_featured: false,
};

function createServiceDraft(): PartnerServiceDraft {
  return {
    key: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    name: "",
    description: "",
  };
}

export default function AdminPartnersManager({ initialPartners }: AdminPartnersManagerProps) {
  const [partners, setPartners] = useState<PartnerRecord[]>(initialPartners);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [services, setServices] = useState<PartnerServiceDraft[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
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
      instagram_url: selectedPartner.instagram_url ?? "",
      description: selectedPartner.description ?? "",
      is_featured: selectedPartner.is_featured,
    });
  }, [reset, selectedPartner]);

  const logoUrl = watch("logo_url");

  const startNewPartner = () => {
    setSelectedId(null);
    setServices([]);
    setServicesLoading(false);
    setMessage(null);
  };

  const selectPartner = async (partner: PartnerRecord) => {
    setSelectedId(partner.id);
    setServicesLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/partner-services?partnerId=${encodeURIComponent(partner.id)}`);
      const data: PartnerServicesResponse = await response.json();

      if (!response.ok || !data.services) {
        throw new Error(data.error ?? "No se pudieron cargar los servicios.");
      }

      setServices(data.services.map((service) => ({
        key: service.id,
        name: service.name,
        description: service.description ?? "",
      })));
    } catch (error) {
      setServices([]);
      setMessage(error instanceof Error ? error.message : "No se pudieron cargar los servicios.");
    } finally {
      setServicesLoading(false);
    }
  };

  const updateService = (key: string, field: "name" | "description", value: string) => {
    setServices((current) => current.map((service) => (
      service.key === key ? { ...service, [field]: value } : service
    )));
  };

  const removeService = (key: string) => {
    setServices((current) => current.filter((service) => service.key !== key));
  };

  const addService = () => {
    setServices((current) => current.length >= 12 ? current : [...current, createServiceDraft()]);
  };

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

      const savedPartner = data.item;
      setPartners((current) => {
        const filtered = current.filter((partner) => partner.id !== savedPartner.id);
        return [savedPartner, ...filtered].sort((left, right) => {
          if (left.is_featured !== right.is_featured) {
            return Number(right.is_featured) - Number(left.is_featured);
          }

          return right.created_at.localeCompare(left.created_at);
        });
      });

      const servicePayload = services
        .filter((service) => service.name.trim().length > 0 || service.description.trim().length > 0)
        .map((service) => ({
          name: service.name,
          description: service.description,
        }));

      if (selectedId || servicePayload.length > 0) {
        const servicesResponse = await fetch("/api/admin/partner-services", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            partnerId: savedPartner.id,
            services: servicePayload,
          }),
        });
        const servicesData: PartnerServicesResponse = await servicesResponse.json();

        if (!servicesResponse.ok || !servicesData.services) {
          setSelectedId(savedPartner.id);
          throw new Error(`El colaborador se guardo, pero sus servicios no: ${servicesData.error ?? "error desconocido"}`);
        }
      }

      setSelectedId(null);
      setServices([]);
      reset(emptyValues);
      setMessage("Colaborador y servicios guardados.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar el colaborador.");
    } finally {
      setSaving(false);
    }
  };

  const deletePartner = async (id: string) => {
    if (!window.confirm("¿Eliminar este colaborador? Esta accion no se puede deshacer.")) {
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
        startNewPartner();
      }
      setMessage("Colaborador eliminado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo eliminar el colaborador.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.8fr)]">
      <div className="min-w-0 rounded-[1.5rem] border border-zinc-800 bg-zinc-950/80 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.25)] sm:rounded-[1.75rem] sm:p-5">
        <div className="mb-5 grid gap-4 sm:flex sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.45em] text-zinc-500">Colaboradores</p>
            <h2 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-zinc-50">Directorio de partners</h2>
          </div>
          <button type="button" onClick={startNewPartner} className="rounded-full border border-zinc-800 px-4 py-2 text-xs uppercase tracking-[0.28em] text-zinc-300 transition hover:border-zinc-500 hover:text-white">
            Nuevo colaborador
          </button>
        </div>

        <div className="overflow-x-auto rounded-[1.35rem] border border-zinc-800">
          <table className="min-w-[46rem] divide-y divide-zinc-800 text-sm">
            <thead className="bg-zinc-900/70 text-left text-[10px] uppercase tracking-[0.35em] text-zinc-500">
              <tr>
                <th className="px-4 py-3">Colaborador</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Destacado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 bg-black/20">
              {partners.map((partner) => (
                <tr key={partner.id} className="align-top">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <PartnerLogo src={partner.logo_url} alt={`Logo de ${partner.name}`} variant="thumbnail" />
                      <div>
                        <div className="font-medium text-zinc-50">{partner.name}</div>
                        <div className="max-w-[22rem] text-xs text-zinc-500 line-clamp-2">{partner.description ?? "Sin descripcion"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-zinc-300">{partner.category}</td>
                  <td className="px-4 py-4 text-zinc-300">{partner.is_featured ? "Si" : "No"}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button type="button" onClick={() => void selectPartner(partner)} className="rounded-full border border-zinc-800 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-zinc-300 transition hover:border-white hover:text-white">
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
                    No hay colaboradores todavia
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <form onSubmit={handleSubmit(savePartner)} className="min-w-0 rounded-[1.5rem] border border-zinc-800 bg-zinc-950/80 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.25)] sm:rounded-[1.75rem] sm:p-5">
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
            <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Categoria</span>
            <input {...register("category")} placeholder="Taller, detailing, marca..." className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-50 outline-none transition placeholder:text-zinc-700 focus:border-zinc-400" />
            {errors.category ? <span className="text-xs text-red-400">{errors.category.message}</span> : null}
          </label>

          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Descripcion</span>
            <textarea {...register("description")} rows={5} className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-50 outline-none transition focus:border-zinc-400" />
            {errors.description ? <span className="text-xs text-red-400">{errors.description.message}</span> : null}
          </label>

          <div className="grid gap-3 rounded-[1.25rem] border border-zinc-800 bg-black/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Servicios</span>
                <p className="mt-2 text-xs leading-5 text-zinc-600">Añade hasta 12 servicios, con una descripcion opcional para cada uno.</p>
              </div>
              <button type="button" onClick={addService} disabled={services.length >= 12 || servicesLoading} className="rounded-full border border-zinc-700 px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-zinc-300 transition hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
                Añadir servicio
              </button>
            </div>

            {servicesLoading ? (
              <p className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-5 text-center text-xs uppercase tracking-[0.25em] text-zinc-600">Cargando servicios</p>
            ) : services.length ? (
              <div className="grid gap-3">
                {services.map((service, index) => (
                  <div key={service.key} className="grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-600">Servicio {String(index + 1).padStart(2, "0")}</span>
                      <button type="button" onClick={() => removeService(service.key)} className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 transition hover:text-red-300">Eliminar</button>
                    </div>
                    <input
                      value={service.name}
                      onChange={(event) => updateService(service.key, "name", event.target.value)}
                      maxLength={100}
                      placeholder="Nombre del servicio"
                      className="rounded-xl border border-zinc-800 bg-black/40 px-3 py-2.5 text-sm text-zinc-50 outline-none transition placeholder:text-zinc-700 focus:border-zinc-400"
                    />
                    <textarea
                      value={service.description}
                      onChange={(event) => updateService(service.key, "description", event.target.value)}
                      maxLength={500}
                      rows={3}
                      placeholder="Descripcion opcional"
                      className="rounded-xl border border-zinc-800 bg-black/40 px-3 py-2.5 text-sm text-zinc-50 outline-none transition placeholder:text-zinc-700 focus:border-zinc-400"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-zinc-800 px-4 py-5 text-center text-xs leading-5 text-zinc-600">Todavia no se han añadido servicios.</p>
            )}
          </div>

          <div className="grid gap-3">
            <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Logo</span>
            <input {...register("logo_url")} placeholder="URL segura de Cloudinary" className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-50 outline-none transition placeholder:text-zinc-700 focus:border-zinc-400" />
            <p className="text-xs leading-5 text-zinc-500">
              Usa preferiblemente PNG o WebP de buena calidad. El fondo original del archivo se conservara. Minimo: 500 px en el lado largo y 160 px en el corto.
            </p>
            <div className="flex flex-wrap gap-3">
              <CloudinaryUploader
                label="Subir logo"
                minLongestSide={500}
                minShortestSide={160}
                onUploadComplete={(url) => setValue("logo_url", url, { shouldDirty: true, shouldValidate: true })}
              />
              <button type="button" onClick={() => setValue("logo_url", "", { shouldDirty: true, shouldValidate: true })} className="rounded-2xl border border-zinc-800 px-4 py-2 text-xs uppercase tracking-[0.28em] text-zinc-400 transition hover:border-zinc-500 hover:text-white">
                Limpiar
              </button>
            </div>
            {logoUrl ? (
              <PartnerLogo src={logoUrl} alt="Vista previa del logo" variant="preview" />
            ) : null}
            {errors.logo_url ? <span className="text-xs text-red-400">{errors.logo_url.message}</span> : null}
          </div>

          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Web</span>
            <input {...register("website_url")} placeholder="https://ejemplo.com" className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-50 outline-none transition placeholder:text-zinc-700 focus:border-zinc-400" />
            {errors.website_url ? <span className="text-xs text-red-400">{errors.website_url.message}</span> : null}
          </label>

          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Instagram</span>
            <input {...register("instagram_url")} placeholder="https://instagram.com/marca" className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-50 outline-none transition placeholder:text-zinc-700 focus:border-zinc-400" />
            {errors.instagram_url ? <span className="text-xs text-red-400">{errors.instagram_url.message}</span> : null}
          </label>

          <label className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-black/30 px-4 py-3">
            <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Destacado</span>
            <input type="checkbox" {...register("is_featured")} className="h-5 w-5 accent-white" />
          </label>

          <div className="grid gap-3 pt-2 sm:flex sm:items-center">
            <button type="submit" disabled={saving || servicesLoading} className="w-full rounded-full bg-white px-5 py-3 text-xs font-medium uppercase tracking-[0.24em] text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:tracking-[0.32em]">
              {saving ? "Guardando" : selectedId ? "Actualizar colaborador" : "Crear colaborador"}
            </button>
            <span className="text-xs leading-5 text-zinc-500">{message ?? "Listo"}</span>
          </div>
        </div>
      </form>
    </section>
  );
}
