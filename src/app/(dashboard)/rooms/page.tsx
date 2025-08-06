
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RoomsRedirectPage() {
    const user = await getSessionUser();
    if(!user) {
        redirect('/');
    }

    if (!user.propiedades || user.propiedades.length === 0) {
        // This case should ideally not happen if a user always has a property,
        // but it's good to handle it. Maybe redirect to a "create property" page.
        // For now, redirecting to overview.
        redirect('/overview');
        return null;
    }
    
    // Find the main property or default to the first one
    const mainProperty = user.propiedades.find(p => p.nombre === 'Propiedad Principal') || user.propiedades[0];
    
    // Redirect to the dynamic route for that property
    redirect(`/rooms/${mainProperty.ciudad}:${mainProperty.barrio}:${mainProperty.edificio}`);
}
