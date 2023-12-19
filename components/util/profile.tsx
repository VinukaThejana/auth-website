"use client";

import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authApi, checkAccessToken } from "~/lib/api";
import { getUser } from "~/lib/user";
import { Errs } from "~/types/errors";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";

export default function Profile() {
  const { data: user, status, refetch } = useQuery({
    queryKey: ["user"],
    queryFn: () => getUser(),
  });
  const router = useRouter();
  const { toast } = useToast();

  return (
    <>
      {status === "success"
        ? (
          <>
            {user
              ? (
                <Image
                  src={user.photo_url}
                  alt={user.name}
                  className="w-10 rounded-full"
                  width={100}
                  height={100}
                  onClick={async () => {
                    try {
                      authApi.interceptors.request.use(checkAccessToken);
                      await authApi.delete("/logout");
                      await refetch();
                      router.push("/login");
                    } catch (error) {
                      const err = error as AxiosError<{
                        status: Errs;
                      }>;
                      console.error(err.response?.data.status);
                      toast({
                        title: "Failed",
                        description: "Something went wrong",
                      });
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
              )}
          </>
        )
        : null}
    </>
  );
}
