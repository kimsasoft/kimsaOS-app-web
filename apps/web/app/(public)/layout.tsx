"use client";

import React from "react";
import { NotificationContainer } from "../../../../packages/ui/src/molecules/notifications/NotificationContainer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      {/* Global Notifications para páginas públicas */}
      <NotificationContainer />
    </>
  );
}
