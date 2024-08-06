import { lucia } from "@/auth";
import { cookies } from "next/headers";

export async function createSessionCookie(userId: string) {
  // create a session for the user
  const session = await lucia.createSession(userId, {});
  // create a cookie for the session
  const sessionCookie = lucia.createSessionCookie(session.id);

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
}
