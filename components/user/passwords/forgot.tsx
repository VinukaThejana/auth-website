import { Dialog, Transition } from '@headlessui/react'
import { AxiosError } from 'axios';
import { Dispatch, Fragment, SetStateAction, useRef, useState, } from 'react'
import { ZodError, ZodErrorMap, string } from 'zod';
import { Button } from '~/components/ui/button';
import { Icons } from '~/components/ui/icons';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useToast } from '~/components/ui/use-toast';
import { userApi } from '~/lib/api';
import { isNumeric } from '~/lib/utils';
import { Errs } from '~/types/errors';

export function Forgot(props: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>
}) {
  const { isOpen, setIsOpen } = props;
  const { toast } = useToast();

  const refs = new Array(
    {
      ID: "EF83406DE72E4375807C34C4D15FE6E9",
      ref: useRef<HTMLInputElement | null>(null)
    },
    {
      ID: "CD9CBF0E955D42E8B64B04A331F62502",
      ref: useRef<HTMLInputElement | null>(null)
    },
    {
      ID: "D898A01AFE9149CF96D4544195B37709",
      ref: useRef<HTMLInputElement | null>(null)
    },
    {
      ID: "2881794304064647BB30F7BBF2DBADE4",
      ref: useRef<HTMLInputElement | null>(null)
    },
    {
      ID: "FB11CF65AD52412687B3FB999B154AFE",
      ref: useRef<HTMLInputElement | null>(null)
    },
    {
      ID: "FB11CF65AD52412687V3FB995B154BFE",
      ref: useRef<HTMLInputElement | null>(null),
    }
  )

  const [code, setCode] = useState<string[]>(Array(refs.length).fill("-"))
  const [password, setPassword] = useState("");

  const [otpErr, setOTPErr] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [loading, setLoading] = useState(false);

  function closeModal() {
    setIsOpen(false)
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Create a new password
                </Dialog.Title>
                <div className="mt-2 flex flex-col">
                  <Label
                    className='mt-5 mb-3'
                  >
                    Enter the OTP sent to your email
                  </Label>
                  <div className="flex flex-row items-center justify-between mx-auto w-full">
                    {refs.map((n, i) => (
                      <div
                        key={n.ID}
                        className="w-16 h-16 "
                      >
                        <input
                          ref={n.ref}
                          className="w-full h-full flex flex-col items-center justify-center text-center px-5 outline-none rounded-xl border border-gray-200 text-lg bg-white focus:bg-gray-50 focus:ring-1 ring-blue-700"
                          type="text"
                          maxLength={1}
                          onChange={(e) => {
                            if (otpErr !== "") {
                              setOTPErr("");
                            }
                            const value = e.currentTarget.value;
                            if (!isNumeric(value)) {
                              e.currentTarget.value = ""
                              return;
                            }

                            const otp = [...code]
                            if (value !== "") {
                              otp[i] = value;
                            } else {
                              otp[i] = "-"
                            }
                            setCode(otp)

                            if (i === refs.length - 1) {
                              return;
                            }

                            refs[i + 1].ref.current?.focus()
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Backspace") {
                              const otp = [...code];
                              if (otp[i] !== "-") {
                                otp[i] = "-";
                                setCode(otp);
                              }
                              if (i === 0) {
                                if (e.currentTarget.value !== "") {
                                  e.currentTarget.value === ""
                                  return
                                }
                                return
                              }

                              e.currentTarget.value = "";
                              refs[i - 1].ref.current?.focus()
                            }

                            if (e.keyCode === 37 && i !== 0) {
                              refs[i - 1].ref.current?.focus()
                            }

                            if (e.keyCode === 39 && i !== refs.length - 1) {
                              refs[i + 1].ref.current?.focus()
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <p className='mt-1 font-semibold text-xs text-red-600'>{otpErr}</p>

                  <div
                    className='flex flex-col gap-2 mt-5'
                  >
                    <Label
                    >
                      Enter the new password
                    </Label>

                    <Input
                      type='text'
                      value={password}
                      onChange={(e) => {
                        setPasswordErr("");
                        setPassword(e.currentTarget.value);
                      }}
                    />
                    <p className='mt-1 font-semibold text-xs text-red-600'>{passwordErr}</p>
                  </div>
                </div>

                <div className="flex flex-row-reverse mt-6">
                  <Button
                    disabled={loading}
                    onClick={async () => {
                      setLoading(true)
                      if (code.includes("-")) {
                        setOTPErr("The OTP provided is invalid");
                        return
                      }
                      try {
                        string()
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
                          }).parse(password)
                      } catch (error) {
                        setLoading(false);
                        // @ts-ignore
                        const arr = JSON.parse(error.toString()) as {
                          message: string
                        }[]
                        setPasswordErr(arr[0].message)
                        return;
                      }
                      var otp = ""
                      code.map((n, i) => {
                        if (i === 3) {
                          otp = `${otp}-${n}`
                        } else {
                          otp = `${otp}${n}`
                        }
                      })

                      try {
                        await userApi.post("/password/reset", {
                          new_password: password,
                          otp: otp,
                        })

                        toast({
                          title: "Password changed successfully"
                        })
                        setLoading(false)
                        closeModal()
                      } catch (error) {
                        setLoading(false)
                        // @ts-ignore
                        const err = error.response.data.status as Errs
                        switch (err) {
                          case "otp_token_is_not_valid":
                            toast({
                              title: "OTP is not valid"
                            })
                            break
                          case "otp_token_expired":
                            toast({
                              title: "OTP token is expired"
                            })
                            break;
                          case "bad_request":
                            toast({
                              title: "Bad request"
                            })
                            break;
                          default:
                            toast({
                              title: "Something went wrong"
                            })
                        }
                        setLoading(false)
                      }
                    }}
                  >
                    {loading ? <Icons.spinner className='mr-2 h-4 w-4 animate-spin' /> : "Reset your password"}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
