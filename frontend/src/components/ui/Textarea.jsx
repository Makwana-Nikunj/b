import { forwardRef } from 'react'

const Textarea = forwardRef(
    ({ label, error, className = '', rows = 4, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    rows={rows}
                    className={`
            w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-2.5
            text-white placeholder-gray-500 resize-none
            focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
            transition-colors
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                )}
            </div>
        )
    }
)

Textarea.displayName = 'Textarea'

export default Textarea
