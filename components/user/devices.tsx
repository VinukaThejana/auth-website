"use client";

import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { BsTrash } from "react-icons/bs";
import { authApi, checkAccessToken, checkApi, userApi } from "~/lib/api";
import { Errs } from "~/types/errors";
import { SessionToken } from "~/types/tokenSession";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useToast } from "../ui/use-toast";

export default function Devices() {
  const { data: devices, refetch: refetchDevices, isLoading: isFetchingDevices } = useQuery({
    queryKey: ["getLoggedInDevices"],
    queryFn: async () => {
      try {
        userApi.interceptors.request.use(checkAccessToken);
        const req = await userApi.get("/devices/list") as AxiosResponse<{
          sessions: SessionToken[];
        }>;
        if (!req.data || !req.data.sessions) {
          return [];
        }

        return req.data.sessions;
      } catch (error) {
        const err = error as AxiosError<{
          status: Errs;
        }>;
        console.error(err.response?.data.status);
        return [];
      }
    },
  });

  const { toast } = useToast();

  return (
    <Card className="w-80 sm:w-[700px] min-h-[300px]">
      <CardHeader>
        <CardTitle>Devices</CardTitle>
        <CardDescription>List of all the logged in devices</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col">
        {!isFetchingDevices
          ? (
            <>
              {devices
                ? (
                  <div className="flex flex-col gap-4">
                    {devices.map((device) => (
                      <Card
                        key={device.ID}
                        className="w-96"
                      >
                        <CardHeader>
                          <CardTitle>
                            {device.DeviceVendor} ({device.DeviceModel})
                          </CardTitle>
                        </CardHeader>

                        <CardDescription className="flex flex-col p-4 gap-4">
                          <p className="flex flex-col gap-1">
                            <span>
                              OS : {device.OSName}
                            </span>
                            <span>
                              Version : {device.OSVersion}
                            </span>
                          </p>
                          <Button
                            className="flex items-center justify-center gap-1 flex-row-reverse bg-red-600 hover:bg-red-700 w-56"
                            onClick={async () => {
                              try {
                                userApi.interceptors.request.use(checkAccessToken);
                                await userApi.post("/devices/remove", {
                                  "id": device.ID,
                                });
                              } catch (error) {
                                const err = error as AxiosError<{
                                  status: Errs;
                                }>;
                                // TODO: Handle ReAuthentication
                                console.log(err.response?.data.status);
                                toast({
                                  title: "Under development",
                                  description: "Add the reauthentication model",
                                });
                              }
                            }}
                          >
                            Logout from device
                            <BsTrash />
                          </Button>
                        </CardDescription>
                      </Card>
                    ))}
                  </div>
                )
                : null}
            </>
          )
          : null}
      </CardContent>
    </Card>
  );
}
