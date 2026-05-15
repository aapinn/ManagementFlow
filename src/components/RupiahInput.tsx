import { type InputHTMLAttributes } from 'react'

interface RupiahInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
  value: string
  onChange: (value: string) => void
}

export default function RupiahInput({ value, onChange, ...props }: RupiahInputProps) {
  const displayValue = value ? Number(value).toLocaleString('id-ID') : ''

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    onChange(raw)
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      {...props}
    />
  )
}
