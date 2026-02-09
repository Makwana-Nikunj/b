import { memo } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../ui/Avatar'
import { formatDistanceToNow } from '../../utils/formatDate'
import { formatViews } from '../../utils/formatNumber'
import { formatDuration } from '../../utils/formatDuration'
import { getOptimizedThumbnail } from '../../utils/optimizeImage'

/**
 * VideoCard component - memoized for performance
 * Only re-renders when video data changes
 */
const VideoCard = memo(function VideoCard({ video }) {
    const {
        _id,
        thumbnail,
        title,
        views,
        createdAt,
        duration,
        owner,
    } = video

    // Optimize thumbnail URL for faster loading
    const optimizedThumbnail = getOptimizedThumbnail(thumbnail, 'medium')

    return (
        <div className="group card-hover rounded-2xl">
            {/* Thumbnail */}
            <Link to={`/video/${_id}`} className="block relative overflow-hidden rounded-2xl">
                <img
                    src={optimizedThumbnail}
                    alt={title}
                    loading="lazy"
                    className="w-full aspect-video object-cover bg-gray-800 transition-transform duration-300 group-hover:scale-105"
                />
                {/* Duration badge */}
                {duration && (
                    <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs font-medium px-1.5 py-0.5 rounded">
                        {formatDuration(duration)}
                    </span>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </Link>

            {/* Info */}
            <div className="flex gap-3 mt-3 px-1">
                {/* Channel avatar */}
                {owner?.username && (
                    <Link to={`/channel/${owner.username}`} className="flex-shrink-0">
                        <Avatar src={owner.avatar} alt={owner.fullName} size="md" />
                    </Link>
                )}

                {/* Video details */}
                <div className="flex-1 min-w-0">
                    <Link to={`/video/${_id}`}>
                        <h3 className="text-white font-medium line-clamp-2 leading-snug group-hover:text-primary-400 transition-colors duration-200">
                            {title}
                        </h3>
                    </Link>

                    {(owner?.fullName || owner?.username) && (
                        <Link
                            to={`/channel/${owner.username || ''}`}
                            className="text-gray-400 text-sm hover:text-white transition-colors duration-200 mt-1 inline-block"
                        >
                            {owner.fullName || owner.username}
                        </Link>
                    )}

                    <div className="text-gray-500 text-sm mt-0.5">
                        <span>{formatViews(views)} views</span>
                        <span className="mx-1">•</span>
                        <span>{formatDistanceToNow(createdAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
})

export default VideoCard
