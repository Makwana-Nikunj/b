import VideoCard from './VideoCard'
import EmptyState from '../ui/EmptyState'
import { VideoGridSkeleton } from '../ui/Skeleton'
import { HiFilm } from 'react-icons/hi'

function VideoGrid({ videos, isLoading, emptyMessage = 'No videos found', skeletonCount = 8 }) {
    // Ensure videos is always an array
    const videoList = Array.isArray(videos) ? videos : []

    // Show skeleton loading instead of spinner
    if (isLoading && videoList.length === 0) {
        return <VideoGridSkeleton count={skeletonCount} />
    }

    if (videoList.length === 0) {
        return (
            <div className="animate-fadeIn">
                <EmptyState
                    icon={HiFilm}
                    title={emptyMessage}
                    description="Videos you're looking for will appear here"
                />
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoList.map((video, index) => (
                <div
                    key={video._id}
                    className="animate-fadeIn"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                >
                    <VideoCard video={video} />
                </div>
            ))}
        </div>
    )
}

export default VideoGrid
