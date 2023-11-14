import { PublicKeyCredentialWithAttestationJSON } from "@github/webauthn-json";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { base64url } from "jose";
import { HOST_SETTINGS } from "~/lib/utils";
import { PassKey } from "~/types/passkeys";

const response = (
  status: number,
  isValid: boolean,
  newCounter: number | null,
  err: any | null,
) => {
  return new Response(
    JSON.stringify({
      isValid: isValid,
      newCounter: newCounter,
      err: err ? JSON.stringify(err) : null,
    }),
    {
      status: status,
    },
  );
};

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    passKey: PassKey;
    challenge: string;
    cred: PublicKeyCredentialWithAttestationJSON;
  };

  try {
    const { challenge, cred, passKey } = payload;
    if (!cred) {
      throw new Error("invalid credentials");
    }

    const verification = await verifyAuthenticationResponse({
      // @ts-ignore
      response: cred,
      expectedChallenge: challenge,
      authenticator: {
        credentialID: base64url.decode(passKey.PassKeyID),
        credentialPublicKey: base64url.decode(passKey.PublicKey),
        counter: passKey.Count,
      },
      ...HOST_SETTINGS,
    });

    if (!verification.verified) {
      return response(
        200,
        false,
        verification.authenticationInfo.newCounter,
        null,
      );
    }

    console.log("Validation was done successfully !");
    return response(
      200,
      true,
      verification.authenticationInfo.newCounter,
      null,
    );
  } catch (error) {
    console.error(error);
    return response(
      500,
      false,
      null,
      error,
    );
  }
}
