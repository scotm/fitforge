import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Link } from "lucide-react";
import { type Session } from "next-auth";
import { getServerAuthSession } from "~/server/auth";

const solutions = [
  {
    name: "User",
    description: "",
    href: "/user",
  },
  {
    name: "Sign out",
    description: "",
    href: "/api/auth/signout",
  },
];

export default async function UserMenu() {
  const session = await getServerAuthSession();

  if (!session)
    return (
      <Link
        href={"/api/auth/signin"}
        className="text-sm font-semibold leading-6 text-gray-900"
      >
        {"Sign in"}
      </Link>
    );
  return (
    <Popover className="relative">
      <PopoverButton className="inline-flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900">
        <span>{session.user.name}</span>
        <ChevronDownIcon aria-hidden="true" className="h-5 w-5" />
      </PopoverButton>

      <PopoverPanel
        transition
        className="absolute left-1/2 z-10 mt-5 flex w-screen max-w-max -translate-x-1/2 px-4 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
      >
        <div className="w-screen max-w-sm flex-auto rounded-3xl bg-white p-4 text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
          {solutions.map((item) => (
            <div
              key={item.name}
              className="relative rounded-lg p-4 hover:bg-gray-50"
            >
              <a href={item.href} className="font-semibold text-gray-900">
                {item.name}
                <span className="absolute inset-0" />
              </a>
              {item.description ? (
                <p className="mt-1 text-gray-600">{item.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      </PopoverPanel>
    </Popover>
  );
}
