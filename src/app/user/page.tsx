import { UserDetails } from "@/components/UserPage/UserForm";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Page() {
  const session = await getServerAuthSession();
  if (!session) return <div>You are not logged in</div>;

  const user = await api.user.get({
    id: session.user.id,
  });
  if (!user) return <div>User not found</div>;

  return (
    <div className="mx-auto min-w-[640px]">
      <h1 className="mb-4 text-3xl font-bold">User Page</h1>
      <UserDetails user={user} />
    </div>
  );
}
