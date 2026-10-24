import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacidad y cookies", description: "Informacion sobre privacidad, cuentas, garajes y anuncios de Tramassso." };

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-16 text-zinc-300">
      <h1 className="text-4xl font-black uppercase text-white">Privacidad y cookies</h1>
      <div className="mt-8 space-y-6 text-sm leading-7">
        <p>Tramassso trata los datos que facilitas al registrarte (alias, nombre, correo y contraseña cifrada) para administrar tu cuenta y ofrecerte un garaje digital gratuito. El alias, el nombre que indiques, la descripcion y los vehiculos que publiques pueden mostrarse de forma publica.</p>
        <p>Las fotografias que subas se almacenan a traves de Cloudinary. No publiques matriculas visibles, ubicaciones privadas, rostros de terceros sin permiso ni documentacion personal. Puedes modificar o eliminar tus fichas desde tu garaje.</p>
        <p>Para eventos podemos solicitar nombre, correo, telefono, vehiculo y numero de acompañantes, con la finalidad de gestionar solicitudes de participacion y aforo. Cuando la inscripcion la gestione otro organizador, el enlace externo se identificara como tal.</p>
        <p>Google AdSense puede utilizar identificadores para mostrar y medir publicidad. En España y el EEE las preferencias de consentimiento para las finalidades que lo requieren se gestionan mediante la plataforma de consentimiento configurada para el sitio. Puedes rechazar la publicidad personalizada sin perder acceso a las funciones gratuitas.</p>
        <p>Los proveedores de infraestructura, alojamiento, bases de datos e imagenes pueden tratar datos tecnicos necesarios para prestar el servicio. No vendemos datos personales.</p>
        <p>Para solicitar acceso, rectificacion, supresion de tu cuenta y otros derechos de proteccion de datos, escribe a partnerships@tramassso.com. La supresion completa de cuentas requiere un procedimiento de verificacion y no se automatiza desde el garaje.</p>
        <p>Antes de abrir el registro al publico, Tramassso debe completar y verificar la informacion legal del responsable del tratamiento, plazos de conservacion y proveedores aplicables.</p>
      </div>
    </main>
  );
}
