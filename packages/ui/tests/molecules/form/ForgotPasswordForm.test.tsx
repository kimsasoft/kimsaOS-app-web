import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ForgotPasswordForm } from '../../../src/molecules/form/forgot-password'

describe('ForgotPasswordForm', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with all elements', () => {
    render(<ForgotPasswordForm onSubmit={mockOnSubmit} />)
    
    expect(screen.getByText('¿Olvidaste tu contraseña?')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar enlace de recuperación/i })).toBeInTheDocument()
    expect(screen.getByText('¿Recordaste tu contraseña?')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /volver al login/i })).toBeInTheDocument()
  })

  it('validates email format and shows error for invalid email', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordForm onSubmit={mockOnSubmit} />)

    const emailInput = screen.getByLabelText(/email/i)

    // Type invalid email
    await user.type(emailInput, 'invalid-email')
    
    // Submit form
    const form = document.querySelector('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText('Ingresa un email válido')).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit with valid email', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordForm onSubmit={mockOnSubmit} />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /enviar enlace de recuperación/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('test@example.com')
    })
  })

  it('displays loading state when loading prop is true', () => {
    render(<ForgotPasswordForm onSubmit={mockOnSubmit} loading={true} />)
    
    const submitButton = screen.getByRole('button', { name: /enviando.../i })
    expect(submitButton).toBeDisabled()
    expect(screen.getByLabelText(/email/i)).toBeDisabled()
  })

  it('handles onSubmit promise rejection and shows error', async () => {
    const user = userEvent.setup()
    const mockOnSubmitReject = vi.fn().mockRejectedValue(new Error('Error de red'))
    
    render(<ForgotPasswordForm onSubmit={mockOnSubmitReject} />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /enviar enlace de recuperación/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Error de red')).toBeInTheDocument()
    })
  })

  it('shows generic error message when error has no message', async () => {
    const user = userEvent.setup()
    const mockOnSubmitReject = vi.fn().mockRejectedValue(new Error())
    
    render(<ForgotPasswordForm onSubmit={mockOnSubmitReject} />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /enviar enlace de recuperación/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Hubo un error al enviar el email. Inténtalo de nuevo.')).toBeInTheDocument()
    })
  })

  it('requires email input before submission', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordForm onSubmit={mockOnSubmit} />)

    const submitButton = screen.getByRole('button', { name: /enviar enlace de recuperación/i })
    await user.click(submitButton)

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('clears error when user starts typing after validation error', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordForm onSubmit={mockOnSubmit} />)

    const emailInput = screen.getByLabelText(/email/i)

    // First cause a validation error
    await user.type(emailInput, 'invalid-email')
    const form = document.querySelector('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText('Ingresa un email válido')).toBeInTheDocument()
    })

    // Clear and type valid email - error should disappear
    await user.clear(emailInput)
    await user.type(emailInput, 'test@example.com')

    await waitFor(() => {
      expect(screen.queryByText('Ingresa un email válido')).not.toBeInTheDocument()
    })
  })

  it('applies custom className when provided', () => {
    const { container } = render(
      <ForgotPasswordForm onSubmit={mockOnSubmit} className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })
})