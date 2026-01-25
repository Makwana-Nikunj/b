import { Link } from 'react-router-dom'
import Avatar from '../ui/Avatar'
import { formatDistanceToNow } from '../../utils/formatDate'
import { formatViews } from '../../utils/formatNumber'
import { formatDuration } from '../../utils/formatDuration'

function VideoCard({ video }) {
    const {
        _id,
        thumbnail,
        title,
        views,
        createdAt,
        duration,
        owner,
    } = video

    return (
        <div className="group">
            {/* Thumbnail */}
            <Link to={`/video/${_id}`} className="block relative">
                <img
                    src={thumbnail}
                    alt={title}
                    className="w-full aspect-video object-cover rounded-xl bg-gray-800"
                />
                {/* Duration badge */}
                {duration && (
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                        {formatDuration(duration)}
                    </span>
                )}
            </Link>

            {/* Info */}
            <div className="flex gap-3 mt-3">
                {/* Channel avatar */}
                {owner?.username && (
                    <Link to={`/channel/${owner.username}`} className="flex-shrink-0">
                        <Avatar src={owner.avatar} alt={owner.fullName} size="md" />
                    </Link>
                )}

                {/* Video details */}
                <div className="flex-1 min-w-0">
                    <Link to={`/video/${_id}`}>
                        <h3 className="text-white font-medium line-clamp-2 group-hover:text-blue-400 transition-colors">
                            {title}
                        </h3>
                    </Link>

                    {owner?.username && (
                        <Link
                            to={`/channel/${owner.username}`}
                            className="text-gray-400 text-sm hover:text-white transition-colors"
                        >
                            {owner.fullName}
                        </Link>
                    )}

                    <div className="text-gray-400 text-sm">
                        <span>{formatViews(views)} views</span>
                        <span className="mx-1">•</span>
                        <span>{formatDistanceToNow(createdAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoCard
