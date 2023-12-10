"use client";

import { Button } from "~/components/ui/button";
import { Icons } from "~/components/ui/icons";
import { BACKEND_URL } from "~/lib/utils";
import { OAuthState } from "./oauth-state";

export function OAuthProviders(props: {
  isLoading: boolean;
}) {
  const { isLoading } = props;
  return (
    <>
      <Button
        onClick={async () => {
          window.location.href = `${BACKEND_URL}/oauth/github/redirect`;
        }}
        variant="outline"
        type="button"
        disabled={isLoading}
      >
        {isLoading
          ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          : <Icons.gitHub className="mr-2 h-4 w-4" />} Github
      </Button>

      <OAuthState />
    </>
  );
}
