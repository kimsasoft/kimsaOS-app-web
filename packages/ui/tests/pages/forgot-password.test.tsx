import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn()
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}))

const mockSupabaseAuth = {
  resetPasswordForEmail: vi.fn()
}

const mockSupabaseClient = {
  auth: mockSupabaseAuth
}

describe('ForgotPasswordPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    
    const { createBrowserClient } = await import('@supabase/ssr')
    vi.mocked(createBrowserClient).mockReturnValue(mockSupabaseClient as any)
    
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  const renderPage = async () => {
    const { default: ForgotPasswordPage } = await import('../../../../apps/web/app/(public)/forgot-password/page')
    return render(<ForgotPasswordPage />)
  }

  it('renders forgot password form', async () => {
    await renderPage()
    
    expect(screen.getByText('¿Olvidaste tu contraseña?')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar enlace de recuperación/i })).toBeInTheDocument()
  })

  it('calls resetPasswordForEmail when form is submitted', async () => {
    mockSupabaseAuth.resetPasswordForEmail.mockResolvedValue({ error: null })
    
    await renderPage()
    const user = userEvent.setup()
    
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'test@example.com')
    
    const form = document.querySelector('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(mockSupabaseAuth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: 'http://localhost:3000/reset-password' }
      )
    })
  })

  it('shows success message after email is sent', async () => {
    mockSupabaseAuth.resetPasswordForEmail.mockResolvedValue({ error: null })
    
    await renderPage()
    const user = userEvent.setup()
    
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'test@example.com')
    
    const form = document.querySelector('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText('¡Email enviado!')).toBeInTheDocument()
      expect(screen.getByText(/hemos enviado un enlace/i)).toBeInTheDocument()
    })
  })

  it('allows resending email from success screen', async () => {
    mockSupabaseAuth.resetPasswordForEmail.mockResolvedValue({ error: null })
    
    await renderPage()
    const user = userEvent.setup()
    
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'test@example.com')
    
    const form = document.querySelector('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText('¡Email enviado!')).toBeInTheDocument()
    })

    const resendButton = screen.getByText(/no recibiste el email/i)
    await user.click(resendButton)

    expect(screen.getByText('¿Olvidaste tu contraseña?')).toBeInTheDocument()
  })

  it('handles resetPasswordForEmail errors', async () => {
    const errorMessage = 'Email not found'
    mockSupabaseAuth.resetPasswordForEmail.mockResolvedValue({ 
      error: { message: errorMessage } 
    })
    
    await renderPage()
    const user = userEvent.setup()
    
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid@example.com')
    
    const form = document.querySelector('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.queryByText('¡Email enviado!')).not.toBeInTheDocument()
    })
    
    expect(mockSupabaseAuth.resetPasswordForEmail).toHaveBeenCalled()
  })

  it('shows loading state during submission', async () => {
    let resolvePromise: (value: any) => void
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    
    mockSupabaseAuth.resetPasswordForEmail.mockReturnValue(promise)
    
    await renderPage()
    const user = userEvent.setup()
    
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'test@example.com')
    
    const submitButton = screen.getByRole('button', { name: /enviar enlace de recuperación/i })
    const form = document.querySelector('form')!
    fireEvent.submit(form)

    expect(submitButton).toBeDisabled()
    expect(screen.getByText('Enviando...')).toBeInTheDocument()

    resolvePromise!({ error: null })
    
    await waitFor(() => {
      expect(screen.getByText('¡Email enviado!')).toBeInTheDocument()
    })
  })
})