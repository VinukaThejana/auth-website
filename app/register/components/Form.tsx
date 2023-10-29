"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { Icons } from "~/components/ui/icons"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { z } from "zod"
import { BsUnlock, BsLock } from "react-icons/bs"
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai"
import { useForm, useFormState } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormError } from "~/components/util/form-error"
import debounce from "lodash.debounce"
import { schema } from "../utils/schema"
import { authApi, checkApi } from "~/lib/api"
import { toast } from "sonner"
import { AxiosError } from "axios"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> { }

type UsernameStartValidation = {
  type: 'start_validation'
}
type UsernameIsValid = {
  type: 'is_valid'
}
type UsernameIsNotValid = {
  type: 'is_not_valid'
}

type UsernameAppAction = UsernameStartValidation | UsernameIsValid | UsernameIsNotValid
type UsernameAppState = {
  isValidating: boolean
  isValid: boolean
}

const usernameReducerFn = (state: UsernameAppState, action: UsernameAppAction) => {
  switch (action.type) {
    case "start_validation":
      return {
        isValidating: true,
        isValid: false
      }
    case "is_valid":
      return {
        isValidating: false,
        isValid: true
      }
    case "is_not_valid":
      return {
        isValidating: false,
        isValid: false
      }
    default:
      return state
  }
}

export function RegisterForm({ className, ...props }: UserAuthFormProps) {
  const [isPasswordVisible, setPasswordVisible] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const [usernameState, usernameDispatch] = React.useReducer(usernameReducerFn, {
    isValidating: false,
    isValid: false
  })

  const { register, handleSubmit, formState, watch, control, setError, reset, clearErrors } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: ""
    }
  })
  const { errors } = formState
  const { dirtyFields } = useFormState({
    control
  })

  const username = watch("username")

  const checkUsername = React.useCallback(
    debounce(async (username: string) => {
      if (username.length === 0) {
        clearErrors("username")
        return
      }
      if (!(username.length >= 3 && username.length <= 15)) {
        return
      }
      if (errors.username && errors.username.message !== undefined) {
        return
      }

      clearErrors("username")
      usernameDispatch({
        type: "start_validation"
      })

      try {
        const payload = await checkApi.post<{
          status: string;
          is_available: boolean
        }>("/username", {
          "username": username
        })

        if (payload.data.is_available) {
          usernameDispatch({
            type: "is_valid"
          })
          clearErrors("username")
        } else {
          usernameDispatch({
            type: "is_not_valid"
          })
          dirtyFields.username && setError("username", {
            type: "custom",
            message: "Already used"
          })
        }

      } catch (error) {
        console.error(error)
        usernameDispatch({
          type: "is_not_valid"
        })
        dirtyFields.username && setError("username", {
          type: "custom",
          message: "Try again ... "
        })
      }
    }, 500),
    []
  )

  React.useEffect(() => {
    checkUsername(username)
  }, [username])

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true)
    try {
      await authApi.post<{
        status: string
      }>("/register", {
        "name": values.name,
        "username": values.username,
        "email": values.email,
        "password": values.password,
      })

      toast.success("Account created successfully")
      reset()
    } catch (error) {
      const err = error as AxiosError<{
        status: string
      }>
      console.error(err)

      switch (err.response?.data.status) {
        case "email_already_used":
          toast.error("Email already used")
          break
        case "username_already_used":
          toast.error("Username already used")
          break
        default:
          toast.error("Something went wrong")
          break
      }
    }
    setIsLoading(false)
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label className="" htmlFor="name">
              Name
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              type="text"
              autoCapitalize="none"
              autoComplete="name"
              autoCorrect="off"
              disabled={isLoading}
              {...register("name")}
            />
            <FormError err={errors.name} />
          </div>
          <div className="grid gap-2">
            <Label className="" htmlFor="username">
              Username
            </Label>
            <div className="grid grid-cols-5 gap-2">
              <Input
                id="username"
                placeholder="JohnDoe"
                type="text"
                autoCapitalize="none"
                autoComplete="username"
                autoCorrect="off"
                disabled={isLoading}
                className="col-span-4"
                {...register("username")}
              />
              <span
                className="border border-slate-200 rounded-lg inline-flex items-center justify-center col-span-1"
              >
                {usernameState.isValidating ? (
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {usernameState.isValid ? (
                      <AiOutlineCheckCircle />
                    ) : (
                      <AiOutlineCloseCircle />
                    )}
                  </>
                )}
              </span>
            </div>
            <FormError err={errors.username} />
          </div>
          <div className="grid gap-2">
            <Label className="" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              {...register("email")}
            />
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
          <div className="grid gap-2">
            <Label className="" htmlFor="confirmPassword">
              Confirm password
            </Label>
            <Input
              id="confirmPassword"
              type={isPasswordVisible ? "text" : "password"}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              {...register("confirmPassword")}
            />
            <FormError err={errors.confirmPassword} />
          </div>
          <Button
            type="submit"
            disabled={isLoading || usernameState.isValidating || !usernameState.isValid || !formState.isValid}
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In with Email
          </Button>
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
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.gitHub className="mr-2 h-4 w-4" />
        )}{" "}
        Github
      </Button>
    </div>
  )
}
