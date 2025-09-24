"use client";

import { ForgotPasswordForm } from "../../../../../packages/ui/src/molecules/form/forgot-password";

export default function ForgotPasswordPage() {

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <ForgotPasswordForm onSubmit={async () => {}} />
        </div>
      </div>
    </main>
  );
}
