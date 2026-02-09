import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchVideos } from '../store/slices/videoSlice'
import VideoGrid from '../components/video/VideoGrid'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function HomePage() {
    const dispatch = useDispatch()
    const { videos, isLoading, pagination } = useSelector((state) => state.videos)

    useEffect(() => {
        dispatch(fetchVideos({ page: 1, limit: 12 }))
    }, [dispatch])

    const handleLoadMore = () => {
        if (pagination.hasNextPage) {
            dispatch(fetchVideos({ page: pagination.page + 1, limit: 12 }))
        }
    }

    return (
        <div className="animate-fadeIn">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Recommended</h1>

            <VideoGrid
                videos={videos}
                isLoading={isLoading}
                emptyMessage="No videos available"
                skeletonCount={12}
            />

            {/* Load more button */}
            {pagination.hasNextPage && !isLoading && (
                <div className="flex justify-center mt-10">
                    <button
                        onClick={handleLoadMore}
                        className="bg-gray-800 hover:bg-gray-700 active:scale-95 text-white px-8 py-2.5 rounded-full transition-all duration-200 min-h-[44px] font-medium border border-gray-700/50 hover:border-gray-600"
                    >
                        Load more
                    </button>
                </div>
            )}

            {/* Loading more indicator */}
            {isLoading && videos.length > 0 && (
                <div className="flex justify-center mt-10">
                    <LoadingSpinner size="md" />
                </div>
            )}
        </div>
    )
}

export default HomePage
