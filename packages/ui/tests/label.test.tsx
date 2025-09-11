import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Label } from '../src/label'

describe('Label', () => {
  it('renders correctly', () => {
    render(<Label>Test Label</Label>)
    expect(screen.getByText(/test label/i)).toBeInTheDocument()
  })

  it('associates with input via htmlFor', () => {
    render(
      <>
        <Label htmlFor="test-input">Test Label</Label>
        <input id="test-input" />
      </>
    )
    
    const label = screen.getByText(/test label/i)
    const input = screen.getByRole('textbox')
    
    expect(label).toHaveAttribute('for', 'test-input')
    expect(input).toHaveAttribute('id', 'test-input')
  })

  it('applies custom className', () => {
    render(<Label className="custom-label">Custom Label</Label>)
    const label = screen.getByText(/custom label/i)
    expect(label).toHaveClass('custom-label')
  })

  it('supports ref forwarding', () => {
    const ref = { current: null }
    render(<Label ref={ref}>Ref Label</Label>)
    expect(ref.current).not.toBeNull()
  })

  it('renders as different element when asChild is true', () => {
    render(
      <Label asChild>
        <div>Div Label</div>
      </Label>
    )
    expect(screen.getByText(/div label/i)).toBeInTheDocument()
  })
})
