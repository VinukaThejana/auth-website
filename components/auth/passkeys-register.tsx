"use client";

import { create } from "@github/webauthn-json";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { BsPencil, BsSave, BsTrash } from "react-icons/bs";
import { toast } from "sonner";
import { z } from "zod";
import { authApi, checkAccessToken } from "~/lib/api";
import { checkAvailablity } from "~/lib/passkeys";
import { getUser } from "~/lib/user";
import { Errs } from "~/types/errors";
import { PassKey } from "~/types/passkeys";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function PassKeys() {
  const user = getUser();

  const [support, setSupport] = useState(false);
  const [loading, setLoading] = useState(true);

  const [passKeyName, setPassKeyName] = useState("");
  const [editingPassKey, setEditingPassKey] = useState<string | undefined>(undefined);

  const {
    data: passKeysData,
    isLoading: isPassKeysLoading,
    refetch: refetchPassKeys,
  } = useQuery({
    queryKey: ["getPassKeys"],
    queryFn: async () => {
      try {
        authApi.interceptors.request.use(checkAccessToken);
        const res = await authApi.get<{
          status: Errs;
          passKeys: PassKey[];
        }>("/passkeys/get");

        return {
          passkeys: res.data.passKeys,
        };
      } catch (error) {
        const err = error as AxiosError<{
          status: Errs;
          passKeys: PassKey[];
        }>;
        if (!err.response) {
          return {
            passkeys: [],
          };
        }

        return {
          passkeys: err.response.data.passKeys,
        };
      }
    },
  });

  useEffect(() => {
    checkAvailablity(setLoading, setSupport);
  }, []);

  const generatePassKey = async (name: string) => {
    if (!user) {
      return null;
    }

    try {
      authApi.interceptors.request.use(checkAccessToken);

      const res = await authApi.get<{
        status: string;
        challenge: string;
      }>("/passkeys/challenge");

      const cred = await create({
        publicKey: {
          challenge: res.data.challenge,
          rp: {
            name: "Auth",
            id: "localhost",
          },
          user: {
            id: user.id,
            name: user.username,
            displayName: user.name,
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          timeout: 60000,
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            requireResidentKey: true,
            userVerification: "required",
          },
        },
      });

      if (!cred) {
        throw new Error();
      }

      try {
        authApi.interceptors.request.use(checkAccessToken);
        await authApi.post("/passkeys/create", {
          "name": name,
          "cred": cred,
        });

        toast.success("PassKey created successfully !");
      } catch (error) {
        const err = error as AxiosError<{
          status: Errs;
        }>;
        if (!err.response) {
          toast.error("PassKey creation failed");
          return;
        }

        switch (err.response.data.status) {
          case "passkey_cannot_be_verified":
            toast.error("PassKey cannot be verified");
            break;
          case "passkey_already_created":
            toast.error("PassKey has already been created");
            break;
          case "internal_server_error":
            toast.error("Something went wrong");
            break;
          default:
            toast.error("PassKey creation failed");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("PassKey creation failed");
    }
  };

  return (
    <Card className="w-80 sm:w-[700px] min-h-[300px]">
      <CardHeader>
        <CardTitle>PassKeys</CardTitle>
        <CardDescription>Create and manage passkeys</CardDescription>
      </CardHeader>

      <CardContent>
        {user && (
          <>
            {!loading
              ? (
                <>
                  {support
                    ? (
                      <>
                        <AlertDialog>
                          <AlertDialogTrigger className="bg-black text-white p-4 rounded-lg font-bold">
                            Generate PassKey
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Enter a name for the passkey
                              </AlertDialogTitle>

                              <AlertDialogDescription>
                                <div className="flex flex-col gap-4 mx-4 my-6">
                                  <Label>
                                    Enter a name for the PassKey
                                  </Label>
                                  <Input
                                    className="w-96"
                                    value={passKeyName}
                                    onChange={(e) => setPassKeyName(e.currentTarget.value)}
                                  />
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  try {
                                    const name = z.string().min(3).max(100).parse(passKeyName);
                                    await generatePassKey(name);
                                    await refetchPassKeys();
                                    setPassKeyName("");
                                  } catch (error) {
                                    toast.error("PassKey name is not valid");
                                  }
                                }}
                              >
                                Create
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <div className="flex flex-col justify-center">
                          {isPassKeysLoading ? null : (
                            <>
                              {passKeysData && (
                                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 mt-6 items-center">
                                  {passKeysData.passkeys?.map((passKey, n) => (
                                    <Card
                                      key={n}
                                      className="p-4 w-full"
                                    >
                                      <CardHeader>
                                        <CardTitle>
                                          {editingPassKey === passKey.PassKeyID
                                            ? (
                                              <>
                                                <Input
                                                  className="w-48"
                                                  placeholder={passKey.Name}
                                                  value={passKeyName}
                                                  onChange={(e) => setPassKeyName(e.currentTarget.value)}
                                                />
                                              </>
                                            )
                                            : (
                                              <>
                                                {passKey.Name}
                                              </>
                                            )}
                                        </CardTitle>
                                      </CardHeader>

                                      <div className="flex flex-col justify-center ml-4 gap-2">
                                        <p className="truncate">
                                          {passKey.PassKeyID}
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                          <Button
                                            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-800"
                                            onClick={async () => {
                                              authApi.interceptors.request.use(checkAccessToken);
                                              try {
                                                await authApi.post("/passkeys/delete", {
                                                  "passKeyID": passKey.PassKeyID,
                                                });
                                              } catch (error) {
                                                const err = error as AxiosError<{
                                                  status: Errs;
                                                }>;
                                                switch (err.response?.data.status) {
                                                  case "passkey_with_the_given_id_is_not_found":
                                                    toast.error("PassKey with the given ID is not found");
                                                    break;
                                                  default:
                                                    toast.error("Something went wrong");
                                                }
                                              }

                                              await refetchPassKeys();
                                            }}
                                          >
                                            <BsTrash /> Delete
                                          </Button>
                                          <>
                                            {editingPassKey === passKey.PassKeyID
                                              ? (
                                                <Button
                                                  className="flex items-center justify-center gap-2"
                                                  onClick={async () => {
                                                    setEditingPassKey(undefined);
                                                    if (passKey.Name === passKeyName) {
                                                      return;
                                                    }

                                                    authApi.interceptors.request.use(checkAccessToken);
                                                    try {
                                                      await authApi.post<{
                                                        status: Errs;
                                                      }>("/passkeys/edit", {
                                                        "passKeyID": passKey.PassKeyID,
                                                        "newName": passKeyName,
                                                      });
                                                    } catch (error) {
                                                      const err = error as AxiosError<{
                                                        status: Errs;
                                                      }>;
                                                      switch (err.response?.data.status) {
                                                        case "passkey_with_the_given_id_is_not_found":
                                                          toast.error("PassKey with the given ID is not found");
                                                          break;
                                                        default:
                                                          toast.error("Something went wrong");
                                                      }
                                                    }

                                                    await refetchPassKeys();
                                                  }}
                                                >
                                                  <BsSave /> Save
                                                </Button>
                                              )
                                              : (
                                                <Button
                                                  className="flex items-center justify-center gap-2"
                                                  onClick={() => setEditingPassKey(passKey.PassKeyID)}
                                                >
                                                  <BsPencil /> Edit
                                                </Button>
                                              )}
                                          </>
                                        </div>
                                      </div>
                                    </Card>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </>
                    )
                    : <Label className="text-red-600">PassKeys are not supported on your device</Label>}
                </>
              )
              : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
