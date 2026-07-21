import { MdOutlineCameraAlt } from "react-icons/md";

export default function FloatingInstagram() {
  return <a href="https://www.instagram.com/tramassso_/" target="_blank" rel="noreferrer" aria-label="Abrir Instagram de Tramassso" className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/40 bg-black/90 text-red-300 shadow-xl transition hover:scale-105 hover:text-white"><MdOutlineCameraAlt size={22} /></a>;
}
