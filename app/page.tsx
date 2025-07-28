"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/toggle-theme";
import { authClient } from "@/lib/auth-client";

export default function HomePage() {
  const { data: session } = authClient.useSession();

  return (
    <div className="p-8 space-y-4">
      <ThemeToggle />
      <h1 className="text-2xl font-bold">Home page</h1>
      <div>
        {session ? (
          <div>
            <p>{session.user.name}</p>
            <Button>Logout</Button>
          </div>
        ) : (
          <Button>Login</Button>
        )}
      </div>
    </div>
  );
}
