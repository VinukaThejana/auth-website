import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Devices } from "~/components/user/devices";

const PassKey = dynamic(() => import("~/components/auth/passkeys-register"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="flex flex-col items-center  min-h-screen mt-10 gap-4">
      {/* PassKeys */}
      <PassKey />

      {/* User devices */}
      <Devices />
    </main>
  );
}
