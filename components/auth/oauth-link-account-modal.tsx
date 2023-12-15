"use client";

import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Dispatch, Fragment, SetStateAction } from "react";
import { FaLink } from "react-icons/fa";
import { Button } from "~/components/ui/button";
import { BACKEND_URL, getFormalProviderName } from "~/lib/utils";
import { BasicOAuthProvider } from "~/types/oauth";
import { User } from "~/types/user";

export function LinkAccountWithOAuthProvider(props: {
  open: boolean;
  providerUser: BasicOAuthProvider | null;
  dbUser: User | null;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { providerUser, dbUser } = props;
  const router = useRouter();

  const searchParams = useSearchParams();
  const provider = searchParams.get("provider");

  const { open, setOpen } = props;
  function closeModal() {
    setOpen(false);
  }

  return (providerUser && dbUser) && (
    <Transition appear show={open} as={Fragment}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all flex flex-col gap-4">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Do you want to Link accounts ?
                </Dialog.Title>
                <p>
                  Do you want to link your exsiting account with your {getFormalProviderName(provider)} account ?
                </p>

                <div className="flex flex-row items-center justify-center gap-4">
                  <Image
                    alt={providerUser.Name}
                    src={providerUser.PhotoURL}
                    width={100}
                    height={100}
                  />

                  <FaLink />

                  <Image
                    alt={dbUser.name}
                    src={dbUser.photo_url}
                    width={100}
                    height={100}
                    className="rounded-md"
                  />
                </div>

                <div className="flex felx-row flex-row-reverse gap-2">
                  <Button
                    className="bg-red-600 hover:bg-red-500"
                    onClick={() => {
                      router.push("/");
                      closeModal();
                    }}
                  >
                    Dismiss
                  </Button>

                  <Button
                    onClick={() => {
                      window.location.href = `${BACKEND_URL}/oauth/github/link`;
                    }}
                  >
                    Link accounts
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
