import dynamic from "next/dynamic";

const Profile = dynamic(() => import("~/components/util/profile"), {
  ssr: false,
});

export function Navbar() {
  return (
    <nav className="mx-auto max-w-7xl py-2 px-2 sm:px-6 lg:px-8">
      <div className="relative flex h-16 items-center justify-between">
        <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
          <div className="flex flex-shrink-0 items-center">
          </div>
        </div>
        <Profile />
      </div>
    </nav>
  );
}
