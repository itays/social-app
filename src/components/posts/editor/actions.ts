"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { postDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validations";

export async function submitPostAction(input: string) {
  const { user } = await validateRequest();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { content } = createPostSchema.parse({ content: input });

  // we want to create a new post with included data and immediately return tthe created post
  const newPost = await prisma.post.create({
    data: {
      content,
      userId: user.id,
    },
    //
    include: postDataInclude,
  });
  return newPost;
}
