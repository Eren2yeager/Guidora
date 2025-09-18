'use client';

/**
 * FormField component for admin forms
 * 
 * @param {Object} props
 * @param {string} props.id - Input id
 * @param {string} props.label - Field label
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Input placeholder
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.error - Error message
 * @param {string} props.helpText - Help text
 */
export default function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  helpText = '',
  ...props
}) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`mt-1 block w-full rounded-md shadow-sm ${
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          } sm:text-sm`}
          rows={4}
          {...props}
        />
      ) : type === 'select' ? (
        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          required={required}
          className={`mt-1 block w-full rounded-md shadow-sm ${
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          } sm:text-sm`}
          {...props}
        >
          {props.children}
        </select>
      ) : (
        <input
          type={type}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`mt-1 block w-full rounded-md shadow-sm ${
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          } sm:text-sm`}
          {...props}
        />
      )}
      
      {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}