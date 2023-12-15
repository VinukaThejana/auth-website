"use client";

import { Dialog, Transition } from '@headlessui/react'
import debounce from 'lodash.debounce';
import { Dispatch, Fragment, SetStateAction, useCallback, useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { checkApi } from '~/lib/api';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { BACKEND_URL } from '~/lib/utils';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

export function AddNewUsernameOAuth(props: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();

  const searchParams = useSearchParams();
  const provider = searchParams.get('provider');

  const [usernameErr, setUsernameErr] = useState("");
  const [username, setUsername] = useState("");

  const { open, setOpen } = props;
  function closeModal() {
    setUsername("");
    setUsernameErr("");
    setOpen(false);
  }

  // eslint-disable-next-line
  const checkUsername = useCallback(
    debounce(async (username: string) => {
      if (username.length === 0) {
        setUsernameErr("");
        return;
      }
      if (!(username.length >= 3 && username.length <= 15)) {
        return;
      }
      if (usernameErr !== "") {
        return;
      }

      try {
        const payload = await checkApi.post<{
          status: string;
          is_available: boolean;
        }>("/username", {
          "username": username,
        });

        if (payload.data.is_available) {
          setUsernameErr("");
        } else {
          setUsernameErr("username already used")
        }
      } catch (error) {
        setUsernameErr("something went wrong")
      }
    }, 500),
    [],
  );

  useEffect(() => {
    checkUsername(username);
    // eslint-disable-next-line
  }, [username]);

  return (
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                </Dialog.Title>
                <div className="flex flex-col gap-2 mt-2">
                  <Label
                  >
                    Enter a new username
                  </Label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.currentTarget.value)}
                  />
                  <p
                    className='font-bold text-red-500 text-sm'
                  >
                    {usernameErr}
                  </p>
                </div>

                <div className="flex gap-2 mt-4 flex-row-reverse">
                  <Button
                    className='bg-red-600 hover:bg-red-700'
                    onClick={() => {
                      router.push(window.location.pathname);
                      closeModal();
                    }}
                  >
                    Dismiss
                  </Button>

                  <Button
                    onClick={async () => {
                      if (username === "" || !provider) {
                        return
                      }

                      window.location.href = `${BACKEND_URL}/oauth/${provider}/add/username/${username}`;
                    }}
                  >
                    Proceed
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
