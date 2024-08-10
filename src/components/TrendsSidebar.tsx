import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { userDataSelect } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import UserAvatar from "./UserAvatar";
import { Button } from "./ui/button";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { hash } from "crypto";
import { formatNumber } from "@/lib/utils";
export default function TrendsSidebar() {
  return (
    <div className="sticky top-[5.25rem] hidden h-fit w-72 flex-none space-y-5 md:block lg:w-80">
      <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
        <WhoToFollow />
        <TrendingTopics />
      </Suspense>
    </div>
  );
}

async function WhoToFollow() {
  const { user } = await validateRequest();
  if (!user) {
    return null;
  }

  // fetch users that are not the current user
  // TODO: in the future we can add a filter to only fetch users that we are not following yet
  const usersToFollow = await prisma.user.findMany({
    where: {
      NOT: {
        id: user.id,
      },
    },
    select: userDataSelect, // define the fields to fetch
    take: 5, // limit the number of results
  });

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow">
      <div className="text-xl font-bold">Who to follow</div>
      {usersToFollow.map((user) => (
        <div key={user.id} className="flex items-center justify-between gap-3">
          <Link
            href={`/users/${user.username}`}
            className="flex items-center gap-3"
          >
            <UserAvatar avaterUrl={user.avatarUrl} className="flex-none" />
            <div>
              <p className="line-clamp-1 break-all font-semibold">
                {user.displayName}
              </p>
              <p className="line-clamp-1 break-all text-muted-foreground">
                @{user.username}
              </p>
            </div>
          </Link>
          <Button>Follow</Button>
        </div>
      ))}
    </div>
  );
}
/**
 * we will actually count the hashtags and all of these posts via postgres full text search but of course this is a heavy operation and we can't execute this every single time we open
 * this page but we don't have static rendering in this component why because we've fetched the user session not only
 * here but also in the layout and as soon as you fetch the session from the cookies every page below it is
 * dynamically rendered which makes sense because the session is dynamic data you can't know the current user if the page
 * is statically cached so we don't have any static caching here so how can we avoid fetching this data over and over again?
 *
 * For this we can use a cool function from nextjs so what we do is we go above our trending topics component we create a const getTrendingTopics
 * and we assign this to unstable cache.
 *
 * dont confuse unstable_cach with reacts cache function they are completely different.
 * the cache function de-duplicates the operation within the same request - when we refresh the page the cache is cleared and we execute the function body again.
 * unstable_cache is cached on the server and is not cleared when the page is refreshed. it caches the operation between multiple requests
 * and between DIFFERENT USERS.
 *
 */
const getTrendingTopics = unstable_cache(
  async () => {
    /* when you use an ORM like Prisma there are
  some things that the ORM just can't do because they are too specific to your use case and Counting these hashtags is
  one example when this is the case we have to make a raw sql query which
  */
    const result = await prisma.$queryRaw<{ hashtag: string; count: bigint }[]>`
  SELECt LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag, COUNT(*) AS count
  FROM posts
  GROUP BY (hashtag)
  ORDER BY count DESC, hashtag ASC
  LIMIT 5`;

    return result.map((row) => ({
      hashtag: row.hashtag,
      count: Number(row.count),
    }));
  },
  ["trending_topics"],
  {
    // revalidate every 3 hours
    revalidate: 3 * 60 * 60,
  },
);
async function TrendingTopics() {
  /**
   * important this only works in production after we actually deployed this in development this will always
   * execute and we will always get the current data nothing will be cached but in production which is where it matters.
   */
  const trendingTopics = await getTrendingTopics();
  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow">
      <div className="text-xl font-bold">Trending topics</div>
      {trendingTopics.map(({ hashtag, count }) => {
        // get the title without the hashtag
        const title = hashtag.slice(1);
        return (
          <Link key={title} href={`/hashtag/${title}`} className="block">
            <p
              className="line-clamp-1 break-all font-semibold hover:underline"
              title={hashtag}
            >
              {hashtag}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatNumber(count)} {count > 1 ? "posts" : "post"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
