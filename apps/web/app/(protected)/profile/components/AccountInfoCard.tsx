import React from 'react';

interface AccountField {
  label: string;
  value: string | React.ReactNode;
  type?: 'text' | 'mono' | 'badge';
}

interface AccountInfoCardProps {
  title: string;
  description: string;
  fields: AccountField[];
}

export function AccountInfoCard({ title, description, fields }: AccountInfoCardProps) {
  const renderValue = (field: AccountField) => {
    if (field.type === 'mono') {
      return (
        <dd className="mt-1 text-sm text-foreground font-mono">
          {field.value}
        </dd>
      );
    }
    
    if (field.type === 'badge') {
      return (
        <dd className="mt-1">
          {field.value}
        </dd>
      );
    }
    
    return (
      <dd className="mt-1 text-sm text-foreground">
        {field.value}
      </dd>
    );
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {description}
        </p>
      </div>

      <div className="p-6">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field, index) => (
            <div key={index}>
              <dt className="text-sm font-medium text-muted-foreground">
                {field.label}
              </dt>
              {renderValue(field)}
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
