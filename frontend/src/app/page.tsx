import { auth0 } from "@/lib/auth0";
import { LandingHero } from "@/components/LandingHero";

export default async function HomePage() {
    const session = await auth0.getSession();
    return <LandingHero session={session} />;
}
