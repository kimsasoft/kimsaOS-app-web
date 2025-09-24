"use client";

import { ResetPasswordForm } from "../../../../../packages/ui/src/molecules/form/reset-password";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <ResetPasswordForm onSubmit={async () => {}} />
        </div>
      </div>
    </main>
  );
}
