import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BsLock, BsUnlock } from "react-icons/bs";
import { string, z } from "zod";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/ui/icons";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/components/ui/use-toast";
import { FormError } from "~/components/util/form-error";
import { checkAccessToken, userApi } from "~/lib/api";


const schema = z.object({
  oldPassword: string().min(1, {
    message: "Old password is required"
  }),
  password: string()
    .min(1, {
      message: "Password is required"
    })
    .min(10, {
      message: "Must contain more than 10 characters"
    })
    .max(200, {
      message: "Must be smaller than 200 characters"
    })
    .regex(new RegExp(".*[A-Z]."), {
      message: "Must contain one uppercase letter"
    })
    .regex(new RegExp(".*[a-z].*"), {
      message: "Must contain one number"
    })
    .regex(new RegExp(".*\\d.*"), {
      message: "Must contain one number"
    }),
})

export function Change() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const { register, formState, handleSubmit, reset } = useForm<
    z.infer<typeof schema>
  >({
    resolver: zodResolver(schema),
  });
  const { errors } = formState;

  return (
    <form
      className="w-6/12 flex flex-col gap-4 mt-4"
      onSubmit={handleSubmit(async (event) => {
        try {
          userApi.interceptors.request.use(checkAccessToken);
          await userApi.post("/password/change", {
            old_password: event.oldPassword,
            password: event.password
          })
          await queryClient.refetchQueries({
            queryKey: ["user_password"]
          })
          reset();
        } catch (error) {
          console.error(error)
          toast({
            title: "Something went wrong"
          })
        }
      })}
    >
      <div className="grid gap-2">
        <Label className="" htmlFor="confirmPassword">
          Old Password
        </Label>
        <Input
          id="oldPassword"
          type={isPasswordVisible ? "text" : "password"}
          autoCapitalize="none"
          autoCorrect="off"
          {...register("oldPassword")}
        />
        <FormError err={errors.oldPassword} />
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
        className="w-1/2"
        type="submit"
      >
        {queryClient.getQueryState(["user_password"])?.status === "pending" ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : "Change Password"}
      </Button>
    </form>
  )
}
