function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fadeIn">
            {Icon && (
                <div className="w-20 h-20 bg-gray-800/80 rounded-2xl flex items-center justify-center mb-5 animate-countPop">
                    <Icon className="w-10 h-10 text-gray-500" />
                </div>
            )}
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            {description && (
                <p className="text-gray-400 max-w-md mb-5 leading-relaxed">{description}</p>
            )}
            {action && <div className="animate-fadeIn" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>{action}</div>}
        </div>
    )
}

export default EmptyState
