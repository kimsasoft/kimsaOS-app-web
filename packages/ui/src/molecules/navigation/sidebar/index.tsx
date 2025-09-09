"use client";

import React from 'react';
import Link from 'next/link';

interface SidebarItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  isActive?: boolean;
  disabled?: boolean;
}

interface SidebarProps {
  items: SidebarItem[];
  className?: string;
}

export function Sidebar({ items, className = "" }: SidebarProps) {
  return (
    <div className={`w-64 h-full bg-card border-r border-border flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          Panel
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item, index) => {
          const itemContent = (
            <div
              className={`
                flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${item.isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span className="w-5 h-5">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
          );

          if (item.disabled || !item.href) {
            return (
              <div key={index}>
                {itemContent}
              </div>
            );
          }

          return (
            <Link key={index} href={item.href}>
              {itemContent}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
