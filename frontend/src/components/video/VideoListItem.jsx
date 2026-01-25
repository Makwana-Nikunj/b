import { Link } from 'react-router-dom'
import { formatDistanceToNow } from '../../utils/formatDate'
import { formatViews } from '../../utils/formatNumber'
import { formatDuration } from '../../utils/formatDuration'
import { HiTrash } from 'react-icons/hi'

function VideoListItem({ video, onRemove, showRemoveButton = false }) {
    const { _id, thumbnail, title, views, createdAt, duration, owner } = video

    const handleRemove = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (window.confirm(`Remove "${title}" from playlist?`)) {
            onRemove(_id)
        }
    }

    return (
        <div className="flex gap-3 group">
            {/* Thumbnail */}
            <Link to={`/video/${_id}`} className="relative flex-shrink-0">
                <img
                    src={thumbnail}
                    alt={title}
                    className="w-40 h-24 object-cover rounded-lg bg-gray-800"
                />
                {duration && (
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                        {formatDuration(duration)}
                    </span>
                )}
            </Link>

            {/* Info */}
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

            {/* Remove button */}
            {showRemoveButton && onRemove && (
                <button
                    onClick={handleRemove}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600/40 hover:text-red-300 rounded-lg transition-all text-sm font-medium"
                    title="Remove from playlist"
                >
                    <HiTrash className="w-4 h-4" />
                    <span className="hidden sm:inline">Remove</span>
                </button>
            )}
        </div>
    )
}

export default VideoListItem
