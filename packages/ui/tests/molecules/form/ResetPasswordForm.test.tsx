import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResetPasswordForm } from '../../../src/molecules/form/reset-password'

describe('ResetPasswordForm', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with all elements', () => {
    render(<ResetPasswordForm onSubmit={mockOnSubmit} />)
    
    expect(screen.getByText('Restablecer contraseña')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu nueva contraseña para completar el proceso.')).toBeInTheDocument()
    expect(screen.getByLabelText(/nueva contraseña/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /actualizar contraseña/i })).toBeInTheDocument()
    expect(screen.getByText('¿Recordaste tu contraseña?')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /volver al login/i })).toBeInTheDocument()
  })

  it('shows password visibility toggle buttons', async () => {
    render(<ResetPasswordForm onSubmit={mockOnSubmit} />)
    
    const passwordInput = screen.getByLabelText(/nueva contraseña/i)
    const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i)
    
    // Initially passwords should be hidden (type="password")
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(confirmPasswordInput).toHaveAttribute('type', 'password')
    
    // Should have toggle buttons (Eye icons) - they are button elements without text
    const toggleButtons = screen.getAllByRole('button', { name: '' })
    expect(toggleButtons.length).toBeGreaterThanOrEqual(2) // At least 2 (eye buttons) + 1 (submit)
  })

  it('toggles password visibility when eye icons are clicked', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordForm onSubmit={mockOnSubmit} />)
    
    const passwordInput = screen.getByLabelText(/nueva contraseña/i)
    const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i)
    
    // Get toggle buttons (they don't have text, so we identify them by position in DOM)
    const toggleButtons = screen.getAllByRole('button', { name: '' })
    
    // Click first toggle (password field) - should be the first eye button
    await user.click(toggleButtons[0])
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    // Click second toggle (confirm password field) - should be the second eye button
    await user.click(toggleButtons[1])
    expect(confirmPasswordInput).toHaveAttribute('type', 'text')
    
    // Click again to hide
    await user.click(toggleButtons[0])
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('validates password length and shows error', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordForm onSubmit={mockOnSubmit} />)

    const passwordInput = screen.getByLabelText(/nueva contraseña/i)
    const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i)
    const submitButton = screen.getByRole('button', { name: /actualizar contraseña/i })

    await user.type(passwordInput, '123')
    await user.type(confirmPasswordInput, '123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('La contraseña debe tener al menos 6 caracteres')).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('validates password match and shows error', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordForm onSubmit={mockOnSubmit} />)

    const passwordInput = screen.getByLabelText(/nueva contraseña/i)
    const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i)
    const submitButton = screen.getByRole('button', { name: /actualizar contraseña/i })

    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'different123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit with valid matching passwords', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordForm onSubmit={mockOnSubmit} />)

    const passwordInput = screen.getByLabelText(/nueva contraseña/i)
    const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i)
    const submitButton = screen.getByRole('button', { name: /actualizar contraseña/i })

    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('password123')
    })
  })

  it('displays loading state when loading prop is true', () => {
    render(<ResetPasswordForm onSubmit={mockOnSubmit} loading={true} />)
    
    const submitButton = screen.getByRole('button', { name: /actualizando.../i })
    expect(submitButton).toBeDisabled()
    expect(screen.getByLabelText(/nueva contraseña/i)).toBeDisabled()
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeDisabled()
  })

  it('handles onSubmit promise rejection and shows error', async () => {
    const user = userEvent.setup()
    const mockOnSubmitReject = vi.fn().mockRejectedValue(new Error('Error de servidor'))
    
    render(<ResetPasswordForm onSubmit={mockOnSubmitReject} />)

    const passwordInput = screen.getByLabelText(/nueva contraseña/i)
    const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i)
    const submitButton = screen.getByRole('button', { name: /actualizar contraseña/i })

    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Error de servidor')).toBeInTheDocument()
    })
  })

  it('shows generic error message when error has no message', async () => {
    const user = userEvent.setup()
    const mockOnSubmitReject = vi.fn().mockRejectedValue(new Error())
    
    render(<ResetPasswordForm onSubmit={mockOnSubmitReject} />)

    const passwordInput = screen.getByLabelText(/nueva contraseña/i)
    const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i)
    const submitButton = screen.getByRole('button', { name: /actualizar contraseña/i })

    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Hubo un error al actualizar la contraseña. Inténtalo de nuevo.')).toBeInTheDocument()
    })
  })

  it('requires both password fields before submission', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordForm onSubmit={mockOnSubmit} />)

    const submitButton = screen.getByRole('button', { name: /actualizar contraseña/i })
    await user.click(submitButton)

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('clears error message when user starts typing', async () => {
    const user = userEvent.setup()
    const mockOnSubmitReject = vi.fn().mockRejectedValue(new Error('Error de prueba'))
    
    render(<ResetPasswordForm onSubmit={mockOnSubmitReject} />)

    const passwordInput = screen.getByLabelText(/nueva contraseña/i)
    const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i)
    const submitButton = screen.getByRole('button', { name: /actualizar contraseña/i })

    // First cause an error
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Error de prueba')).toBeInTheDocument()
    })

    // Clear and type again - error should disappear
    await user.clear(passwordInput)
    await user.type(passwordInput, 'newpass')

    await waitFor(() => {
      expect(screen.queryByText('Error de prueba')).not.toBeInTheDocument()
    })
  })

  it('applies custom className when provided', () => {
    const { container } = render(
      <ResetPasswordForm onSubmit={mockOnSubmit} className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })
})