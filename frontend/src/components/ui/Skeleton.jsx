/**
 * Skeleton loading components
 * Displays animated placeholder content while data is loading
 * All skeletons use the skeleton-shimmer CSS animation for consistency
 */

/**
 * Base Skeleton component - reusable building block
 */
function Skeleton({ className = '', variant = 'rectangular' }) {
    const variantStyles = {
        rectangular: 'rounded-lg',
        circular: 'rounded-full',
        rounded: 'rounded-xl',
        text: 'rounded',
    }

    return (
        <div
            className={`skeleton-shimmer ${variantStyles[variant]} ${className}`}
        />
    )
}

/**
 * Staggered animation wrapper for skeleton items
 */
function SkeletonItem({ children, index = 0 }) {
    return (
        <div
            className="animate-fadeIn"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
        >
            {children}
        </div>
    )
}

/**
 * Video Card Skeleton - matches VideoCard layout
 */
export function VideoCardSkeleton({ index = 0 }) {
    return (
        <SkeletonItem index={index}>
            <div className="group">
                {/* Thumbnail skeleton */}
                <Skeleton variant="rounded" className="w-full aspect-video" />

                {/* Info skeleton */}
                <div className="flex gap-3 mt-3">
                    {/* Avatar skeleton */}
                    <Skeleton variant="circular" className="w-10 h-10 flex-shrink-0" />

                    {/* Text skeleton */}
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2 mt-2" />
                        <Skeleton className="h-3 w-1/3" />
                    </div>
                </div>
            </div>
        </SkeletonItem>
    )
}

/**
 * Video Grid Skeleton - multiple video card skeletons with stagger
 */
export function VideoGridSkeleton({ count = 8 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <VideoCardSkeleton key={index} index={index} />
            ))}
        </div>
    )
}

/**
 * Video Player Skeleton - for video page main player
 */
export function VideoPlayerSkeleton() {
    return (
        <div className="animate-fadeIn">
            <Skeleton variant="rounded" className="w-full aspect-video" />

            <div className="mt-4 space-y-3">
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>

            <div className="flex items-center gap-4 mt-4 py-4 border-t border-gray-800/50">
                <Skeleton variant="circular" className="w-12 h-12" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/6" />
                </div>
                <Skeleton variant="rounded" className="h-10 w-28" />
            </div>

            {/* Action buttons skeleton */}
            <div className="flex items-center gap-2 mt-3">
                <Skeleton variant="rounded" className="h-10 w-24" />
                <Skeleton variant="rounded" className="h-10 w-12" />
                <Skeleton variant="rounded" className="h-10 w-20" />
                <Skeleton variant="rounded" className="h-10 w-20" />
            </div>
        </div>
    )
}

/**
 * Comment Skeleton
 */
export function CommentSkeleton({ index = 0 }) {
    return (
        <SkeletonItem index={index}>
            <div className="flex gap-4">
                <Skeleton variant="circular" className="w-10 h-10 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
        </SkeletonItem>
    )
}

/**
 * Comments Section Skeleton
 */
export function CommentsSkeleton({ count = 3 }) {
    return (
        <div className="space-y-6">
            {/* Comment count skeleton */}
            <Skeleton className="h-6 w-32" />
            {Array.from({ length: count }).map((_, index) => (
                <CommentSkeleton key={index} index={index} />
            ))}
        </div>
    )
}

/**
 * Channel Card/Header Skeleton
 */
export function ChannelSkeleton() {
    return (
        <div className="animate-fadeIn">
            {/* Cover image */}
            <Skeleton variant="rounded" className="h-32 sm:h-48" />

            {/* Channel info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 p-4">
                <Skeleton variant="circular" className="w-20 h-20 sm:w-24 sm:h-24" />
                <div className="flex-1 space-y-3">
                    <Skeleton className="h-7 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton variant="rounded" className="h-10 w-28" />
            </div>

            {/* Tab bar skeleton */}
            <div className="flex gap-6 mt-6 border-b border-gray-800/50">
                <Skeleton className="h-4 w-16 mb-3" />
                <Skeleton className="h-4 w-20 mb-3" />
                <Skeleton className="h-4 w-14 mb-3" />
            </div>

            {/* Content skeleton */}
            <div className="mt-6">
                <VideoGridSkeleton count={6} />
            </div>
        </div>
    )
}

/**
 * Playlist Card Skeleton
 */
export function PlaylistCardSkeleton({ index = 0 }) {
    return (
        <SkeletonItem index={index}>
            <div className="bg-gray-800/30 rounded-xl overflow-hidden">
                <Skeleton variant="rectangular" className="aspect-video" />
                <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
        </SkeletonItem>
    )
}

/**
 * Playlist Grid Skeleton
 */
export function PlaylistGridSkeleton({ count = 6 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, index) => (
                <PlaylistCardSkeleton key={index} index={index} />
            ))}
        </div>
    )
}

/**
 * Subscription Channel Skeleton
 */
export function SubscriptionSkeleton({ index = 0 }) {
    return (
        <SkeletonItem index={index}>
            <div className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-xl">
                <Skeleton variant="circular" className="w-12 h-12" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton variant="rounded" className="h-8 w-24" />
            </div>
        </SkeletonItem>
    )
}

/**
 * Subscriptions Grid Skeleton
 */
export function SubscriptionsSkeleton({ count = 8 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, index) => (
                <SubscriptionSkeleton key={index} index={index} />
            ))}
        </div>
    )
}

/**
 * Dashboard Stats Skeleton
 */
export function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Title skeleton */}
            <Skeleton className="h-8 w-48" />

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <SkeletonItem key={index} index={index}>
                        <div className="bg-gray-800/30 rounded-xl p-5 flex items-center gap-4">
                            <Skeleton variant="rounded" className="w-12 h-12" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-7 w-16" />
                            </div>
                        </div>
                    </SkeletonItem>
                ))}
            </div>

            {/* Video table skeleton */}
            <div className="bg-gray-800/30 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-700/50">
                    <Skeleton className="h-6 w-32" />
                </div>
                <div className="divide-y divide-gray-700/30">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <SkeletonItem key={index} index={index + 4}>
                            <div className="flex items-center gap-4 p-4">
                                <Skeleton variant="rounded" className="w-28 h-16 flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/3" />
                                </div>
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <div className="flex gap-2">
                                    <Skeleton variant="rounded" className="w-8 h-8" />
                                    <Skeleton variant="rounded" className="w-8 h-8" />
                                </div>
                            </div>
                        </SkeletonItem>
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
        <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
            {/* Back button skeleton */}
            <Skeleton className="h-5 w-36" />

            {/* Title skeleton */}
            <Skeleton className="h-8 w-1/3" />

            {/* Video preview */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton variant="rounded" className="w-full aspect-video" />
            </div>

            {/* Thumbnail */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <div className="border-2 border-dashed border-gray-700/50 rounded-xl p-6">
                    <Skeleton variant="rounded" className="w-full aspect-video" />
                </div>
            </div>

            {/* Form fields */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton variant="rounded" className="h-11 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton variant="rounded" className="h-32 w-full" />
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
                <Skeleton variant="rounded" className="h-11 flex-1" />
                <Skeleton variant="rounded" className="h-11 flex-1" />
            </div>
        </div>
    )
}

/**
 * Settings Page Skeleton
 */
export function SettingsSkeleton() {
    return (
        <div className="max-w-3xl mx-auto animate-fadeIn">
            {/* Title */}
            <Skeleton className="h-8 w-24 mb-6" />

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-800/50 mb-6">
                <Skeleton className="h-4 w-16 mb-3" />
                <Skeleton className="h-4 w-20 mb-3" />
                <Skeleton className="h-4 w-24 mb-3" />
            </div>

            {/* Cover image */}
            <div className="space-y-2 mb-8">
                <Skeleton className="h-4 w-24" />
                <Skeleton variant="rounded" className="h-40 w-full" />
            </div>

            {/* Avatar */}
            <div className="space-y-2 mb-8">
                <Skeleton className="h-4 w-16" />
                <Skeleton variant="circular" className="w-24 h-24" />
            </div>

            {/* Form fields */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton variant="rounded" className="h-11 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-14" />
                    <Skeleton variant="rounded" className="h-11 w-full" />
                </div>
                <Skeleton variant="rounded" className="h-11 w-32" />
            </div>
        </div>
    )
}

/**
 * Related Video Skeleton for sidebar
 */
export function RelatedVideoSkeleton({ index = 0 }) {
    return (
        <SkeletonItem index={index}>
            <div className="flex gap-3 p-2">
                <Skeleton variant="rounded" className="w-36 h-20 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2 mt-1" />
                    <Skeleton className="h-3 w-2/3" />
                </div>
            </div>
        </SkeletonItem>
    )
}

/**
 * Related Videos List Skeleton
 */
export function RelatedVideosSkeleton({ count = 6 }) {
    return (
        <div className="space-y-2">
            <Skeleton className="h-5 w-32 mb-3" />
            {Array.from({ length: count }).map((_, index) => (
                <RelatedVideoSkeleton key={index} index={index} />
            ))}
        </div>
    )
}

/**
 * Search Results Skeleton
 */
export function SearchSkeleton() {
    return (
        <div className="animate-fadeIn">
            <Skeleton className="h-6 w-64 mb-6" />
            <VideoGridSkeleton count={8} />
        </div>
    )
}

/**
 * History Page Skeleton
 */
export function HistorySkeleton({ count = 6 }) {
    return (
        <div className="animate-fadeIn">
            <Skeleton className="h-8 w-36 mb-6" />
            <div className="space-y-3">
                {Array.from({ length: count }).map((_, index) => (
                    <SkeletonItem key={index} index={index}>
                        <div className="flex gap-4 p-3 bg-gray-800/20 rounded-xl">
                            <Skeleton variant="rounded" className="w-44 h-24 flex-shrink-0" />
                            <div className="flex-1 space-y-2 py-1">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-3 w-1/2 mt-1" />
                            </div>
                        </div>
                    </SkeletonItem>
                ))}
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
            <div className="text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-700" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin" />
                </div>
                <Skeleton className="h-4 w-32 mx-auto" />
            </div>
        </div>
    )
}

/**
 * Playlist Detail Page Skeleton
 */
export function PlaylistDetailSkeleton() {
    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Skeleton variant="circular" className="w-10 h-10" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton variant="rounded" className="h-10 w-20" />
            </div>

            {/* Video list */}
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonItem key={index} index={index}>
                        <div className="flex items-center gap-4">
                            <Skeleton className="w-8 h-4" />
                            <div className="flex-1 flex gap-4 p-3 bg-gray-800/20 rounded-xl">
                                <Skeleton variant="rounded" className="w-44 h-24 flex-shrink-0" />
                                <div className="flex-1 space-y-2 py-1">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-3 w-1/2 mt-1" />
                                </div>
                            </div>
                        </div>
                    </SkeletonItem>
                ))}
            </div>
        </div>
    )
}

export default Skeleton
