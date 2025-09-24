"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { LoadingProvider } from "../../contexts/LoadingContext";
import { Sidebar } from "@repo/ui";
import { NotificationContainer } from "@repo/ui";
import { UserProfile } from "../../types/user";
import { DashboardIcon, CompanyIcon, Users } from "../../../../packages/ui/src/icons";

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
    label: "Profile",
    href: "/profile",
    icon: ProfileIcon,
    isActive: currentPath === "/profile",
    disabled: false,
  },
  {
    label: "Company",
    href: userRole === "member" ? undefined : "/company",
    icon: CompanyIconWrapper,
    isActive: currentPath === "/company",
    disabled: userRole === "member",
  },
];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>("member");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/user/tenant");
        if (response.ok) {
          const data = await response.json();
          const role = data.membership?.role || "";
          setUserRole(role);
        }
      } catch (error) {
        
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
    <LoadingProvider>
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

        <NotificationContainer />
      </div>
    </LoadingProvider>
  );
}
