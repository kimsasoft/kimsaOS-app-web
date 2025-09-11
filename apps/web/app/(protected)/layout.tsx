"use client";

import React from "react";
import { usePathname } from "next/navigation";

// Import directo desde el path completo
import { Sidebar } from "../../../../packages/ui/src/molecules/navigation/sidebar";
import { NotificationContainer } from "../../../../packages/ui/src/molecules/notifications/NotificationContainer";
import { DashboardIcon, CompanyIcon } from "../../../../packages/ui/src/icons";

const createSidebarItems = (currentPath: string = "") => [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: DashboardIcon,
    isActive: currentPath === "/dashboard",
    disabled: false,
  },
  {
    label: "Empresa",
    href: undefined, // Sin link por ahora como pediste
    icon: CompanyIcon,
    isActive: false,
    disabled: true, // Deshabilitado porque no tiene link aún
  },
];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const sidebarItems = createSidebarItems(pathname);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="flex-shrink-0">
        <Sidebar items={sidebarItems} />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      {/* Global Notifications */}
      <NotificationContainer />
    </div>
  );
}
