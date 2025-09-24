import React from 'react';
import { Button } from "@repo/ui";
import { LucideIcon } from 'lucide-react';

interface InfoCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary" | "ghost" | "link";
    className?: string;
  };
  // Backward compatibility
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function InfoCard({ 
  title, 
  description, 
  children,
  icon: Icon,
  iconColor = "text-foreground",
  iconBgColor = "bg-muted",
  action,
  // Backward compatibility
  actionLabel, 
  onAction,
  className = ""
}: InfoCardProps) {
  const currentAction = action || (actionLabel && onAction ? { label: actionLabel, onClick: onAction } : undefined);
  
  return (
    <div className={`bg-card rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`w-8 h-8 ${iconBgColor} rounded-lg flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
        {currentAction && (
          <Button 
            variant={currentAction.variant || "outline"} 
            size="sm"
            onClick={currentAction.onClick}
            className={currentAction.className || "text-blue-400 hover:text-blue-300"}
          >
            {currentAction.label}
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}
