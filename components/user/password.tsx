"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { checkAccessToken, userApi } from "~/lib/api";
import { AxiosError } from "axios";
import { Errs } from "~/types/errors";
import { Add } from "./passwords/add";



export default function Password() {
  const {
    data: isPasswordSet,
    status: isPasswordSetStatus,
  } = useQuery({
    queryKey: ["user_password"],
    queryFn: async () => {
      try {
        userApi.interceptors.request.use(checkAccessToken);
        const res = await userApi.get<{
          is_password_set: boolean
        }>("/password/status")

        return res.data.is_password_set
      } catch (error) {
        const err = error as AxiosError<{
          status: Errs
        }>
        console.error(err.response?.data.status)
        return false
      }
    }
  })

  return isPasswordSetStatus !== "pending" ? (
    <Card className="w-80 sm:w-[700px] min-h-[300px]">
      <CardHeader>
        <CardTitle>
          {isPasswordSet ? "Change your password" : "Set a password"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {!isPasswordSet ? (
          <Add />
        ) : null}
      </CardContent>
    </Card>
  ) : null
}

