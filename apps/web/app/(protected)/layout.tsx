"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Import directo desde el path completo
import { Sidebar } from "../../../../packages/ui/src/molecules/navigation/sidebar";
import { NotificationContainer } from "../../../../packages/ui/src/molecules/notifications/NotificationContainer";
import { DashboardIcon, CompanyIcon, Users } from "../../../../packages/ui/src/icons";

// Wrappers para los iconos para que funcionen con el tipo del Sidebar
const DashboardIconWrapper = ({ className }: { className?: string }) => <DashboardIcon className={className} />;
const CompanyIconWrapper = ({ className }: { className?: string }) => <CompanyIcon className={className} />;
const ProfileIcon = ({ className }: { className?: string }) => <Users className={className} />;

const createSidebarItems = (currentPath: string = "", userRole: string = "") => [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: DashboardIconWrapper,
    isActive: currentPath === "/dashboard",
    disabled: false,
  },
  {
    label: "Perfil",
    href: "/profile",
    icon: ProfileIcon,
    isActive: currentPath === "/profile",
    disabled: false,
  },
  {
    label: "Empresa",
    href: userRole === "member" ? undefined : "/empresa", // Sin href para members
    icon: CompanyIconWrapper,
    isActive: currentPath === "/empresa",
    disabled: userRole === "member", // Deshabilitado para members
  },
];

interface UserProfile {
  role?: string;
  membership?: {
    role: string;
  };
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log("🔍 Cargando datos de usuario y membership...");
        const response = await fetch("/api/user/tenant");
        if (response.ok) {
          const data = await response.json();
          const role = data.membership?.role || "";
          setUserRole(role);
          console.log("👤 Role del usuario cargado:", role);
        } else {
          console.error("❌ Error en respuesta:", response.status, await response.text());
        }
      } catch (error) {
        console.error("❌ Error cargando perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const sidebarItems = createSidebarItems(pathname, userRole);

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <div className="flex items-center justify-center w-full">
          <div className="text-muted-foreground">Cargando...</div>
        </div>
      </div>
    );
  }

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
