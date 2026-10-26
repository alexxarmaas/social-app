import TramasssoIcon from "@/components/ui/TramasssoIcon";

export default function FloatingInstagram() {
  return (
    <a href="https://www.instagram.com/tramassso_/" target="_blank"
      rel="noopener noreferrer" aria-label="Instagram oficial de Tramassso"
      className="fixed bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-500/35 bg-[#141011]/95 text-orange-400 shadow-[0_12px_36px_rgba(0,0,0,0.5)] backdrop-blur transition-colors hover:border-orange-500 hover:bg-[#23150e] hover:text-orange-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400">
      <TramasssoIcon name="instagram" frame={false} size="md" />
    </a>
  );
}
