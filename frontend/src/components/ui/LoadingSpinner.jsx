const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
}

function LoadingSpinner({ size = 'md', className = '' }) {
    const sizeClass = sizeClasses[size] || sizeClasses.md

    return (
        <div
            className={`${sizeClass} border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin ${className}`}
            role="status"
            aria-label="Loading"
        />
    )
}

export default LoadingSpinner
