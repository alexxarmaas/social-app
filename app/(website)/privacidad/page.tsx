import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacidad", description: "Politica de privacidad de Tramassso." };

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-16 text-zinc-300">
      <h1 className="text-4xl font-bold text-white">Politica de privacidad</h1>
      <div className="mt-8 space-y-5 leading-7">
        <p>Tramassso trata los datos que envias voluntariamente para responder a solicitudes de contacto y gestionar el acceso del equipo.</p>
        <p>Google AdSense puede almacenar o leer identificadores en tu dispositivo para mostrar y medir publicidad. En España y el resto del Espacio Económico Europeo, las preferencias se solicitan y gestionan mediante la plataforma de consentimiento certificada de Google, desde la que puedes consentir, rechazar o personalizar el tratamiento.</p>
        <p>Los servicios de infraestructura, analitica, base de datos e imagenes pueden procesar datos tecnicos necesarios para prestar el servicio. No vendemos datos personales.</p>
        <p>Para ejercer tus derechos o solicitar informacion, escribe a partnerships@tramassso.com.</p>
      </div>
    </main>
  );
}
