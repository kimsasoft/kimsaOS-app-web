import React from 'react';
import { Button } from '../../index';

interface DangerZoneCardProps {
  onDeleteAccount: () => void;
}

export function DangerZoneCard({ onDeleteAccount }: DangerZoneCardProps) {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-red-800/20">
      <div className="p-6 border-b border-red-800/20">
        <h2 className="text-lg font-semibold text-red-400">Zona de Peligro</h2>
        <p className="text-sm text-red-300 mt-1">
          Acciones irreversibles para tu cuenta.
        </p>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-red-400">
              Eliminar cuenta
            </h3>
            <p className="text-sm text-red-300 mt-1">
              Una vez eliminada, no podrás recuperar tu cuenta.
            </p>
          </div>
          <Button
            variant="outline"
            className="border-red-600/50 text-red-400 hover:bg-red-900/20 hover:border-red-500"
            onClick={onDeleteAccount}
          >
            Eliminar cuenta
          </Button>
        </div>
      </div>
    </div>
  );
}