"use client";

import { base64url } from "jose";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "~/components/ui/use-toast";
import { Errs } from "~/types/errors";
import { BasicOAuthProvider } from "~/types/oauth";
import { User } from "~/types/user";
import { AddNewUsernameOAuth } from "./new-username-modal";
import { LinkAccountWithOAuthProvider } from "./oauth-link-account-modal";

export function OAuthState() {
  const searchParams = useSearchParams();
  const state = searchParams.get("state");

  const { toast } = useToast();
  const router = useRouter();

  const [isAddUsernameOpen, setIsAddUsernameOpen] = useState(false);
  const [isLinkAccountOpen, setIsLinkAccountOpen] = useState(false);
  const [providerUser, setProviderUser] = useState<BasicOAuthProvider | null>(null);
  const [dbUser, setDBUser] = useState<User | null>(null);

  useEffect(() => {
    if (state !== null) {
      switch (state as Errs) {
        case "add_a_username":
          setIsAddUsernameOpen(true);
          break;
        case "username_already_used":
          toast({
            title: "Already used",
            description: "username that you enetered is already being used by another user",
          });
          break;
        case "unauthorized":
          toast({
            title: "Failed",
            description: "Failed to connect the account",
          });
          break;
        case "username_already_used":
          toast({
            title: "Already used",
            description: "Username you chosed is already taken by another user",
          });
          break;
        case "link_account_with_exsisting_email":
          const providerUserBase64 = searchParams.get("provider_user");
          const dbUserBase64 = searchParams.get("db_user");
          if (!providerUserBase64 || !dbUserBase64) {
            router.push("/");
            return;
          }

          try {
            const td = new TextDecoder();
            setProviderUser(JSON.parse(td.decode(base64url.decode(providerUserBase64))) as BasicOAuthProvider);
            setDBUser(JSON.parse(td.decode(base64url.decode(dbUserBase64))) as User);
            setIsLinkAccountOpen(true);
          } catch (error) {
            console.error(error);
            router.push("/");
            return;
          }

          break;
        default:
          toast({
            title: "Failed",
            description: "Something went wrong",
          });
      }
    }
    // eslint-disable-next-line
  }, [state]);

  return (
    <>
      <AddNewUsernameOAuth
        open={isAddUsernameOpen}
        setOpen={setIsAddUsernameOpen}
      />
      <LinkAccountWithOAuthProvider
        open={isLinkAccountOpen}
        providerUser={providerUser}
        dbUser={dbUser}
        setOpen={setIsLinkAccountOpen}
      />
    </>
  );
}
