"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";
import GoogleSignInButton from "@/components/GoogleSignInButton";

const SignIn = () => {
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();
  const { status } = useSession();

  if (status == "loading") {
    return <Spinner />;
  } else if (status == "authenticated") {
    router.push("/");
    return;
  }

  const HandleGoogleAuth = async () => {
    if (isLoading) return;

    const res = await signIn("google", { callbackUrl: "/" });
    if (!res) return;
    if (res.error) {
      alert(`ERROR ${res.error}`);
      setLoading(false);
      return;
    }

    if (res.ok) return router.push("/");
  };

  return (
    <div className="rounded-md  flex flex-col items-center gap-3 text-stone-600 border-2 border-stone-600 p-3">
      <h1 className="text-4xl">Sign In to play quoridor!</h1>
      <GoogleSignInButton onClick={() => HandleGoogleAuth()} />
    </div>
  );
};

export default SignIn;
