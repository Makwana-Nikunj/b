import { useEffect, useState } from 'react'
import { dashboardService, videoService } from '../services'
import { DashboardSkeleton } from '../components/ui/Skeleton'
import { HiEye, HiFilm, HiUserGroup, HiThumbUp, HiPencil, HiTrash } from 'react-icons/hi'
import { formatViews } from '../utils/formatNumber'
import { formatDistanceToNow } from '../utils/formatDate'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

function DashboardPage() {
    const [stats, setStats] = useState(null)
    const [videos, setVideos] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const [statsRes, videosRes] = await Promise.all([
                dashboardService.getChannelStats(),
                dashboardService.getChannelVideos(),
            ])
            setStats(statsRes?.data || null)
            // getChannelVideos returns { data: videos[] } - direct array
            const videosData = videosRes?.data || []
            setVideos(Array.isArray(videosData) ? videosData : [])
        } catch (error) {
            console.error('Failed to load dashboard data')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteVideo = async (videoId) => {
        if (!window.confirm('Are you sure you want to delete this video?')) return

        try {
            await videoService.deleteVideo(videoId)
            setVideos(videos.filter((v) => v._id !== videoId))
            toast.success('Video deleted')
        } catch (error) {
            // Error handled by interceptor
        }
    }

    const handleTogglePublish = async (videoId) => {
        try {
            const response = await videoService.togglePublishStatus(videoId)
            // togglePublishStatus returns { data: boolean } - just the isPublished value
            const isPublished = response?.data
            if (typeof isPublished === 'boolean') {
                setVideos(
                    videos.map((v) =>
                        v._id === videoId ? { ...v, isPublished } : v
                    )
                )
                toast.success(isPublished ? 'Video published' : 'Video unpublished')
            }
        } catch (error) {
            // Error handled by interceptor
        }
    }

    if (isLoading) {
        return <DashboardSkeleton />
    }

    const statCards = [
        {
            icon: HiEye,
            label: 'Total Views',
            value: formatViews(stats?.totalViews || 0),
            color: 'bg-blue-600',
        },
        {
            icon: HiFilm,
            label: 'Total Videos',
            value: stats?.totalVideos || 0,
            color: 'bg-green-600',
        },
        {
            icon: HiUserGroup,
            label: 'Subscribers',
            value: formatViews(stats?.totalSubscribers || 0),
            color: 'bg-purple-600',
        },
        {
            icon: HiThumbUp,
            label: 'Total Likes',
            value: formatViews(stats?.totalLikes || 0),
            color: 'bg-red-600',
        },
    ]

    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">Channel Dashboard</h1>

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-gray-800/50 rounded-xl p-4 flex items-center gap-4"
                    >
                        <div className={`${stat.color} p-3 rounded-lg`}>
                            <stat.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">{stat.label}</p>
                            <p className="text-white text-2xl font-bold">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Videos table */}
            <div className="bg-gray-800/50 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Your Videos</h2>
                </div>

                {videos.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        No videos uploaded yet
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-900/50">
                                <tr>
                                    <th className="text-left text-gray-400 px-4 py-3 font-medium">Video</th>
                                    <th className="text-left text-gray-400 px-4 py-3 font-medium">Views</th>
                                    <th className="text-left text-gray-400 px-4 py-3 font-medium">Date</th>
                                    <th className="text-left text-gray-400 px-4 py-3 font-medium">Status</th>
                                    <th className="text-left text-gray-400 px-4 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {videos.map((video) => (
                                    <tr key={video._id} className="hover:bg-gray-800/50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={video.thumbnail}
                                                    alt={video.title}
                                                    className="w-20 h-12 object-cover rounded"
                                                />
                                                <Link
                                                    to={`/video/${video._id}`}
                                                    className="text-white hover:text-blue-400 line-clamp-1"
                                                >
                                                    {video.title}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">
                                            {formatViews(video.views)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-400">
                                            {formatDistanceToNow(video.createdAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleTogglePublish(video._id)}
                                                className={`px-3 py-1 rounded-full text-sm ${video.isPublished
                                                    ? 'bg-green-600/20 text-green-400'
                                                    : 'bg-yellow-600/20 text-yellow-400'
                                                    }`}
                                            >
                                                {video.isPublished ? 'Published' : 'Draft'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/video/${video._id}/edit`}
                                                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                                >
                                                    <HiPencil className="w-5 h-5 text-gray-400" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteVideo(video._id)}
                                                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                                >
                                                    <HiTrash className="w-5 h-5 text-red-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DashboardPage
