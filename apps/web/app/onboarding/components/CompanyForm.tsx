import React from 'react';
import { Input, Label, Button } from "@repo/ui";

interface CompanyFormProps {
  data: {
    companyName: string;
    companyEmail: string;
    companyPhone: string;
  };
  onChange: (field: string, value: string) => void;
  onNext: () => void;
  disabled?: boolean;
}

export function CompanyForm({ data, onChange, onNext, disabled = false }: CompanyFormProps) {
  const canProceed = data.companyName.trim() && data.companyEmail.trim();

  return (
    <>
      <div>
        <Label htmlFor="companyName">Nombre de la empresa *</Label>
        <Input
          id="companyName"
          value={data.companyName}
          onChange={(e) => onChange('companyName', e.target.value)}
          placeholder="Mi empresa"
          required
          disabled={disabled}
          className="bg-background border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div>
        <Label htmlFor="companyEmail">Email de la empresa *</Label>
        <Input
          id="companyEmail"
          type="email"
          value={data.companyEmail}
          onChange={(e) => onChange('companyEmail', e.target.value)}
          placeholder="contacto@mi-empresa.com"
          required
          disabled={disabled}
          className="bg-background border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div>
        <Label htmlFor="companyPhone">Teléfono</Label>
        <Input
          id="companyPhone"
          type="tel"
          value={data.companyPhone}
          onChange={(e) => onChange('companyPhone', e.target.value)}
          placeholder="+1 234 567 8900"
          disabled={disabled}
          className="bg-background border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          type="button" 
          onClick={onNext} 
          disabled={!canProceed || disabled}
        >
          Siguiente →
        </Button>
      </div>
    </>
  );
}
