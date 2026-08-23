"use client"

import { useAction } from "convex/react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";

const GuestSignInButton = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const createSignInTicket = useAction(api.public.guest.createSignInTicket);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGuestSignIn = async () => {
    if (!isLoaded || isLoading) return;

    setIsLoading(true);

    try {
      const { ticket } = await createSignInTicket({});
      const attempt = await signIn.create({ strategy: "ticket", ticket });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.push("/");
      } else {
        toast.error("Guest sign-in failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Guest sign-in is unavailable right now.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="w-full"
      disabled={!isLoaded || isLoading}
      onClick={handleGuestSignIn}
      type="button"
      variant="default"
    >
      {isLoading ? "Signing in..." : "Continue as Guest"}
    </Button>
  );
};

export default GuestSignInButton;
