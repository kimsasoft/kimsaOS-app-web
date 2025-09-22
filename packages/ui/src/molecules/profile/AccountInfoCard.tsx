import React from 'react';

interface AccountInfoCardProps {
  profile: any;
}

export function AccountInfoCard({ profile }: AccountInfoCardProps) {
  return (
    <div className="bg-card rounded-lg shadow-sm border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          Información de la Cuenta
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Detalles de tu cuenta y configuración.
        </p>
      </div>

      <div className="p-6">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">ID de Usuario</dt>
            <dd className="mt-1 text-sm text-foreground font-mono">
              {profile?.id || "N/A"}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Estado de la cuenta
            </dt>
            <dd className="mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Activa
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}