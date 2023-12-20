"use client";

import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { BsTrash } from "react-icons/bs";
import { checkAccessToken, userApi } from "~/lib/api";
import { Errs } from "~/types/errors";
import { SessionToken } from "~/types/tokenSession";
import { AlertDialog, AlertDialogTrigger } from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useToast } from "../ui/use-toast";
import Image from "next/image";

const ReAuthenticate = dynamic(() => import("~/components/auth/reauthenticate-modal"), {
  ssr: false,
});

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
  const reAuthenticateTrigger = useRef<
    HTMLButtonElement | null
  >(null);
  const [removeDeviceID, setRemoveDeviceID] = useState<string | null>(null);

  return (
    <>
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
                            <span className="flex flex-col gap-1">
                              <Image
                                src={device.MapURL}
                                alt={device.IPAddress}
                                width={400}
                                height={250}
                                onClick={() => {
                                  window.location.href = `http://maps.google.com/maps?z=12&t=m&q=loc:${device.Lat}+${device.Lon}`
                                }}
                                className="hover:cursor-pointer"
                              />
                              <div
                                className="flex flex-col justify-center mt-3"
                              >
                                <span
                                  className="font-bold"
                                >
                                  {device.Country}, {device.City} ({device.Zip})
                                </span>
                                <span
                                  className="font-semibold"
                                >
                                  {device.Timezone}
                                </span>
                                <span>
                                  {device.OSName} ({device.OSVersion})
                                </span>
                              </div>
                            </span>
                            <Button
                              className="flex items-center justify-center gap-1 flex-row-reverse bg-red-600 hover:bg-red-700 w-56"
                              onClick={async () => {
                                try {
                                  userApi.interceptors.request.use(checkAccessToken);
                                  await userApi.post("/devices/remove", {
                                    id: device.ID,
                                  });

                                  await refetchDevices();
                                } catch (error) {
                                  const err = error as AxiosError<{
                                    status: Errs;
                                  }>;
                                  if (err.response?.data.status !== "reauth_token_not_present") {
                                    console.error(err.response?.data.status);
                                    toast({
                                      title: "Failed",
                                      description: "Something went wrong",
                                    });
                                  }

                                  setRemoveDeviceID(device.ID);
                                  reAuthenticateTrigger.current?.click();
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

      <div>
        <AlertDialog>
          <AlertDialogTrigger
            ref={reAuthenticateTrigger}
          >
          </AlertDialogTrigger>

          <ReAuthenticate
            trigger={reAuthenticateTrigger}
            bussinessLogic={async () => {
              userApi.interceptors.request.use(checkAccessToken);
              await userApi.post("/devices/remove", {
                id: removeDeviceID,
              });
            }}
            refetchFns={refetchDevices}
          />
        </AlertDialog>
      </div>
    </>
  );
}
