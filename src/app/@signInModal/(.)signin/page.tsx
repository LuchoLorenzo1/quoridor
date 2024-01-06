"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Cross2Icon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import GoogleSVG from "@/components/GoogleSvg";
import { IoMdClose } from "react-icons/io";
import GoogleSignInButton from "@/components/GoogleSignInButton";

const SignInModal = () => {
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();
  const { status } = useSession();

  if (status == "loading") {
    return;
  } else if (status == "authenticated") {
    return router.replace("/");
  }

  const HandleGoogleAuth = async () => {
    if (isLoading) return;

    const res = await signIn("google");
    if (!res) return;
    if (res.error) {
      alert(`ERROR ${res.error}`);
      setLoading(false);
      return;
    }

    if (res.ok) return router.push("/");
  };

  return (
    <Dialog.Root
      defaultOpen={true}
      onOpenChange={(p) => (!p ? router.back() : "")}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/10 fixed inset-0" />
        <Dialog.Content className="flex flex-col gap-5 w-full max-w-xl h-full max-h-40 items-center text-stone-600 bg-white z-50 p-5 rounded-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {" "}
          <Dialog.Close
            asChild
            className="focus:shadown-none focus:border-none focus:outline-none active:outline-none"
          >
            <button
              className="absolute right-1 top-1 text-2xl inline-flex appearance-none items-center justify-center rounded-full group hover:bg-stone-600"
              aria-label="Close"
            >
              <IoMdClose className="group-hover:text-stone-100" />
            </button>
          </Dialog.Close>
          <Dialog.Title className="text-3xl font-bold text-center">
            Sign in to play online!
          </Dialog.Title>
          <GoogleSignInButton onClick={() => HandleGoogleAuth()} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SignInModal;
