"use client";

import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi, checkAccessToken } from "~/lib/api";
import { getUser } from "~/lib/user";
import { Errs } from "~/types/errors";
import { Button } from "../ui/button";

export default function Profile() {
  const user = getUser();
  const router = useRouter();

  return user
    ? (
      <img
        src={user.photo_url}
        alt={user.name}
        className="w-10 rounded-full"
        onClick={async () => {
          try {
            authApi.interceptors.request.use(checkAccessToken);
            await authApi.delete("/logout");
            router.push("/login");
          } catch (error) {
            const err = error as AxiosError<{
              status: Errs;
            }>;
            console.error(err.response?.data.status);
            toast.error("something went wrong");
          }
        }}
      />
    )
    : (
      <Button
        onClick={() => router.push("/login")}
      >
        Login
      </Button>
    );
}
