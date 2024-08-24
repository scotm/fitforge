/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";

const navigation = [
  { name: "Product", href: "#" },
  { name: "Features", href: "#" },
  { name: "Marketplace", href: "#" },
  { name: "Company", href: "#" },
];

export default async function Header() {
  const session = await getServerAuthSession();

  return (
    <header className="bg-white">
      <nav
        aria-label="Global"
        className="flex items-center justify-between p-6 lg:px-8"
      >
        <div className="flex lg:flex-1">
          <a href="#" className="-m-1.5 p-1.5">
            <span className="sr-only">FitForge</span>
            <img alt="" src="/apple-touch-icon.png" className="h-8 w-auto" />
          </a>
        </div>
        <div className="flex lg:gap-x-12">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              {item.name}
            </a>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <Link
            href={session ? "/api/auth/signout" : "/api/auth/signin"}
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            {session ? "Sign out" : "Sign in"}
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
