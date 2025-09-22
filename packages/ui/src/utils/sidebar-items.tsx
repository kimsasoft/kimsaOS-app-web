import React from "react";
import { DashboardIcon, CompanyIcon } from "../icons";

export interface SidebarItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  isActive?: boolean;
  disabled?: boolean;
}

export const createSidebarItems = (currentPath: string = ""): SidebarItem[] => [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <DashboardIcon className="w-5 h-5" />,
    isActive: currentPath === "/dashboard",
    disabled: false,
  },
  {
    label: "Empresa",
    href: undefined, // Sin link por ahora como pediste
    icon: <CompanyIcon className="w-5 h-5" />,
    isActive: false,
    disabled: true, // Deshabilitado porque no tiene link aún
  },
];
