import { supported } from "@github/webauthn-json";
import { Dispatch, SetStateAction } from "react";

export async function checkAvailablity(
  setLoading: Dispatch<SetStateAction<boolean>>,
  setSupport: Dispatch<SetStateAction<boolean>>,
) {
  const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  setLoading(false);
  setSupport(available && supported());
}
