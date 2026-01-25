const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24',
}

function Avatar({ src, alt, size = 'md', className = '' }) {
    const sizeClass = sizeClasses[size] || sizeClasses.md

    if (!src) {
        // Fallback to initials
        const initials = alt
            ? alt
                .split(' ')
                .map((word) => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
            : '?'

        return (
            <div
                className={`${sizeClass} rounded-full bg-gray-700 flex items-center justify-center text-white font-medium ${className}`}
            >
                {initials}
            </div>
        )
    }

    return (
        <img
            src={src}
            alt={alt || 'Avatar'}
            className={`${sizeClass} rounded-full object-cover ${className}`}
        />
    )
}

export default Avatar
