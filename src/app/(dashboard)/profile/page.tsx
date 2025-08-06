
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const user = await getSessionUser();
    if (!user) {
        redirect('/login');
    }
    
    // Redirect from the generic /profile to the specific user's profile
    redirect(`/profile/${user.id}`);
}
