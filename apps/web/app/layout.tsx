import "./globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body
        className="min-h-screen bg-background text-foreground"
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
