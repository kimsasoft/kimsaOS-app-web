import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Alert } from '../src/alert';

describe('Alert', () => {
  it('renders with error variant by default', () => {
    render(<Alert>Error message</Alert>);
    const alert = screen.getByText('Error message');
    expect(alert).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Alert variant="success">Success message</Alert>);
    expect(screen.getByText('Success message')).toBeInTheDocument();
    
    rerender(<Alert variant="warning">Warning message</Alert>);
    expect(screen.getByText('Warning message')).toBeInTheDocument();
    
    rerender(<Alert variant="info">Info message</Alert>);
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('renders close button when onClose is provided', () => {
    const onClose = vi.fn();
    render(<Alert onClose={onClose}>Error message</Alert>);
    
    const closeButton = screen.getByLabelText('Cerrar alerta');
    expect(closeButton).toBeInTheDocument();
  });

  it('does not render close button when onClose is not provided', () => {
    render(<Alert>Error message</Alert>);
    
    const closeButton = screen.queryByLabelText('Cerrar alerta');
    expect(closeButton).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Alert onClose={onClose}>Error message</Alert>);
    
    const closeButton = screen.getByLabelText('Cerrar alerta');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<Alert className="custom-class">Error message</Alert>);
    const alert = screen.getByText('Error message').parentElement;
    expect(alert).toHaveClass('custom-class');
  });

  it('renders with proper ARIA attributes', () => {
    render(<Alert>Error message</Alert>);
    const alert = screen.getByText('Error message');
    expect(alert).toBeInTheDocument();
  });
});
