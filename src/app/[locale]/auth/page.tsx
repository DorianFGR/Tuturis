import { getUser } from "@/lib/auth-server";
import { unauthorized } from "next/navigation";

export default async function authPage() {
    const user = await getUser();

    if (!user) {
        return unauthorized();
    }
    
    return(
        <div className="container flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md p-8 space-y-8 border rounded-lg">
                <h1 className="text-2xl font-bold">{user?.email}</h1>
                <h1 className="text-2xl font-bold">{user?.name}</h1>
            </div>
        </div>
    )
}