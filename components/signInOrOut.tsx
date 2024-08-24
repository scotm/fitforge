import { type Session } from "next-auth";
import Link from "next/link";
import React from "react";

export const SignInOrOut = ({ session }: { session: Session | null }) => {
  return (
    <Link
      href={session ? "/api/auth/signout" : "/api/auth/signin"}
      className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
    >
      {session ? "Sign out" : "Sign in"}
    </Link>
  );
};
