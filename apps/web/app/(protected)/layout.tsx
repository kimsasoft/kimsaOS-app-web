"use client";

import React from "react";
import { usePathname } from "next/navigation";

// Import directo desde el path completo
import { Sidebar } from "../../../../packages/ui/src/molecules/navigation/sidebar";

// Iconos simples inline
const DashboardIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const CompanyIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M3 21h18"/>
    <path d="M5 21V7l8-4v18"/>
    <path d="M19 21V11l-6-4"/>
    <path d="M9 9v.01"/>
    <path d="M9 12v.01"/>
    <path d="M9 15v.01"/>
    <path d="M9 18v.01"/>
  </svg>
);

interface SidebarItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  isActive?: boolean;
  disabled?: boolean;
}

const createSidebarItems = (currentPath: string = ""): SidebarItem[] => [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <DashboardIcon />,
    isActive: currentPath === "/dashboard",
    disabled: false,
  },
  {
    label: "Empresa",
    href: undefined, // Sin link por ahora como pediste
    icon: <CompanyIcon />,
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
    </div>
  );
}
