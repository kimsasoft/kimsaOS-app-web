import React from 'react';

interface OnboardingStepProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function OnboardingStep({ 
  title, 
  description, 
  children, 
  className = "" 
}: OnboardingStepProps) {
  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}