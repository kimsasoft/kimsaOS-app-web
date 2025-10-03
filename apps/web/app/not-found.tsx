"use client";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Página no encontrada
          </h2>
          <p className="text-gray-500">
            La página que buscas no existe o no tienes permisos para acceder a ella.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={() => router.push("/dashboard")}
            className="w-full"
          >
            Ir al Dashboard
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => router.back()}
            className="w-full"
          >
            Volver atrás
          </Button>
        </div>
      </div>
    </div>
  );
}