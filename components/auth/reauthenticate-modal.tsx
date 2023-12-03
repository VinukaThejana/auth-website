"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { BsLock, BsUnlock } from "react-icons/bs";
import { string, z } from "zod";
import PassKeys from "~/components/auth/passkeys-reauthenticate";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/ui/icons";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/components/ui/use-toast";
import { FormError } from "~/components/util/form-error";
import { authApi, checkAccessToken, userApi } from "~/lib/api";
import { cn } from "~/lib/utils";
import { SessionToken } from "~/types/tokenSession";
import { User } from "~/types/user";
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "../ui/alert-dialog";

interface ReAuthenticateProps extends React.HTMLAttributes<HTMLDivElement> {
  trigger: React.MutableRefObject<HTMLButtonElement | null>;
  deviceID: string | null;
  refetchDevices: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<SessionToken[], Error>>;
}

export const schema = z.object({
  password: string()
    .min(1, {
      message: "Password is required",
    }),
});

export default function ReAuthenticate({ className, ...props }: ReAuthenticateProps) {
  const { toast } = useToast();

  const [isPasswordVisible, setPasswordVisible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const { register, handleSubmit, formState, reset } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });
  const { errors } = formState;

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    try {
      await authApi.post<{
        user: User;
        status: string;
      }>("/reauthenticate/password", {
        "password": values.password,
      });

      try {
        userApi.interceptors.request.use(checkAccessToken);
        await userApi.post("/devices/remove", {
          "id": props.deviceID,
        });

        await props.refetchDevices();
        props.trigger.current?.click();
      } catch (error) {
        toast({
          title: "Failed",
          description: "Failed to confirm your action",
        });
      }
    } catch (error) {
      const err = error as AxiosError<{
        status: string;
      }>;
      console.error(err);

      switch (err.response?.data.status) {
        case "incorrect_credentials":
          toast({
            title: "Failed",
            description: "Incorrect credentials",
          });
        default:
          toast({
            title: "Failed",
            description: "Something went wrong",
          });
      }
    }

    reset();
    setIsLoading(false);
  }
  return props.deviceID
    ? (
      <AlertDialogContent>
        <AlertDialogHeader>
          <h1>
            Confirm your action
          </h1>
        </AlertDialogHeader>

        <AlertDialogDescription>
          <div className={cn("grid gap-4", className)} {...props}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label className="" htmlFor="password">
                    Password
                  </Label>
                  <div className="grid grid-cols-5 gap-2">
                    <Input
                      id="password"
                      type={isPasswordVisible ? "text" : "password"}
                      autoCapitalize="none"
                      autoComplete="password"
                      autoCorrect="off"
                      disabled={isLoading}
                      className="col-span-4"
                      {...register("password")}
                    />
                    <span
                      className="border border-slate-200 rounded-lg inline-flex items-center justify-center col-span-1"
                      onClick={() => setPasswordVisible(!isPasswordVisible)}
                    >
                      {isPasswordVisible ? <BsUnlock /> : <BsLock />}
                    </span>
                  </div>
                  <FormError err={errors.password} />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !formState.isValid}
                >
                  {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm with your password
                </Button>
              </div>
            </form>

            <PassKeys
              refetchDevices={props.refetchDevices}
              trigger={props.trigger}
              deviceID={props.deviceID}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or confirm with
                </span>
              </div>
            </div>
            <Button variant="outline" type="button" disabled={isLoading}>
              {isLoading
                ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                : <Icons.gitHub className="mr-2 h-4 w-4" />} Github
            </Button>
          </div>
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel>
            Dismiss
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    )
    : null;
}