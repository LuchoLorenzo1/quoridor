"use client";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";

const Navbar = () => {
  const { data } = useSession();

  return (
    <nav className="flex max-h-12 w-full max-w-7xl items-center justify-between gap-2 mt-1 mb-4">
      <div className="flex gap-3 items-center mx-5">
        <NavLink href="/" text="Home" />
        <NavLink href="/offline" text="Freeboard" />
        <NavLink href="/offline" text="How to Play" />
      </div>
      <div className="flex gap-3 items-center mx-3">
        {data ? (
          <>
            <NavLink callback={() => signOut()} text="Sign out" />
            <Link href={`/profile/${data.user.id}`}>
              <Image
                src={data.user?.image || "/default_profile_picture.png"}
                width={35}
                height={35}
                alt="profile picture"
                className="min-w-[35px] rounded-full hover:opacity-50"
              />
            </Link>
          </>
        ) : (
          <NavLink href="/signin" text="Sign in" />
        )}
      </div>
    </nav>
  );
};

export default Navbar;

const NavLinkClass =
  "rounded-md text-stone-600 bg-stone-200 px-4 py-1 text-center text-sm font-bold text-background hover:bg-stone-600 hover:text-stone-200 outline-none select-none";
const NavLink = ({
  href,
  text,
  callback,
}: {
  href?: string;
  text: string;
  callback?: () => void;
}) => {
  if (href) {
    return (
      <Link draggable={false} href={href} className={NavLinkClass}>
        {text}
      </Link>
    );
  }
  return (
    <button draggable={false} onClick={callback} className={NavLinkClass}>
      Sign Out
    </button>
  );
};
