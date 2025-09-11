import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdminLoginForm } from '../../../src/molecules/form/admin-login'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

describe('AdminLoginForm', () => {
  const defaultProps = {
    onPasswordLogin: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with only email and password fields', () => {
    render(<AdminLoginForm {...defaultProps} />)
    
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
    
    // Should NOT have OAuth providers
    expect(screen.queryByText(/continuar con google/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/continuar con github/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/enlace mágico/i)).not.toBeInTheDocument()
  })

  it('calls onPasswordLogin with correct data when form is submitted', async () => {
    const user = userEvent.setup()
    render(<AdminLoginForm {...defaultProps} />)

    await user.type(screen.getByLabelText(/correo electrónico/i), 'admin@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'adminpass123')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(defaultProps.onPasswordLogin).toHaveBeenCalledWith(
        'admin@example.com',
        'adminpass123'
      )
    })
  })

  it('displays loading state during form submission', async () => {
    const user = userEvent.setup()
    const slowOnPasswordLogin = vi.fn().mockImplementation(() => 
      new Promise<void>(resolve => setTimeout(resolve, 100))
    )
    
    render(<AdminLoginForm {...defaultProps} onPasswordLogin={slowOnPasswordLogin} />)

    await user.type(screen.getByLabelText(/correo electrónico/i), 'admin@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'adminpass123')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(screen.getByText(/iniciando sesión/i)).toBeInTheDocument()
  })
})
