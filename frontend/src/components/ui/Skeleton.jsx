/**
 * Skeleton loading component
 * Displays animated placeholder content while data is loading
 */
function Skeleton({ className = '', variant = 'rectangular', animation = 'pulse' }) {
    const baseStyles = 'bg-gray-700'

    const variantStyles = {
        rectangular: 'rounded',
        circular: 'rounded-full',
        rounded: 'rounded-xl',
    }

    const animationStyles = {
        pulse: 'animate-pulse',
        shimmer: 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-gray-600/50 before:to-transparent',
        none: '',
    }

    return (
        <div
            className={`${baseStyles} ${variantStyles[variant]} ${animationStyles[animation]} ${className}`}
        />
    )
}

/**
 * Video Card Skeleton
 * Matches the VideoCard component layout
 */
export function VideoCardSkeleton() {
    return (
        <div className="group animate-pulse">
            {/* Thumbnail skeleton */}
            <div className="w-full aspect-video bg-gray-700 rounded-xl" />

            {/* Info skeleton */}
            <div className="flex gap-3 mt-3">
                {/* Avatar skeleton */}
                <div className="w-10 h-10 bg-gray-700 rounded-full flex-shrink-0" />

                {/* Text skeleton */}
                <div className="flex-1 space-y-2">
                    {/* Title - 2 lines */}
                    <div className="h-4 bg-gray-700 rounded w-full" />
                    <div className="h-4 bg-gray-700 rounded w-3/4" />

                    {/* Channel name */}
                    <div className="h-3 bg-gray-700 rounded w-1/2 mt-2" />

                    {/* Views and date */}
                    <div className="h-3 bg-gray-700 rounded w-1/3" />
                </div>
            </div>
        </div>
    )
}

/**
 * Video Grid Skeleton
 * Shows multiple VideoCardSkeletons in a grid
 */
export function VideoGridSkeleton({ count = 8 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, index) => (
                <VideoCardSkeleton key={index} />
            ))}
        </div>
    )
}

/**
 * Video Player Skeleton
 * For the video page main player
 */
export function VideoPlayerSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Video player placeholder */}
            <div className="w-full aspect-video bg-gray-800 rounded-xl" />

            {/* Title */}
            <div className="mt-4 space-y-3">
                <div className="h-6 bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-700 rounded w-1/2" />
            </div>

            {/* Channel info */}
            <div className="flex items-center gap-4 mt-4 py-4 border-t border-gray-800">
                <div className="w-12 h-12 bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-1/4" />
                    <div className="h-3 bg-gray-700 rounded w-1/6" />
                </div>
                <div className="h-10 w-24 bg-gray-700 rounded-full" />
            </div>
        </div>
    )
}

/**
 * Comment Skeleton
 */
export function CommentSkeleton() {
    return (
        <div className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-1/4" />
                <div className="h-4 bg-gray-700 rounded w-full" />
                <div className="h-4 bg-gray-700 rounded w-2/3" />
            </div>
        </div>
    )
}

/**
 * Comments Section Skeleton
 */
export function CommentsSkeleton({ count = 3 }) {
    return (
        <div className="space-y-6">
            {Array.from({ length: count }).map((_, index) => (
                <CommentSkeleton key={index} />
            ))}
        </div>
    )
}

/**
 * Channel Card Skeleton
 */
export function ChannelCardSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Cover image */}
            <div className="h-24 sm:h-32 bg-gray-700 rounded-t-xl" />

            {/* Channel info */}
            <div className="p-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-700 rounded w-1/2" />
                    <div className="h-4 bg-gray-700 rounded w-1/3" />
                </div>
            </div>
        </div>
    )
}

/**
 * Sidebar Skeleton
 */
export function SidebarSkeleton() {
    return (
        <div className="space-y-2 p-2 animate-pulse">
            {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 px-4 py-3">
                    <div className="w-6 h-6 bg-gray-700 rounded" />
                    <div className="h-4 bg-gray-700 rounded w-24" />
                </div>
            ))}
        </div>
    )
}

export default Skeleton
