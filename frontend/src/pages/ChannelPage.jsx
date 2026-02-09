import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { authService, subscriptionService, videoService, playlistService } from '../services'
import { VideoGrid } from '../components/video'
import { Avatar, Button, EmptyState } from '../components/ui'
import { ChannelSkeleton, PlaylistGridSkeleton } from '../components/ui/Skeleton'
import { formatSubscribers } from '../utils/formatNumber'
import { HiCollection } from 'react-icons/hi'
import toast from 'react-hot-toast'

function ChannelPage() {
    const { username } = useParams()
    const { user, isAuthenticated } = useSelector((state) => state.auth)

    const [channel, setChannel] = useState(null)
    const [videos, setVideos] = useState([])
    const [playlists, setPlaylists] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [videosLoading, setVideosLoading] = useState(false)
    const [playlistsLoading, setPlaylistsLoading] = useState(false)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [activeTab, setActiveTab] = useState('videos')

    const isOwnChannel = user?.username === username

    useEffect(() => {
        if (username && username !== 'undefined') {
            fetchChannelProfile()
        }
    }, [username])

    const fetchChannelProfile = async () => {
        if (!username) return
        setIsLoading(true)
        try {
            const response = await authService.getChannelProfile(username)
            const channelData = response?.data
            if (channelData) {
                setChannel(channelData)
                setIsSubscribed(channelData.isSubscribed || false)
                if (channelData._id) {
                    fetchChannelVideos(channelData._id)
                    fetchChannelPlaylists(channelData._id)
                }
            }
        } catch (error) {
            toast.error('Failed to load channel')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchChannelVideos = async (userId) => {
        setVideosLoading(true)
        try {
            const response = await videoService.getAllVideos({ userId })
            // API returns { data: { videos, pagination } }
            const videosData = response?.data?.videos || response?.data?.docs || response?.data || []
            setVideos(Array.isArray(videosData) ? videosData : [])
        } catch (error) {
            console.error('Failed to load videos')
        } finally {
            setVideosLoading(false)
        }
    }

    const fetchChannelPlaylists = async (userId) => {
        setPlaylistsLoading(true)
        try {
            const response = await playlistService.getUserPlaylists(userId)
            // API returns { data: playlists[] }
            const playlistsData = response?.data || []
            setPlaylists(Array.isArray(playlistsData) ? playlistsData : [])
        } catch (error) {
            console.error('Failed to load playlists')
        } finally {
            setPlaylistsLoading(false)
        }
    }

    const handleSubscribe = async () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to subscribe')
            return
        }
        try {
            const response = await subscriptionService.toggleSubscription(channel._id)
            // API returns { data: { isSubscribed: boolean } }
            const newIsSubscribed = response?.data?.isSubscribed
            if (typeof newIsSubscribed === 'boolean') {
                setIsSubscribed(newIsSubscribed)
                setChannel((prev) => ({
                    ...prev,
                    subscribersCount: newIsSubscribed
                        ? (prev.subscribersCount || 0) + 1
                        : (prev.subscribersCount || 0) - 1,
                }))
                toast.success(newIsSubscribed ? 'Subscribed!' : 'Unsubscribed')
            }
        } catch (error) {
            // Error handled by interceptor
        }
    }

    if (isLoading) {
        return <ChannelSkeleton />
    }

    if (!channel) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl text-white">Channel not found</h2>
            </div>
        )
    }

    return (
        <div className="animate-fadeIn">
            {/* Cover Image */}
            <div className="h-48 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl overflow-hidden">
                {channel.coverImage && (
                    <img
                        src={channel.coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* Channel Info */}
            <div className="flex flex-wrap items-end gap-4 -mt-12 px-4">
                <Avatar src={channel.avatar} alt={channel.fullName} size="2xl" />

                <div className="flex-1 mt-14">
                    <h1 className="text-2xl font-bold text-white">{channel.fullName}</h1>
                    <p className="text-gray-400">@{channel.username}</p>
                    <p className="text-gray-400 text-sm mt-1">
                        {formatSubscribers(channel.subscribersCount || 0)}
                        <span className="mx-2">•</span>
                        {videos.length} videos
                    </p>
                </div>

                {!isOwnChannel && isAuthenticated && (
                    <Button
                        variant={isSubscribed ? 'secondary' : 'primary'}
                        onClick={handleSubscribe}
                    >
                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-6 mt-6 border-b border-gray-800/50">
                <button
                    onClick={() => setActiveTab('videos')}
                    className={`pb-3 px-2 border-b-2 transition-all duration-200 font-medium ${activeTab === 'videos'
                        ? 'border-primary-500 text-white'
                        : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                >
                    Videos
                </button>
                <button
                    onClick={() => setActiveTab('playlists')}
                    className={`pb-3 px-2 border-b-2 transition-all duration-200 font-medium ${activeTab === 'playlists'
                        ? 'border-primary-500 text-white'
                        : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                >
                    Playlists
                </button>
                <button
                    onClick={() => setActiveTab('about')}
                    className={`pb-3 px-2 border-b-2 transition-all duration-200 font-medium ${activeTab === 'about'
                        ? 'border-primary-500 text-white'
                        : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                >
                    About
                </button>
            </div>

            {/* Tab Content */}
            <div className="mt-6 animate-fadeIn" key={activeTab}>
                {activeTab === 'videos' && (
                    <VideoGrid
                        videos={videos}
                        isLoading={videosLoading}
                        emptyMessage="No videos uploaded yet"
                    />
                )}

                {activeTab === 'playlists' && (
                    playlistsLoading ? (
                        <PlaylistGridSkeleton count={6} />
                    ) : playlists.length === 0 ? (
                        <EmptyState
                            icon={HiCollection}
                            title="No playlists yet"
                            description="This channel hasn't created any playlists"
                        />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {playlists.map((playlist, index) => (
                                <Link
                                    key={playlist._id}
                                    to={`/playlist/${playlist._id}`}
                                    className="bg-gray-800/40 rounded-xl overflow-hidden hover:bg-gray-800/80 transition-all duration-200 card-hover border border-gray-700/30 animate-fadeIn"
                                    style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
                                >
                                    <div className="aspect-video bg-gray-700 relative">
                                        {playlist.videos?.[0]?.thumbnail ? (
                                            <img
                                                src={playlist.videos[0].thumbnail}
                                                alt={playlist.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <HiCollection className="w-12 h-12 text-gray-500" />
                                            </div>
                                        )}
                                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                            {playlist.videos?.length || 0} videos
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="text-white font-medium line-clamp-1">
                                            {playlist.name}
                                        </h3>
                                        {playlist.description && (
                                            <p className="text-gray-400 text-sm line-clamp-2 mt-1">
                                                {playlist.description}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'about' && (
                    <div className="max-w-2xl">
                        <h3 className="text-white font-medium mb-2">About</h3>
                        <p className="text-gray-400">
                            Member since {new Date(channel.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ChannelPage
