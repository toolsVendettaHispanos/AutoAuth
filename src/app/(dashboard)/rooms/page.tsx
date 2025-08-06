
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FullPropiedad } from "@/lib/types";

// This page will now redirect to the primary property's specific room page.
export default async function RoomsRedirectPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/');
  }

  if (!user.propiedades || user.propiedades.length === 0) {
    // Should not happen, but as a fallback, we can show a message.
    // Ideally, we'd redirect to a page where they can create a property.
    return (
        <div className="main-view">
            <h2 className="text-3xl font-bold tracking-tight">Sin Propiedades</h2>
            <p>No tienes ninguna propiedad para gestionar.</p>
        </div>
    );
  }

  const primaryProperty = user.propiedades.find((p: FullPropiedad) => p.nombre === 'Propiedad Principal') || user.propiedades[0];
  
  const { ciudad, barrio, edificio } = primaryProperty;
  
  redirect(`/rooms/${ciudad}:${barrio}:${edificio}`);
}
