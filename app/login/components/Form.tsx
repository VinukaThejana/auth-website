"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { BsLock, BsUnlock } from "react-icons/bs";
import { z } from "zod";
import { OAuthProviders } from "~/components/auth/oauth";
import PassKeys from "~/components/auth/passkeys-login";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/ui/icons";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/components/ui/use-toast";
import { FormError } from "~/components/util/form-error";
import { authApi } from "~/lib/api";
import { cn } from "~/lib/utils";
import { Errs } from "~/types/errors";
import { User } from "~/types/user";
import { schema } from "../utils/schema";
import { Dialog, Transition } from '@headlessui/react'
import { AddNewUsernameOAuth } from "~/components/auth/new-username-modal";
import { HTMLAttributes, useEffect, useState } from "react";

interface UserAuthFormProps extends HTMLAttributes<HTMLDivElement> { }

export function LoginForm({ className, ...props }: UserAuthFormProps) {
  const searchParams = useSearchParams();
  const state = searchParams.get('state');

  const router = useRouter();
  const { toast } = useToast();

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [code, setCode] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state !== null) {
      switch (state as Errs) {
        case "add_a_username":
          setOpen(true);
          break;
        case "unauthorized":
          toast({
            title: "Failed",
            description: "Failed to connect the account"
          })
          break;
        default:
          toast({
            title: "Failed",
            description: "Something went wrong",
          })
      }
    }
    // eslint-disable-next-line
  }, [state])

  const { register, handleSubmit, formState, reset } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
    },
  });
  const { errors } = formState;

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    try {
      const res = await authApi.post<{
        user: User;
        status: string;
      }>("/login", {
        "username": values.username,
        "password": values.password,
      });

      if (res.data.user.two_factor_enabled) {
        setTwoFactorEnabled(true);
        setUser(res.data.user);
        setIsLoading(false);
        return;
      }

      toast({
        title: "Logged in",
      });
      router.push("/");
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

  return (
    <>
      <div className={cn("grid gap-4", className)} {...props}>
        <>
          {twoFactorEnabled
            ? (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label className="" htmlFor="code">
                    Enter the code
                  </Label>
                  <Input
                    id="code"
                    placeholder="123-456"
                    type="text"
                    autoCapitalize="none"
                    value={code}
                    onChange={(e) => setCode(e.currentTarget.value)}
                  />
                  <Button
                    onClick={async () => {
                      if (!user || code === "") {
                        toast({
                          title: "Error",
                          description: "Something went wrong",
                        });
                        return;
                      }
                      try {
                        await authApi.post("/otp/validate", {
                          "id": user.id,
                          "code": code,
                        });
                        setCode("");
                        setUser(null);
                        setIsLoading(false);

                        router.push("/");
                      } catch (error) {
                        const err = error as AxiosError<{
                          status: Errs;
                        }>;
                        switch (err.response?.data.status) {
                          case "otp_token_is_not_valid":
                            toast({
                              title: "Invalid OTP code",
                              description: "The OTP token that you provided is not valid",
                            });
                            break;
                          case "two_factor_verification_not_enabled":
                            toast({
                              title: "Two factor authentication is not enabled",
                              description:
                                "Two factor authentication is not enabled please enable two factor authentication and try again",
                            });
                            break;
                          default:
                            toast({
                              title: "Error",
                              description: "Something went wrong",
                            });
                        }
                      }
                    }}
                  >
                    Login
                  </Button>
                </div>
              </div>
            )
            : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label className="" htmlFor="username">
                      Username
                    </Label>
                    <div className="grid gap-2">
                      <Input
                        id="username"
                        placeholder="JohnDoe"
                        type="text"
                        autoCapitalize="none"
                        autoComplete="username webauthn"
                        autoCorrect="off"
                        disabled={isLoading}
                        {...register("username")}
                      />
                    </div>
                    <FormError err={errors.username} />
                  </div>
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
                    Sign In with Email
                  </Button>
                </div>
              </form>
            )}
        </>

        <PassKeys />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <OAuthProviders
          isLoading={isLoading}
        />
      </div>

      <AddNewUsernameOAuth
        open={open}
        setOpen={setOpen}
      />
    </>
  );
}
