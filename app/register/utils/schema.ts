import { z, string } from "zod"


export const schema = z.object({
  name: string()
    .min(1, {
      message: "Name is required"
    })
    .min(3, {
      message: "Must be more than 3 characters"
    })
    .max(20, {
      message: "Must be smaller than 20 characters"
    }),
  username: string()
    .min(1, {
      message: "Username is required"
    })
    .min(2, {
      message: "Must be larger than 3 characters"
    })
    .max(15, {
      message: "Must be smaller than 15 characters"
    })
    .regex(new RegExp("^[a-zA-Z0-9_.#]{1,20}$")),
  email: string().email({
    message: "Must be a valid email"
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
  confirmPassword: string()
    .min(1, {
      message: "You must confirm your password"
    })
}).refine((data) => data.password == data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match"
})
