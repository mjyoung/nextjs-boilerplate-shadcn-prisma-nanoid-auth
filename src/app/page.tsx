import { Button } from "~/components/ui/Button";
import { api, HydrateClient } from "~/trpc/server";
import { getCurrentSession } from "~/utils/auth";
import { logout } from "~/utils/auth/actions";

export default async function Home() {
  const { user } = await getCurrentSession();
  const users = await api.user.getAll();
  console.log("🚀 > Home > users:", users);
  const me = user ? await api.user.me() : null;
  console.log("🚀 > Home > me:", me);

  return (
    <HydrateClient>
      <main className="\ flex flex-col items-center justify-center text-black">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
          </h1>

          <div className="flex flex-col items-center gap-2">
            <p>{user?.email}</p>
            {!user && (
              <div>
                <a href="/login">Login</a>
                <span>{" or "}</span>
                <a href="/signup">Signup</a>
              </div>
            )}
            {user && (
              <form action={logout}>
                <Button variant={"default"} size={"lg"}>
                  Logout
                </Button>
              </form>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4>Me</h4>
              <pre>{JSON.stringify(me, null, 2)}</pre>
            </div>
            <div>
              <h4>Users</h4>
              <pre>{JSON.stringify(users, null, 2)}</pre>
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
