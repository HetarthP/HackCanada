import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import AIAssistant from "@/components/ui/ai-assistant";

export default async function ChatPage() {
    // Gate behind Auth0 login — redirect to login if no session
    const session = await auth0.getSession();
    if (!session) {
        redirect("/auth/login?returnTo=/brand/chat");
    }

    const user = session.user;

    return (
        <>
            <div className="page-header">
                <h1>💬 Marketing Advisor</h1>
                <p>
                    AI-powered VPP strategy tailored to your brand
                    {user?.name ? ` — ${user.name}` : ""}.
                </p>
            </div>

            <AIAssistant mode="page" />
        </>
    );
}
