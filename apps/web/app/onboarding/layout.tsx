"use client";

import React from "react";
import { NotificationContainer } from "../../../../packages/ui/src/molecules/notifications/NotificationContainer";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>

      {/* Global Notifications */}
      <NotificationContainer />
    </div>
  );
}