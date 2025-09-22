import React from 'react';
import { Input, Label, Button } from "@repo/ui";

interface WorkspaceFormProps {
  data: {
    companyAddress: string;
    tenantName: string;
    tenantSlug: string;
  };
  onChange: (field: string, value: string) => void;
  onPrevious: () => void;
  onSubmit: () => void;
  generating?: boolean;
  disabled?: boolean;
  generateSlug: (name: string) => string;
}

export function WorkspaceForm({ 
  data, 
  onChange, 
  onPrevious, 
  onSubmit, 
  generating = false,
  disabled = false,
  generateSlug
}: WorkspaceFormProps) {
  const canSubmit = data.tenantSlug.trim();

  return (
    <>
      <div>
        <Label htmlFor="companyAddress">Dirección de la empresa</Label>
        <textarea
          id="companyAddress"
          value={data.companyAddress}
          onChange={(e) => onChange('companyAddress', e.target.value)}
          placeholder="Dirección completa de la empresa..."
          rows={3}
          disabled={disabled}
          className="w-full px-3 py-2 border border-border bg-background text-foreground placeholder:text-muted-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
      </div>

      <div>
        <Label htmlFor="tenantName">Nombre del workspace</Label>
        <Input
          id="tenantName"
          value={data.tenantName}
          onChange={(e) => onChange('tenantName', e.target.value)}
          placeholder="Mi workspace"
          disabled={disabled}
          className="bg-background border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div>
        <Label htmlFor="tenantSlug">URL del workspace</Label>
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground text-sm">
            app.kimsaos.com/
          </span>
          <Input
            id="tenantSlug"
            value={data.tenantSlug}
            onChange={(e) => onChange('tenantSlug', generateSlug(e.target.value))}
            placeholder="mi-empresa"
            className="rounded-l-none bg-background border-border text-foreground placeholder:text-muted-foreground"
            disabled={disabled}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Esta será la URL de tu workspace
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrevious} 
          disabled={disabled}
        >
          ← Anterior
        </Button>
        <Button 
          type="button"
          onClick={onSubmit} 
          disabled={!canSubmit || disabled}
        >
          {generating ? "Creando empresa..." : "Crear empresa"}
        </Button>
      </div>
    </>
  );
}