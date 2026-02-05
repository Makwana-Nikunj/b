import { useEffect, useState } from 'react'
import { likeService } from '../services'
import { VideoGrid } from '../components/video'
import { EmptyState } from '../components/ui'
import { VideoGridSkeleton } from '../components/ui/Skeleton'
import { HiThumbUp } from 'react-icons/hi'

function LikedVideosPage() {
    const [likedVideos, setLikedVideos] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchLikedVideos()
    }, [])

    const fetchLikedVideos = async () => {
        try {
            const response = await likeService.getLikedVideos()
            // getLikedVideos returns { data: { videos: [], pagination: {} } }
            const videosData = response?.data?.videos || []
            setLikedVideos(Array.isArray(videosData) ? videosData : [])
        } catch (error) {
            console.error('Failed to load liked videos')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div>
                <div className="h-8 bg-gray-700 rounded w-32 mb-6 animate-pulse" />
                <VideoGridSkeleton count={8} />
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">Liked Videos</h1>

            {likedVideos.length === 0 ? (
                <EmptyState
                    icon={HiThumbUp}
                    title="No liked videos"
                    description="Videos you like will appear here"
                />
            ) : (
                <VideoGrid videos={likedVideos} isLoading={false} />
            )}
        </div>
    )
}

export default LikedVideosPage
