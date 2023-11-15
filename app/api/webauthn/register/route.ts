import { PublicKeyCredentialWithAttestationJSON } from "@github/webauthn-json";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { base64url } from "jose";
import { HOST_SETTINGS } from "~/lib/utils";

export const runtime = "nodejs";

const response = (
  status: number,
  isValid: boolean,
  credentialID: string | null,
  credentialPublicKey: string | null,
  err: any | null,
) => {
  return new Response(
    JSON.stringify({
      isValid: isValid,
      credentialID: credentialID,
      credentialPublicKey: credentialPublicKey,
      err: err ? JSON.stringify(err) : null,
    }),
    {
      status: status,
    },
  );
};

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    challenge: string;
    cred: PublicKeyCredentialWithAttestationJSON;
  };

  try {
    const { challenge, cred } = payload;
    if (!cred) {
      throw new Error("invalid credentials");
    }

    const verification = await verifyRegistrationResponse({
      // @ts-ignore
      response: cred,
      expectedChallenge: challenge,
      requireUserVerification: true,
      ...HOST_SETTINGS,
    });

    if (!verification.verified) {
      return response(
        200,
        false,
        null,
        null,
        "verification failed",
      );
    }

    const { credentialID, credentialPublicKey } = verification.registrationInfo ?? {};
    if (!credentialID || !credentialPublicKey) {
      return response(
        200,
        false,
        null,
        null,
        "public key and credential id not valid",
      );
    }

    return response(
      200,
      true,
      base64url.encode(credentialID),
      base64url.encode(credentialPublicKey),
      null,
    );
  } catch (error) {
    console.error(error);
    return response(
      500,
      false,
      null,
      null,
      error,
    );
  }
}
