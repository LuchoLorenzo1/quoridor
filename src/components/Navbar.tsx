import authOptions from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";
import Image from "next/image";

const Navbar = async () => {
  const session = await getServerSession(authOptions);
  return (
    <nav className="flex max-h-12 items-center justify-center gap-2 border-black bg-background-300 px-4 py-1 sm:gap-3 md:gap-4">
      {session ? (
        <>
          <Link href="/profile">
            <Image
              src={session.user?.image || "/default_profile_picture.png"}
              width={35}
              height={35}
              alt="profile picture"
              className="min-w-[35px] rounded-full hover:opacity-50"
            />
          </Link>
          <Link className="min-w-fit px-2" href="/api/auth/signout">
            Sign Out
          </Link>
        </>
      ) : (
        <Link className="min-w-fit px-2" href="/api/auth/signin">
          Sign In
        </Link>
      )}
    </nav>
  );
};

export default Navbar;
