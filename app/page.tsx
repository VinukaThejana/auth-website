import dynamic from "next/dynamic";

const Password = dynamic(() => import("~/components/user/password"), {
  ssr: false
})
const PassKey = dynamic(() => import("~/components/auth/passkeys-register"), {
  ssr: false,
});
const Devices = dynamic(() => import("~/components/user/devices"), {
  ssr: false,
});
const TwoFactor = dynamic(
  () => import("~/components/user/twofactor/twofactor"),
  {
    ssr: false,
  },
);

export default function Home() {
  return (
    <main className="flex flex-col items-center  min-h-screen mt-10 gap-4"> <Password />
      <PassKey />
      <TwoFactor />
      <Devices />
    </main>
  );
}
