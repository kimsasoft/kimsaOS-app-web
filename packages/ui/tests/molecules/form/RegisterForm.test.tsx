import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterForm } from '../../../src/molecules/form/register'

describe('RegisterForm', () => {
  const defaultProps = {
    onRegister: vi.fn(),
    loginHref: "/login",
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with all registration fields', () => {
    render(<RegisterForm {...defaultProps} />)
    
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument()
  })

  it('calls onRegister with correct data when form is submitted', async () => {
    const user = userEvent.setup()
    render(<RegisterForm {...defaultProps} />)

    await user.type(screen.getByLabelText(/nombre completo/i), 'John Doe')
    await user.type(screen.getByLabelText(/correo electrónico/i), 'newuser@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'newpassword123')
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(defaultProps.onRegister).toHaveBeenCalledWith(
        'newuser@example.com',
        'newpassword123', 
        'John Doe'
      )
    })
  })

  it('button is disabled when fields are empty', () => {
    render(<RegisterForm {...defaultProps} />)
    
    const button = screen.getByRole('button', { name: /crear cuenta/i })
    expect(button).toBeDisabled()
  })

  it('button is enabled when all fields are filled', async () => {
    const user = userEvent.setup()
    render(<RegisterForm {...defaultProps} />)

    await user.type(screen.getByLabelText(/nombre completo/i), 'John Doe')
    await user.type(screen.getByLabelText(/correo electrónico/i), 'newuser@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'newpassword123')

    const button = screen.getByRole('button', { name: /crear cuenta/i })
    expect(button).not.toBeDisabled()
  })

  it('displays loading state during form submission', async () => {
    const user = userEvent.setup()
    const slowOnRegister = vi.fn().mockImplementation(() => 
      new Promise<void>(resolve => setTimeout(resolve, 100))
    )
    
    render(<RegisterForm {...defaultProps} onRegister={slowOnRegister} />)

    await user.type(screen.getByLabelText(/nombre completo/i), 'John Doe')
    await user.type(screen.getByLabelText(/correo electrónico/i), 'newuser@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'newpassword123')
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(screen.getByText(/creando cuenta/i)).toBeInTheDocument()
  })

  it('has link to login page with correct href', () => {
    render(<RegisterForm {...defaultProps} loginHref="/admin/login" />)
    
    const loginLink = screen.getByRole('link', { name: /iniciar sesión/i })
    expect(loginLink).toHaveAttribute('href', '/admin/login')
  })

  it('shows password requirements', () => {
    render(<RegisterForm {...defaultProps} />)
    
    expect(screen.getByText(/debe tener al menos 8 caracteres/i)).toBeInTheDocument()
  })

  it('shows terms and privacy policy links', () => {
    render(<RegisterForm {...defaultProps} />)
    
    expect(screen.getByText(/términos de servicio/i)).toBeInTheDocument()
    expect(screen.getByText(/política de privacidad/i)).toBeInTheDocument()
  })
})
