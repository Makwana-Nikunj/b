function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            {Icon && (
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-gray-500" />
                </div>
            )}
            <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
            {description && (
                <p className="text-gray-400 max-w-md mb-4">{description}</p>
            )}
            {action}
        </div>
    )
}

export default EmptyState
