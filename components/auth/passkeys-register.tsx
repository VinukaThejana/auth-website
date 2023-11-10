"use client";

import { create, supported } from "@github/webauthn-json";
import { Label } from "@radix-ui/react-label";
import { AxiosError } from "axios";
import { base64url } from "jose";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { POST } from "~/app/api/webauthn/register/route";
import { authApi, checkAccessToken } from "~/lib/api";
import { getUser } from "~/lib/user";
import { Button } from "../ui/button";

export default function PassKeys() {
  const user = getUser();

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

  const generatePassKey = async () => {
    if (!user) {
      return null;
    }

    try {
      authApi.interceptors.request.use(checkAccessToken);

      const res = await authApi.get<{
        status: string;
        challenge: string;
      }>("/passkeys/challenge");

      const cred = await create({
        publicKey: {
          challenge: res.data.challenge,
          rp: {
            name: "Auth",
            id: "localhost",
          },
          user: {
            id: user.id,
            name: user.username,
            displayName: user.name,
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          timeout: 60000,
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            requireResidentKey: true,
            userVerification: "required",
          },
        },
      });

      if (!cred) {
        throw new Error();
      }

      try {
        authApi.interceptors.request.use(checkAccessToken);
        await authApi.post("/passkeys/create", {
          "cred": cred,
        });
      } catch (error) {
        const err = error as AxiosError<{
          status: string;
        }>;
        console.log(err.response?.data.status);
      }
    } catch (error) {
      console.error(error);
      toast.error("PassKey creation failed");
    }
  };

  return (
    <>
      {user && (
        <>
          {!loading
            ? (
              <>
                {support
                  ? (
                    <>
                      <Button
                        onClick={async () => await generatePassKey()}
                      >
                        Generate a new PassKey
                      </Button>
                    </>
                  )
                  : <Label className="text-red-600">PassKeys are not supported on your device</Label>}
              </>
            )
            : null}
        </>
      )}
    </>
  );
}
