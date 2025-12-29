import { forwardRef } from 'react'

const Input = forwardRef(({
  label,
  error,
  type = 'text',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || props.name

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
          {props.required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={`input ${error ? 'border-danger focus:ring-danger' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
