import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostPage } from "@/lib/types";
import { NextRequest } from "next/server";

/**
 * This endpoint will serve React-query for posts from followed users
 */
export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 2;
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const followedUsers = await prisma.follow.findMany({
      where: { followerId: user.id },
      select: { followingId: true },
    });

    const posts = await prisma.post.findMany({
      where: {
        user: {
          followers: {
            some: {
              followerId: user.id,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: getPostDataInclude(user.id),
    });

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;
    const data: PostPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
