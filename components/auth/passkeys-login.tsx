"use client";

import { get } from "@github/webauthn-json";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BsKey } from "react-icons/bs";
import { toast } from "sonner";
import { authApi } from "~/lib/api";
import { checkAvailablity } from "~/lib/passkeys";
import { Errs } from "~/types/errors";
import { Button } from "../ui/button";

export default function PassKeys() {
  const router = useRouter();
  const [support, setSupport] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAvailablity(setLoading, setSupport);
  }, []);

  const loginWithPassKey = async () => {
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
        authApi.post("/passkeys/login", {
          "cred": cred,
        });

        router.push("/");
      } catch (error) {
        const err = error as AxiosError<{
          status: Errs;
        }>;
        switch (err.response?.data.status) {
          case "passkey_cannot_be_verified":
            toast.error("PassKey cannot be verified");
            break;
          default:
            toast.error("Something went wrong");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("PassKey creation failed");
    }
  };

  return !loading
    ? (
      <>
        {support
          ? (
            <Button
              className="flex items-center justify-center gap-2"
              onClick={async () => await loginWithPassKey()}
            >
              <BsKey />
              Login with PassKey
            </Button>
          )
          : null}
      </>
    )
    : null;
}
