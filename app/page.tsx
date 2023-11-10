import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

const PassKey = dynamic(() => import("~/components/auth/passkeys-register"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="flex flex-col items-center  min-h-screen mt-10">
      {/* PassKeys */}
      <Card className="w-80 sm:w-[700px] min-h-[300px]">
        <CardHeader>
          <CardTitle>PassKeys</CardTitle>
          <CardDescription>Create and manage passkeys</CardDescription>
        </CardHeader>

        <CardContent>
          <PassKey />
        </CardContent>
      </Card>
    </main>
  );
}
