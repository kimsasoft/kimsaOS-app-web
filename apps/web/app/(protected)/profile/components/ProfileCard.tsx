import React from 'react';
import { Button, Input, Label } from "@repo/ui";

interface ProfileCardProps {
  formData: {
    full_name: string;
    email: string;
  };
  onFormDataChange: (data: { full_name: string; email: string }) => void;
  onSave: (e: React.FormEvent) => void;
  saving: boolean;
}

export function ProfileCard({ 
  formData, 
  onFormDataChange, 
  onSave, 
  saving 
}: ProfileCardProps) {
  return (
    <div className="bg-card rounded-lg shadow-sm border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          Información Personal
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Actualiza tu información básica de perfil.
        </p>
      </div>

      <form onSubmit={onSave} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="full_name">Nombre completo</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  full_name: e.target.value,
                })
              }
              placeholder="Tu nombre completo"
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  email: e.target.value,
                })
              }
              placeholder="tu@email.com"
              disabled={true}
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-1">
              El correo electrónico no se puede modificar.
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}