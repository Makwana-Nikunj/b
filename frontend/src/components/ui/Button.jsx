const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'bg-transparent hover:bg-gray-800 text-white',
    outline: 'border border-gray-600 hover:bg-gray-800 text-white',
}

const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
}

function Button({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    className = '',
    type = 'button',
    ...props
}) {
    const variantClass = variantClasses[variant] || variantClasses.primary
    const sizeClass = sizeClasses[size] || sizeClasses.md

    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={`
        ${variantClass}
        ${sizeClass}
        rounded-lg font-medium transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
            {...props}
        >
            {loading && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {children}
        </button>
    )
}

export default Button
