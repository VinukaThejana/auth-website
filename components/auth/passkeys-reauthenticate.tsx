"use client";

import { get } from "@github/webauthn-json";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BsKey } from "react-icons/bs";
import { authApi, checkAccessToken } from "~/lib/api";
import { checkAvailablity } from "~/lib/passkeys";
import { Errs } from "~/types/errors";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";

interface ReAuthenticateProps extends React.HTMLAttributes<HTMLDivElement> {
  trigger: React.MutableRefObject<HTMLButtonElement | null>;
  bussinessLogic: () => Promise<void>;
  refetchFns?: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<any, Error>>;
}

export default function PassKeys({ className, ...props }: ReAuthenticateProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [support, setSupport] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAvailablity(setLoading, setSupport);
  }, []);

  const reAuthenticateWithPassKey = async () => {
    try {
      const res = await authApi.get<{
        status: string;
        challenge: string;
      }>("/passkeys/challenge");

      const cred = await get({
        publicKey: {
          challenge: res.data.challenge,
          timeout: 60000,
          userVerification: "required",
          rpId: "localhost",
        },
      });

      try {
        authApi.interceptors.request.use(checkAccessToken);
        await authApi.post("/reauthenticate/passkey", {
          "cred": cred,
        });

        try {
          await props.bussinessLogic();
          if (props.refetchFns) {
            await props.refetchFns();
          }

          props.trigger.current?.click();
        } catch (error) {
          toast({
            title: "Failed",
            description: "Failed to confirm your action",
          });
        }
      } catch (error) {
        const err = error as AxiosError<{
          status: Errs;
        }>;
        switch (err.response?.data.status) {
          case "passkey_cannot_be_verified":
            toast({
              title: "Failed",
              description: "Passkey cannot be verified",
            });
            break;
          default:
            toast({
              title: "Failed",
              description: "Something went wrong",
            });
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed",
        description: "Passkey creation failed",
      });
    }
  };

  return !loading
    ? (
      <>
        {support
          ? (
            <Button
              className="flex items-center justify-center gap-2"
              onClick={async () => await reAuthenticateWithPassKey()}
            >
              <BsKey />
              Confirm with PassKey
            </Button>
          )
          : null}
      </>
    )
    : null;
}
