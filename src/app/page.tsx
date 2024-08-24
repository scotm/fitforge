// import Link from "next/link";
// import { getServerAuthSession } from "~/server/auth";
// import { api, HydrateClient } from "~/trpc/server";
// import { SignInOrOut } from "../../_components/signInOrOut";
// import { LatestPost } from "@/components/post";

import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  // const hello = await api.post.hello({ text: "from tRPC" });
  // const session = await getServerAuthSession();

  // const exercises = await api.exercises.getAll({});

  return <HydrateClient>Main Page</HydrateClient>;
}
