"use client";

import { useSearchParams } from "next/navigation";
import { useToast } from "~/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Errs } from "~/types/errors";
import { AddNewUsernameOAuth } from "./new-username-modal";

export function OAuthState() {
  const searchParams = useSearchParams();
  const state = searchParams.get('state');
  const { toast } = useToast();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state !== null) {
      switch (state as Errs) {
        case "add_a_username":
          setOpen(true);
          break;
        case "username_already_used":
          toast({
            title: "Already used",
            description: "username that you enetered is already being used by another user"
          })
          break;
        case "unauthorized":
          toast({
            title: "Failed",
            description: "Failed to connect the account"
          })
          break;
        case "username_already_used":
          toast({
            title: "Already used",
            description: "Username you chosed is already taken by another user"
          })
          break;
        default:
          toast({
            title: "Failed",
            description: "Something went wrong",
          })
      }
    }
    // eslint-disable-next-line
  }, [state])

  return (
    <AddNewUsernameOAuth
      open={open}
      setOpen={setOpen}
    />
  )
}

