import { validateRequest } from "@/auth";
import {
  InternalServerResponse,
  NotFoundError,
  NotFoundResponse,
  UnauthorizedError,
  UnauthorizedResponse,
} from "@/lib/errors";
import prisma from "@/lib/prisma";
import { FollowerInfo } from "@/lib/types";

/**
 *
 */
export async function GET(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    // get the current logged in user from validateRequest
    const loggedInUser = await validateLoggedInUser();

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        followers: {
          where: {
            // we only want to fetch the followers of the user that is logged in
            followerId: loggedInUser.id,
          },
          select: {
            followerId: true,
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const data: FollowerInfo = {
      followers: user._count.followers,
      isFollowedByUser: !!user.followers.length,
    };

    return Response.json(data);
  } catch (error) {
    handleError(error);
  }
}

export async function POST(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const loggedInUser = await validateLoggedInUser();

    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
      },
      create: {
        followerId: loggedInUser.id,
        followingId: userId,
      },
      update: {},
    });

    return new Response(null, { status: 201 });
  } catch (error) {
    handleError(error);
  }
}

export async function DELETE(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const loggedInUser = await validateLoggedInUser();

    await prisma.follow.deleteMany({
      where: {
        followerId: loggedInUser.id,
        followingId: userId,
      },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    handleError(error);
  }
}

async function validateLoggedInUser() {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    throw new UnauthorizedError();
  }

  return loggedInUser;
}

function handleError(error: unknown) {
  console.error(error);

  if (error instanceof UnauthorizedError) {
    return new UnauthorizedResponse();
  }

  if (error instanceof NotFoundError) {
    return new NotFoundResponse();
  }

  return new InternalServerResponse();
}
