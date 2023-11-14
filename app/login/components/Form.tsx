"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { BsLock, BsUnlock } from "react-icons/bs";
import { toast } from "sonner";
import { z } from "zod";
import PassKeys from "~/components/auth/passkeys-login";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/ui/icons";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { FormError } from "~/components/util/form-error";
import { authApi } from "~/lib/api";
import { cn } from "~/lib/utils";
import { User } from "~/types/user";
import { schema } from "../utils/schema";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function LoginForm({ className, ...props }: UserAuthFormProps) {
  const router = useRouter();

  const [isPasswordVisible, setPasswordVisible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

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

      toast.success("Logged in !");
      router.push("/");
    } catch (error) {
      const err = error as AxiosError<{
        status: string;
      }>;
      console.error(err);

      switch (err.response?.data.status) {
        case "incorrect_credentials":
          toast.error("Incorrect email or password");
        default:
          toast.error("Something went wrong");
      }
    }

    reset();
    setIsLoading(false);
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
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
                autoComplete="username"
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
                autoComplete="email"
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
          <PassKeys />
        </div>
      </form>
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
      <Button variant="outline" type="button" disabled={isLoading}>
        {isLoading
          ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          : <Icons.gitHub className="mr-2 h-4 w-4" />} Github
      </Button>
    </div>
  );
}
