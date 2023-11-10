import { PublicKeyCredentialWithAttestationJSON } from "@github/webauthn-json";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { binaryToBase64url, clean, HOST_SETTINGS } from "~/lib/utils";

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
      response: cred,
      expectedChallenge: challenge,
      requireUserVerification: true,
      ...HOST_SETTINGS,
    });

    if (!verification.verified) {
      return new Response(
        JSON.stringify({
          isValid: false,
          credentialID: null,
          credentialPublicKey: null,
          err: "cannot be verified",
        }),
        {
          status: 400,
        },
      );
    }

    const { credentialID, credentialPublicKey } = verification.registrationInfo ?? {};
    if (!credentialID || !credentialPublicKey) {
      return new Response(
        JSON.stringify({
          isValid: false,
          credentialID: null,
          credentialPublicKey: null,
          err: "public key and credential id not valid",
        }),
        {
          status: 400,
        },
      );
    }

    return new Response(JSON.stringify({
      isValid: true,
      credentialID: clean(binaryToBase64url(credentialID)),
      credentialPublicKey: Buffer.from(credentialPublicKey).toString("base64"),
      err: null,
    }));
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        isValid: false,
        credentialID: null,
        credentialPublicKey: null,
        err: error,
      }),
      {
        status: 500,
      },
    );
  }
}
