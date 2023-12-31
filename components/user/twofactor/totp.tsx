"use client";

import { AxiosError } from "axios";
import { useQRCode } from "next-qrcode";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/components/ui/use-toast";
import { authApi, checkAccessToken } from "~/lib/api";
import { getUser } from "~/lib/user";
import { Errs } from "~/types/errors";

const ReAuthenticate = dynamic(() => import("~/components/auth/reauthenticate-modal"), {
  ssr: false,
});

export default function TOTP() {
  let user = getUser();
  const { toast } = useToast();
  const reAuthenticateTrigger = useRef<
    HTMLButtonElement | null
  >(null);
  const totpTrigger = useRef<HTMLButtonElement | null>(null);

  const { Canvas } = useQRCode();

  const [totpData, setTotpData] = useState<
    {
      url: string;
      secret: string;
    } | null
  >(null);
  const [stage, setStage] = useState<"1" | "2" | "3">("1");
  const [code, setCode] = useState("");
  const [memonicPhrase, setMemonicPhrase] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handler = async () => {
    authApi.interceptors.request.use(checkAccessToken);
    const res = await authApi.post<{
      status: Errs;
      secret: string;
      url: string;
    }>("/otp/generate");

    setTotpData({
      url: res.data.url,
      secret: res.data.secret,
    });

    totpTrigger.current?.click();
  };

  return (
    <>
      <Card className="w-80 sm:w-[600px] min-h-[200px] mt-4">
        <CardHeader>
          <CardTitle>
            Time based 2 factor authentication
          </CardTitle>

          <CardDescription>
            Enable time based 2 factor authentication by using a third party authenticator app such as Google
            Authenticator, Authy or 1Password
          </CardDescription>
        </CardHeader>

        <CardContent>
          {user && (
            <>
              {user.two_factor_enabled
                ? (
                  <div className="flex flex-col gap-4 ">
                    <div className="flex flex-col gap-2">
                      <span className="flex flex-col gap-1">
                        <Label htmlFor="username">
                          Username
                        </Label>
                        <Input
                          className="w-72"
                          name="username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.currentTarget.value)}
                        />
                      </span>

                      <span className="flex flex-col gap-1">
                        <Label htmlFor="password">
                          Password
                        </Label>
                        <Input
                          className="w-72"
                          name="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.currentTarget.value)}
                        />
                      </span>

                      <span className="flex flex-col gap-1">
                        <Label htmlFor="memonic_phrase">
                          Memonic Phrase
                        </Label>
                        <Input
                          className="w-72"
                          name="memonic_phrase"
                          type="text"
                          value={memonicPhrase}
                          onChange={(e) => setMemonicPhrase(e.currentTarget.value)}
                        />
                      </span>
                    </div>

                    <Button
                      className="bg-red-600 hover:bg-red-700 w-72"
                      onClick={async () => {
                        try {
                          if (
                            username === "" || password === "" || memonicPhrase === "" || !user
                            || user.username !== username
                          ) {
                            return;
                          }

                          authApi.interceptors.request.use(checkAccessToken);
                          await authApi.post("/otp/reset", {
                            "username": username,
                            "password": password,
                            "memonic_phrase": memonicPhrase,
                          });

                          user = getUser();

                          toast({
                            title: "Disabled two factor authentication",
                          });
                          return;
                        } catch (error) {
                          const err = error as AxiosError<{
                            status: Errs;
                          }>;
                          console.error(err.response?.data.status);
                          toast({
                            title: "Failed",
                            description: "Failed to disable two factor authentication",
                          });
                        }
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                )
                : (
                  <Button
                    className="bg-black text-white p-4 rounded-lg font-bold"
                    onClick={async () => {
                      try {
                        await handler();
                      } catch (error) {
                        const err = error as AxiosError<{
                          status: Errs;
                        }>;

                        if (err.response?.data.status !== "reauth_token_not_present") {
                          toast({
                            title: "Generation failed",
                            description: "Something went wrong",
                          });
                          return;
                        }

                        reAuthenticateTrigger.current?.click();
                      }
                    }}
                  >
                    Generate
                  </Button>
                )}
            </>
          )}
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
              await handler();
            }}
          />
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger
            ref={totpTrigger}
          >
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Enable two factor authentication
              </AlertDialogTitle>
            </AlertDialogHeader>

            <p>
              {stage === "2"
                ? "Verify yout TOTP code with your authenticator app"
                : stage === "1"
                ? "Open your prefered 2 factor authentication app and scan the below QR code"
                : stage === "3"
                ? "Save your memonic phrase some where secure"
                : ""}
            </p>

            <>
              {stage === "2"
                ? (
                  <>
                    <Label>
                      Enter the code
                    </Label>
                    <Input
                      type="text"
                      placeholder="123-456"
                      value={code}
                      onChange={(e) => setCode(e.currentTarget.value)}
                    />
                  </>
                )
                : (
                  <>
                    {stage === "1"
                      ? (
                        <>
                          {totpData && (
                            <>
                              <p>
                                Secret : {totpData.secret}
                              </p>
                              <Canvas
                                text={totpData.url}
                                options={{
                                  errorCorrectionLevel: "M",
                                  margin: 3,
                                  scale: 5,
                                  width: 300,
                                }}
                              />
                            </>
                          )}
                        </>
                      )
                      : (
                        <p>
                          {memonicPhrase}
                        </p>
                      )}
                  </>
                )}
            </>

            <AlertDialogFooter>
              <AlertDialogCancel>
                Dismiss
              </AlertDialogCancel>

              <Button
                onClick={async () => {
                  if (stage === "1") {
                    setStage("2");
                    return;
                  }

                  if (stage === "2") {
                    try {
                      authApi.interceptors.request.use(checkAccessToken);
                      const res = await authApi.post<{
                        status: Errs;
                        memonic_phrase: string;
                      }>("/otp/verify", {
                        "code": code,
                      });

                      setMemonicPhrase(res.data.memonic_phrase);

                      setStage("3");
                      return;
                    } catch (error) {
                      const err = error as AxiosError<{
                        status: Errs;
                      }>;
                      console.error(err.response?.data.status);
                      if (err.response?.data.status === "otp_token_is_not_valid") {
                        toast({
                          title: "Invalid",
                          description: "The OTP code you entered is not valid",
                        });
                        return;
                      } else {
                        toast({
                          title: "Failed",
                          description: "Something went wrong",
                        });
                      }
                      setStage("1");
                      return;
                    }
                  }
                  toast({
                    title: "Verified",
                    description: "Enabled TOTP 2 factor authentication",
                  });
                  totpTrigger.current?.click();
                  setStage("1");
                  user = getUser();
                  return;
                }}
              >
                {stage === "1" ? "Next" : stage === "2" ? "Verify" : "Done"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
