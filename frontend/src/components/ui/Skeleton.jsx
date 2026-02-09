/**
 * Skeleton loading components
 * Displays animated placeholder content while data is loading
 */

/**
 * Base Skeleton component
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
        none: '',
    }

    return (
        <div
            className={`${baseStyles} ${variantStyles[variant]} ${animationStyles[animation]} ${className}`}
        />
    )
}

/**
 * Video Card Skeleton - matches VideoCard layout
 */
export function VideoCardSkeleton() {
    return (
        <div className="group">
            {/* Thumbnail skeleton */}
            <div className="w-full aspect-video skeleton-shimmer rounded-2xl" />

            {/* Info skeleton */}
            <div className="flex gap-3 mt-3">
                {/* Avatar skeleton */}
                <div className="w-10 h-10 skeleton-shimmer rounded-full flex-shrink-0" />

                {/* Text skeleton */}
                <div className="flex-1 space-y-2">
                    <div className="h-4 skeleton-shimmer rounded w-full" />
                    <div className="h-4 skeleton-shimmer rounded w-3/4" />
                    <div className="h-3 skeleton-shimmer rounded w-1/2 mt-2" />
                    <div className="h-3 skeleton-shimmer rounded w-1/3" />
                </div>
            </div>
        </div>
    )
}

/**
 * Video Grid Skeleton - multiple video card skeletons
 */
export function VideoGridSkeleton({ count = 8 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <VideoCardSkeleton key={index} />
            ))}
        </div>
    )
}

/**
 * Video Player Skeleton - for video page main player
 */
export function VideoPlayerSkeleton() {
    return (
        <div>
            <div className="w-full aspect-video skeleton-shimmer rounded-2xl" />

            <div className="mt-4 space-y-3">
                <div className="h-6 skeleton-shimmer rounded w-3/4" />
                <div className="h-4 skeleton-shimmer rounded w-1/2" />
            </div>

            <div className="flex items-center gap-4 mt-4 py-4 border-t border-gray-800">
                <div className="w-12 h-12 skeleton-shimmer rounded-full" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 skeleton-shimmer rounded w-1/4" />
                    <div className="h-3 skeleton-shimmer rounded w-1/6" />
                </div>
                <div className="h-10 w-24 skeleton-shimmer rounded-full" />
            </div>
        </div>
    )
}

/**
 * Comment Skeleton
 */
export function CommentSkeleton() {
    return (
        <div className="flex gap-4">
            <div className="w-10 h-10 skeleton-shimmer rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 skeleton-shimmer rounded w-1/4" />
                <div className="h-4 skeleton-shimmer rounded w-full" />
                <div className="h-4 skeleton-shimmer rounded w-2/3" />
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
 * Channel Card/Header Skeleton
 */
export function ChannelSkeleton() {
    return (
        <div>
            {/* Cover image */}
            <div className="h-32 sm:h-48 skeleton-shimmer rounded-xl" />

            {/* Channel info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 p-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 skeleton-shimmer rounded-full" />
                <div className="flex-1 space-y-2">
                    <div className="h-6 skeleton-shimmer rounded w-1/3" />
                    <div className="h-4 skeleton-shimmer rounded w-1/4" />
                    <div className="h-4 skeleton-shimmer rounded w-1/2" />
                </div>
                <div className="h-10 w-28 skeleton-shimmer rounded-full" />
            </div>
        </div>
    )
}

/**
 * Playlist Card Skeleton
 */
export function PlaylistCardSkeleton() {
    return (
        <div>
            <div className="relative aspect-video skeleton-shimmer rounded-xl" />
            <div className="mt-3 space-y-2">
                <div className="h-4 skeleton-shimmer rounded w-3/4" />
                <div className="h-3 skeleton-shimmer rounded w-1/2" />
            </div>
        </div>
    )
}

/**
 * Playlist Grid Skeleton
 */
export function PlaylistGridSkeleton({ count = 6 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, index) => (
                <PlaylistCardSkeleton key={index} />
            ))}
        </div>
    )
}

/**
 * Subscription Channel Skeleton
 */
export function SubscriptionSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 skeleton-shimmer rounded-full" />
            <div className="flex-1 space-y-2">
                <div className="h-4 skeleton-shimmer rounded w-1/3" />
                <div className="h-3 skeleton-shimmer rounded w-1/4" />
            </div>
            <div className="h-8 w-24 skeleton-shimmer rounded-full" />
        </div>
    )
}

/**
 * Subscriptions List Skeleton
 */
export function SubscriptionsSkeleton({ count = 8 }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: count }).map((_, index) => (
                <SubscriptionSkeleton key={index} />
            ))}
        </div>
    )
}

/**
 * Dashboard Stats Skeleton
 */
export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-xl p-6 space-y-3">
                        <div className="h-4 skeleton-shimmer rounded w-1/2" />
                        <div className="h-8 skeleton-shimmer rounded w-3/4" />
                    </div>
                ))}
            </div>

            {/* Video list */}
            <div className="space-y-4">
                <div className="h-6 skeleton-shimmer rounded w-32" />
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="flex gap-4 p-4 bg-gray-800/50 rounded-xl">
                            <div className="w-40 aspect-video skeleton-shimmer rounded" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 skeleton-shimmer rounded w-3/4" />
                                <div className="h-3 skeleton-shimmer rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/**
 * Video Edit Form Skeleton
 */
export function EditVideoSkeleton() {
    return (
        <div className="animate-pulse space-y-6 max-w-4xl">
            <div className="h-8 bg-gray-700 rounded w-1/3" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left - Video preview */}
                <div className="space-y-4">
                    <div className="aspect-video bg-gray-700 rounded-xl" />
                    <div className="h-4 bg-gray-700 rounded w-1/2" />
                </div>

                {/* Right - Form fields */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-16" />
                        <div className="h-10 bg-gray-700 rounded" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-24" />
                        <div className="h-32 bg-gray-700 rounded" />
                    </div>
                    <div className="h-10 bg-gray-700 rounded w-32" />
                </div>
            </div>
        </div>
    )
}

/**
 * Page Loading Skeleton - for initial app load
 */
export function PageLoadingSkeleton() {
    return (
        <div className="min-h-[50vh] flex items-center justify-center">
            <div className="animate-pulse space-y-4 text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto" />
                <div className="h-4 bg-gray-700 rounded w-32 mx-auto" />
            </div>
        </div>
    )
}

export default Skeleton
