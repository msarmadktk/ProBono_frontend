"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const noNavbarRoutes = ["/sign-up", "/login", "/select-role"];

  return !noNavbarRoutes.includes(pathname) ? <Navbar /> : null;
}
