"use client";

import { useRouter } from "next/navigation";
import { getUser } from "~/lib/user";
import { Button } from "../ui/button";

export default function Profile() {
  const user = getUser();
  const router = useRouter();

  return user
    ? (
      <img
        src={user.photo_url}
        alt={user.name}
        className="w-10 rounded-full"
      />
    )
    : (
      <Button
        onClick={() => router.push("/login")}
      >
        Login
      </Button>
    );
}
