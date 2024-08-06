"use server";

import { lucia } from "@/auth";
import { createSessionCookie } from "@/lib/auth/helpers";
import prisma from "@/lib/prisma";
import { signupScheme, SignupValues } from "@/lib/validations";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signupAction(
  credentials: SignupValues,
): Promise<{ error: string }> {
  try {
    const { email, password, username } = signupScheme.parse(credentials);

    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const userId = generateIdFromEntropySize(10);

    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (existingUser) {
      return { error: "Username already taken" };
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingEmail) {
      return { error: "Email already taken" };
    }

    // finally create the user
    await prisma.user.create({
      data: {
        id: userId,
        username,
        displayName: username,
        email,
        passwordHash,
      },
    });

    // create a session for the user
    await createSessionCookie(userId);
    // redirect to the home page
    return redirect("/");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error(error);
    return { error: "An error occurred" };
  }
}
