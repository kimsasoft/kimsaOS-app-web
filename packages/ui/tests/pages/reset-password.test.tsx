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
  }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null)
  })
}))

const mockSupabaseAuth = {
  updateUser: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signOut: vi.fn()
}

const mockSupabaseClient = {
  auth: mockSupabaseAuth
}

const mockSession = {
  access_token: 'token',
  user: { id: 'user-id', email: 'test@example.com' }
}

describe('ResetPasswordPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    
    const { createBrowserClient } = await import('@supabase/ssr')
    vi.mocked(createBrowserClient).mockReturnValue(mockSupabaseClient as any)
    
    mockSupabaseAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  const renderPage = async () => {
    const { default: ResetPasswordPage } = await import('../../../../apps/web/app/(public)/reset-password/page')
    return render(<ResetPasswordPage />)
  }

  it('shows loading state initially', async () => {
    mockSupabaseAuth.getSession.mockResolvedValue({ 
      data: { session: mockSession }, 
      error: null 
    })
    
    await renderPage()
    
    expect(screen.getByText('Verificando enlace...')).toBeInTheDocument()
  })

  it('shows reset form when session is valid', async () => {
    mockSupabaseAuth.getSession.mockResolvedValue({ 
      data: { session: mockSession }, 
      error: null 
    })
    
    await renderPage()
    
    await waitFor(() => {
      expect(screen.getByText('Nueva contraseña')).toBeInTheDocument()
      expect(screen.getByText('Confirmar contraseña')).toBeInTheDocument()
    })
  })

  it('shows error when no session exists', async () => {
    mockSupabaseAuth.getSession.mockResolvedValue({ 
      data: { session: null }, 
      error: null 
    })
    
    await renderPage()
    
    await waitFor(() => {
      expect(screen.getByText('Enlace inválido')).toBeInTheDocument()
      expect(screen.getByText(/enlace inválido o expirado/i)).toBeInTheDocument()
    })
  })

  it('shows error when session check fails', async () => {
    mockSupabaseAuth.getSession.mockResolvedValue({ 
      data: { session: null }, 
      error: { message: 'Session error' } 
    })
    
    await renderPage()
    
    await waitFor(() => {
      expect(screen.getByText('Enlace inválido')).toBeInTheDocument()
    })
  })

  it('calls updateUser when password form is submitted', async () => {
    mockSupabaseAuth.getSession.mockResolvedValue({ 
      data: { session: mockSession }, 
      error: null 
    })
    mockSupabaseAuth.updateUser.mockResolvedValue({ error: null })
    
    await renderPage()
    
    await waitFor(() => {
      expect(screen.getByText('Nueva contraseña')).toBeInTheDocument()
    })

    const user = userEvent.setup()
    const passwordInput = screen.getByLabelText('Nueva contraseña')
    const confirmInput = screen.getByLabelText('Confirmar contraseña')
    
    await user.type(passwordInput, 'newpassword123')
    await user.type(confirmInput, 'newpassword123')
    
    const form = document.querySelector('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(mockSupabaseAuth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123'
      })
    })
  })

  it('shows success message after password update', async () => {
    mockSupabaseAuth.getSession.mockResolvedValue({ 
      data: { session: mockSession }, 
      error: null 
    })
    mockSupabaseAuth.updateUser.mockResolvedValue({ error: null })
    
    await renderPage()
    
    await waitFor(() => {
      expect(screen.getByText('Nueva contraseña')).toBeInTheDocument()
    })

    const user = userEvent.setup()
    const passwordInput = screen.getByLabelText('Nueva contraseña')
    const confirmInput = screen.getByLabelText('Confirmar contraseña')
    
    await user.type(passwordInput, 'newpassword123')
    await user.type(confirmInput, 'newpassword123')
    
    const form = document.querySelector('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText('¡Contraseña actualizada!')).toBeInTheDocument()
    })
  })

  it('handles auth state change events', async () => {
    mockSupabaseAuth.getSession.mockResolvedValue({ 
      data: { session: null }, 
      error: null 
    })
    
    let authCallback: any = null
    mockSupabaseAuth.onAuthStateChange.mockImplementation((callback) => {
      authCallback = callback
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })
    
    await renderPage()
    
    await waitFor(() => {
      expect(screen.getByText('Enlace inválido')).toBeInTheDocument()
    })
    
    authCallback('SIGNED_IN', mockSession)
    
    await waitFor(() => {
      expect(screen.getByText('Nueva contraseña')).toBeInTheDocument()
    })
  })

  it('shows loading state during password update', async () => {
    mockSupabaseAuth.getSession.mockResolvedValue({ 
      data: { session: mockSession }, 
      error: null 
    })
    
    let resolvePromise: (value: any) => void
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    
    mockSupabaseAuth.updateUser.mockReturnValue(promise)
    
    await renderPage()
    
    await waitFor(() => {
      expect(screen.getByText('Nueva contraseña')).toBeInTheDocument()
    })

    const user = userEvent.setup()
    const passwordInput = screen.getByLabelText('Nueva contraseña')
    const confirmInput = screen.getByLabelText('Confirmar contraseña')
    
    await user.type(passwordInput, 'newpassword123')
    await user.type(confirmInput, 'newpassword123')
    
    const submitButton = screen.getByRole('button', { name: /actualizar contraseña/i })
    const form = document.querySelector('form')!
    fireEvent.submit(form)

    expect(submitButton).toBeDisabled()
    expect(screen.getByText('Actualizando...')).toBeInTheDocument()

    resolvePromise!({ error: null })
    
    await waitFor(() => {
      expect(screen.getByText('¡Contraseña actualizada!')).toBeInTheDocument()
    })
  })
})