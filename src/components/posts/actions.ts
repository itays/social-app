"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { postDataInclude } from "@/lib/types";

export async function deletePostAction(postId: string) {
  // validate the request
  const { user } = await validateRequest();
  if (!user) {
    throw new Error("Unauthorized");
  }

  // find the post with the given id
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  // if post not found return an error
  if (!post) {
    throw new Error("Post not found");
  }

  // if the post is not owned by the user return an error
  if (post.userId !== user.id) {
    throw new Error("Unauthorized");
  }

  // delete the post
  const deletetdPost = await prisma.post.delete({
    where: {
      id: postId,
    },
    include: postDataInclude,
  });

  return deletetdPost;
}
