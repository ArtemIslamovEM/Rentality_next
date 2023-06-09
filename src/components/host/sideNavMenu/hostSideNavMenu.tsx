import Head from "next/head";
import Image from "next/image";
import logo from "../../../images/logo.png";
import Link from "next/link";

export default function HostSideNavMenu() {
  return (
    <aside className="pl-12 pr-4 py-8 bg-gray-600 bg-opacity-60 text-white">
      <Image className="w-56 h-auto" src={logo} alt="" />
      <nav className="w-64 pt-4">
        <div className="pt-4">
          <div className="py-2 text-xl font-bold">Trips</div>
          <div className="py-1 h-12">
            <Link href="/host/trips/booked">Booked</Link>
          </div>
          <div className="py-1 h-12">
            <Link href="/host/trips/history">History</Link>
          </div>
        </div>
        <div className="pt-4">
          <div className="py-2 text-xl font-bold">Vehicles</div>
          <div className="py-1 h-12">
            <Link href="/host/vehicles/listings">Listing</Link>
          </div>
        </div>
      </nav>
    </aside>
  );
}
