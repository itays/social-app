"use server";

import { createSessionCookie } from "@/lib/auth/helpers";
import prisma from "@/lib/prisma";
import { loginSchema, LoginValues } from "@/lib/validations";
import { verify } from "@node-rs/argon2";
import { isRedirectError } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation";

export async function loginAction(
  credentials: LoginValues,
): Promise<{ error: string }> {
  try {
    const { username, password } = loginSchema.parse(credentials);

    // check if the user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (!existingUser || !existingUser.passwordHash) {
      return { error: "Incorrect username or password" };
    }

    // check if the password is correct
    const isPasswordCorrect = await verify(
      existingUser.passwordHash,
      password,
      {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      },
    );

    if (!isPasswordCorrect) {
      return { error: "Incorrect username or password" };
    }
    // create a session and cookie for the session
    await createSessionCookie(existingUser.id);

    return redirect("/");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error(error);
    return { error: "An error occurred" };
  }
}
