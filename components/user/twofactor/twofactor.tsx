"use client";

import { Card, CardContent, CardDescription, CardTitle } from "~/components/ui/card";
import TOTP from "./totp";

export default function TwoFactor() {
  return (
    <Card className="w-80 sm:w-[700px] min-h-[300px] p-4">
      <CardTitle>
        Two Factor authentication
      </CardTitle>

      <CardDescription>
        Two factor authentication provides an extra layer of protection over your account by adding another layer to the
        auth work flow
      </CardDescription>

      <CardContent>
        <TOTP />
      </CardContent>
    </Card>
  );
}
