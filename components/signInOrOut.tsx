import { type Session } from "next-auth";
import Link from "next/link";
import React from "react";

export const SignInOrOut = ({ session }: { session: Session | null }) => {
  return (
    <Link
      href={session ? "/api/auth/signout" : "/api/auth/signin"}
      className="text-sm font-semibold leading-6 text-gray-900"
    >
      {session ? "Sign out" : "Sign in"}
    </Link>
  );
};
