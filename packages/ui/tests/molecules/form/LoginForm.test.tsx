import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../../../src/molecules/form/login'

describe('LoginForm', () => {
  const defaultProps = {
    onPasswordLogin: vi.fn(),
    onOAuthLogin: vi.fn(),
    onMagicLinkLogin: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with all elements', () => {
    render(<LoginForm {...defaultProps} />)
    
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continuar con google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continuar con github/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar enlace mágico/i })).toBeInTheDocument()
  })

  it('calls onPasswordLogin with correct data when password form is submitted', async () => {
    const user = userEvent.setup()
    render(<LoginForm {...defaultProps} />)

    await user.type(screen.getByLabelText(/correo electrónico/i), 'test@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'password123')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(defaultProps.onPasswordLogin).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      )
    })
  })

  it('calls onOAuthLogin when Google button is clicked', async () => {
    const user = userEvent.setup()
    render(<LoginForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /continuar con google/i }))

    expect(defaultProps.onOAuthLogin).toHaveBeenCalledWith('google')
  })

  it('calls onOAuthLogin when GitHub button is clicked', async () => {
    const user = userEvent.setup()
    render(<LoginForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /continuar con github/i }))

    expect(defaultProps.onOAuthLogin).toHaveBeenCalledWith('github')
  })

  it('calls onMagicLinkLogin when magic link form is submitted', async () => {
    const user = userEvent.setup()
    render(<LoginForm {...defaultProps} />)

    await user.type(screen.getByLabelText(/correo electrónico/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /enviar enlace mágico/i }))

    await waitFor(() => {
      expect(defaultProps.onMagicLinkLogin).toHaveBeenCalledWith('test@example.com')
    })
  })
})