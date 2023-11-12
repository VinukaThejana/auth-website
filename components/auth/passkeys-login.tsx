"use client";

import { get, supported } from "@github/webauthn-json";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { authApi, checkAccessToken } from "~/lib/api";
import { Button } from "../ui/button";

export default function PassKeys() {
  const [support, setSupport] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAvailablity = async () => {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setLoading(false);
      setSupport(available && supported());
    };

    checkAvailablity();
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

      console.log(cred);

      toast.success("Passkey created successfully");
    } catch (error) {
      console.error(error);
      toast.error("PassKey creation failed");
    }
  };

  return (
    <Button
      onClick={async () => await loginWithPassKey()}
    >
      Login with PassKey
    </Button>
  );
}
