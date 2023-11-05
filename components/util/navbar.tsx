import dynamic from "next/dynamic";
import Image from "next/image";
import logo from "~/public/logo-50.png";

const Profile = dynamic(() => import("~/components/util/profile"), {
  ssr: false,
});

export function Navbar() {
  return (
    <nav className="mx-auto max-w-7xl py-2 px-2 sm:px-6 lg:px-8">
      <div className="relative flex h-16 items-center justify-between">
        <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
          <div className="flex flex-shrink-0 items-center">
            <Image
              src={logo}
              alt="Logo"
              className="w-8"
            />
          </div>
        </div>

        <Profile />
      </div>
    </nav>
  );
}
