import { auth } from "./auth"; // path to your Better Auth server instance
import { headers } from "next/headers";

export const getSession = async () => {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
  })

  return session;
};

export const getUser = async () => {
    const session = await getSession();

    return session?.user;
};