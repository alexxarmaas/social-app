"use client";

import { useMemo, useRef, useState } from "react";
import { projectCoordinateOntoRoute, routeDistances } from "@/app/lib/reccemind-geo";
import type { RecceMindCoordinate } from "@/app/lib/reccemind";

interface RecceMindVoiceCaptureProps {
  coordinates: RecceMindCoordinate[];
  onInsert: (text: string, distance: number) => void;
}

type VoiceState = "idle" | "recording" | "processing";

function recordingMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? "";
}

function filenameForMimeType(mimeType: string) {
  if (mimeType.includes("mp4")) return "recce-note.m4a";
  if (mimeType.includes("ogg")) return "recce-note.ogg";
  return "recce-note.webm";
}

function currentPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Este dispositivo no ofrece geolocalización."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      maximumAge: 1_500,
      timeout: 12_000,
    });
  });
}

export default function RecceMindVoiceCapture({ coordinates, onInsert }: RecceMindVoiceCaptureProps) {
  const [state, setState] = useState<VoiceState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const cumulative = useMemo(() => routeDistances(coordinates), [coordinates]);

  const cleanupStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
  };

  const processRecording = async (blob: Blob) => {
    setState("processing");
    setMessage("Localizando y transcribiendo la nota…");
    try {
      const position = await currentPosition();
      if (position.coords.accuracy > 60) {
        throw new Error(`Precisión GPS insuficiente (${Math.round(position.coords.accuracy)} m). Espera a tener mejor señal.`);
      }

      const projection = projectCoordinateOntoRoute(
        { lat: position.coords.latitude, lng: position.coords.longitude },
        coordinates,
        cumulative,
      );
      if (!projection) throw new Error("No se pudo asociar la posición al tramo.");
      if (projection.offRouteMeters > 80) {
        throw new Error(`Estás a ${Math.round(projection.offRouteMeters)} m del trazado. Acércate al tramo antes de guardar la nota.`);
      }

      const formData = new FormData();
      formData.append("audio", blob, filenameForMimeType(blob.type));
      const response = await fetch("/api/reccemind/speech-to-text", { method: "POST", body: formData });
      const payload = await response.json() as { text?: string; error?: string; detail?: string };
      if (!response.ok) throw new Error(payload.error || payload.detail || "No se pudo transcribir la nota de voz.");
      const text = payload.text?.trim();
      if (!text) throw new Error(payload.error || "No se entendió el audio. Repite la nota.");

      onInsert(text, Math.round(projection.routeDistance));
      setMessage(`Nota añadida en ${(projection.routeDistance / 1000).toFixed(3)} km · ${Math.round(projection.offRouteMeters)} m del eje.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo añadir la nota de voz.");
    } finally {
      cleanupStream();
      setState("idle");
    }
  };

  const start = async () => {
    if (state !== "idle") return;
    setMessage(null);
    if (coordinates.length < 2) {
      setMessage("Carga un tramo antes de grabar una nota geolocalizada.");
      return;
    }
    if (!("MediaRecorder" in window) || !navigator.mediaDevices?.getUserMedia) {
      setMessage("Este navegador no permite grabar audio con MediaRecorder.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = recordingMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || "audio/webm" });
        chunksRef.current = [];
        void processRecording(blob);
      };
      recorder.start();
      setState("recording");
      setMessage("Grabando. Di una nota corta y clara; se guardará en tu posición GPS al detener.");
    } catch (error) {
      cleanupStream();
      setMessage(error instanceof Error ? error.message : "No se pudo acceder al micrófono.");
    }
  };

  const stop = () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  };

  return (
    <section className="rounded-2xl border border-sky-400/15 bg-sky-400/[0.045] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-[0.24em] text-sky-300/60">Recce real</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Dictado GPS</h3>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">Graba una observación durante el reconocimiento. RecceMind la transcribe y la inserta en el metro del tramo más cercano.</p>
        </div>
        <button
          type="button"
          disabled={state === "processing"}
          onClick={state === "recording" ? stop : () => void start()}
          className={`shrink-0 rounded-xl px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] disabled:opacity-50 ${state === "recording" ? "bg-red-400 text-black" : "bg-sky-300 text-black"}`}
        >
          {state === "recording" ? "Detener y guardar" : state === "processing" ? "Procesando…" : "Grabar nota"}
        </button>
      </div>
      {message ? <p className={`mt-3 text-xs leading-5 ${state === "recording" ? "text-red-200" : "text-sky-100/70"}`}>{message}</p> : null}
      <p className="mt-2 text-[10px] leading-4 text-zinc-700">El audio se usa para transcribir la nota y no se conserva en esta versión.</p>
    </section>
  );
}
