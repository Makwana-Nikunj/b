import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchVideos } from '../store/slices/videoSlice'
import VideoGrid from '../components/video/VideoGrid'

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
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">Recommended</h1>

            <VideoGrid
                videos={videos}
                isLoading={isLoading}
                emptyMessage="No videos available"
            />

            {/* Load more button */}
            {pagination.hasNextPage && !isLoading && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={handleLoadMore}
                        className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-full transition-colors"
                    >
                        Load more
                    </button>
                </div>
            )}
        </div>
    )
}

export default HomePage
