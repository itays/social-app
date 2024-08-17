import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { postDataInclude, PostPage } from "@/lib/types";
import { NextRequest } from "next/server";

/**
 * This endpoint will serve React-query
 */
export async function GET(req: NextRequest) {
  try {
    // get the cursor from the url we send frok the client. the cursor is the id of the last post we fetched
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 1;
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
      // where: {
      //   userId: user.id,
      // },
      include: postDataInclude,
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize + 1,
      // if the cursor is not undefined we will use it to fetch the next page
      cursor: cursor ? { id: cursor } : undefined,
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
