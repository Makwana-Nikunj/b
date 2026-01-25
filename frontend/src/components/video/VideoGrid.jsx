import VideoCard from './VideoCard'
import LoadingSpinner from '../ui/LoadingSpinner'
import EmptyState from '../ui/EmptyState'
import { HiFilm } from 'react-icons/hi'

function VideoGrid({ videos, isLoading, emptyMessage = 'No videos found' }) {
    // Ensure videos is always an array
    const videoList = Array.isArray(videos) ? videos : []

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (videoList.length === 0) {
        return (
            <EmptyState
                icon={HiFilm}
                title={emptyMessage}
                description="Videos you're looking for will appear here"
            />
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videoList.map((video) => (
                <VideoCard key={video._id} video={video} />
            ))}
        </div>
    )
}

export default VideoGrid
