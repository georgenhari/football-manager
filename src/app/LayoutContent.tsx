"use client";

import { usePathname } from "next/navigation";
import AuthProvider from "@/providers/AuthProvider";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/Breadcrumbs";

export function LayoutContent({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/auth";

  return (
    <AuthProvider>
      {!isAuthPage && (
        <>
          <Navbar />
          <div className="container mx-auto px-4 py-4">
            <div className="mb-4">
              <Breadcrumbs />
            </div>
          </div>
        </>
      )}
      <main>{children}</main>
    </AuthProvider>
  );
}
