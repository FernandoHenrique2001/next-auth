import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import logout from "../(auth)/_actions/logout";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Image from "next/image";

export default async function Dashboard() {
  const session = await auth();

  console.log("ssesion", session);

  if (!session) {
    redirect("/");
  }

  return (
    <main className="container p-20 mx-auto text-center">
      <div>
        <h1 className="font-extrabold text-slate-600 dark:text-transparent text-7xl dark:bg-gradient-to-r dark:from-slate-50 dark:via-slate-400 dark:to-slate-200 bg-clip-text">
          Dashboard
        </h1>
        {session?.user?.image && (
          <Image
            className="rounded-full mx-auto"
            src={session.user?.image ?? ""}
            alt="avatar"
            width={100}
            height={100}
          />
        )}
        <h3 className="mt-4 font-bold text-muted-foreground">
          Boas vindas, {session?.user?.name}!
        </h3>
        <p className="text-xs text-muted-foreground">
          E-mail: {session?.user?.email}
        </p>
        <p className="text-xs text-muted-foreground">
          Número de seguidores do Github:{" "}
          {session?.user?.githubProfile?.followers}
        </p>
        <p className="text-xs text-muted-foreground">
          Currículo: {session?.user?.githubProfile?.bio}
        </p>
        <hr className="w-1/4 mx-auto mt-5 mb-16" />

        <section className="flex flex-wrap items-center justify-center gap-3">
          <form action={logout}>
            <Button>Logout</Button>
          </form>
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
            Home
          </Link>
        </section>
      </div>
    </main>
  );
}
