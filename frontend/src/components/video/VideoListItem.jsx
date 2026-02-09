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
        <div className="flex gap-4 group p-2 -ml-2 rounded-xl hover:bg-gray-800/50 transition-all duration-200">
            {/* Thumbnail */}
            <Link to={`/video/${_id}`} className="relative flex-shrink-0 overflow-hidden rounded-xl">
                <img
                    src={thumbnail}
                    alt={title}
                    className="w-56 h-32 object-cover bg-gray-800 transition-transform duration-200 group-hover:scale-105"
                />
                {duration && (
                    <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
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
