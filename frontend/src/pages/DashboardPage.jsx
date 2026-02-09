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
            color: 'bg-blue-500/20 text-blue-400',
            iconColor: 'text-blue-400',
        },
        {
            icon: HiFilm,
            label: 'Total Videos',
            value: stats?.totalVideos || 0,
            color: 'bg-green-500/20 text-green-400',
            iconColor: 'text-green-400',
        },
        {
            icon: HiUserGroup,
            label: 'Subscribers',
            value: formatViews(stats?.totalSubscribers || 0),
            color: 'bg-purple-500/20 text-purple-400',
            iconColor: 'text-purple-400',
        },
        {
            icon: HiThumbUp,
            label: 'Total Likes',
            value: formatViews(stats?.totalLikes || 0),
            color: 'bg-red-500/20 text-red-400',
            iconColor: 'text-red-400',
        },
    ]

    return (
        <div className="animate-fadeIn">
            <h1 className="text-2xl font-bold text-white mb-6">Channel Dashboard</h1>

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-5 flex items-center gap-4 border border-gray-700/30 card-hover animate-fadeIn"
                        style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
                    >
                        <div className={`${stat.color} p-3 rounded-xl`}>
                            <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                            <p className="text-white text-2xl font-bold animate-countPop">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Videos table */}
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/30">
                <div className="p-4 border-b border-gray-700/50">
                    <h2 className="text-lg font-semibold text-white">Your Videos</h2>
                </div>

                {videos.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <HiFilm className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                        <p>No videos uploaded yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-900/30">
                                <tr>
                                    <th className="text-left text-gray-400 px-4 py-3 font-medium text-sm">Video</th>
                                    <th className="text-left text-gray-400 px-4 py-3 font-medium text-sm">Views</th>
                                    <th className="text-left text-gray-400 px-4 py-3 font-medium text-sm">Date</th>
                                    <th className="text-left text-gray-400 px-4 py-3 font-medium text-sm">Status</th>
                                    <th className="text-left text-gray-400 px-4 py-3 font-medium text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/30">
                                {videos.map((video, index) => (
                                    <tr
                                        key={video._id}
                                        className="hover:bg-gray-800/50 transition-colors duration-150 animate-fadeIn"
                                        style={{ animationDelay: `${(index + 4) * 60}ms`, animationFillMode: 'both' }}
                                    >
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
                                                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${video.isPublished
                                                    ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
                                                    : 'bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25'
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
