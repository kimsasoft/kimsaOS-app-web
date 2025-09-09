import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '../../../src/molecules/navigation/sidebar';
import React from 'react';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => 
    <a href={href} data-testid="mock-link">{children}</a>
}));

const TestIcon = () => <div data-testid="test-icon">Icon</div>;

const mockItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: React.createElement(TestIcon),
    isActive: true,
  },
  {
    label: "Empresa",
    href: undefined,
    icon: React.createElement(TestIcon),
    disabled: true,
  },
];

describe('Sidebar', () => {
  it('renders sidebar items correctly', () => {
    render(<Sidebar items={mockItems} />);
    
    expect(screen.getByText('Panel')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Empresa')).toBeInTheDocument();
  });

  it('applies active styles to active items', () => {
    render(<Sidebar items={mockItems} />);
    
    const dashboardItem = screen.getByText('Dashboard').parentElement;
    expect(dashboardItem).toHaveClass('bg-primary');
  });

  it('applies disabled styles to disabled items', () => {
    render(<Sidebar items={mockItems} />);
    
    const empresaItem = screen.getByText('Empresa').parentElement;
    expect(empresaItem).toHaveClass('opacity-50');
  });

  it('renders icons correctly', () => {
    render(<Sidebar items={mockItems} />);
    
    const icons = screen.getAllByTestId('test-icon');
    expect(icons).toHaveLength(2);
  });
});
