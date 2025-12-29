import { forwardRef } from 'react'

const Select = forwardRef(({
  label,
  error,
  options = [],
  className = '',
  id,
  placeholder = 'Selecione...',
  ...props
}, ref) => {
  const selectId = id || props.name

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
          {props.required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`select ${error ? 'border-danger focus:ring-danger' : ''} ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
