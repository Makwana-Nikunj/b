import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchVideoById, clearCurrentVideo } from '../store/slices/videoSlice'
import { fetchUserPlaylists, addVideoToPlaylist, removeVideoFromPlaylist, createPlaylist } from '../store/slices/playlistSlice'
import { VideoPlayer } from '../components/video'
import { Avatar, Button, LoadingSpinner, Textarea, Modal, Input } from '../components/ui'
import { VideoPlayerSkeleton, VideoCardSkeleton } from '../components/ui/Skeleton'
import { formatDistanceToNow } from '../utils/formatDate'
import { formatViews, formatSubscribers } from '../utils/formatNumber'
import { formatDuration } from '../utils/formatDuration'
import { HiThumbUp, HiThumbDown, HiShare, HiBookmark, HiPlus, HiCheck } from 'react-icons/hi'
import { likeService, commentService, subscriptionService, authService, videoService } from '../services'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

function VideoPage() {
    const { videoId } = useParams()
    const dispatch = useDispatch()
    const { currentVideo, isVideoLoading } = useSelector((state) => state.videos)
    const { user, isAuthenticated } = useSelector((state) => state.auth)
    const { playlists } = useSelector((state) => state.playlists)

    const [comments, setComments] = useState([])
    const [commentsLoading, setCommentsLoading] = useState(false)
    const [newComment, setNewComment] = useState('')
    const [isLiked, setIsLiked] = useState(false)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [likeCount, setLikeCount] = useState(0)
    const [showPlaylistModal, setShowPlaylistModal] = useState(false)
    const [showCreatePlaylist, setShowCreatePlaylist] = useState(false)
    const [relatedVideos, setRelatedVideos] = useState([])
    const [relatedLoading, setRelatedLoading] = useState(false)

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: { name: '', description: '' }
    })

    useEffect(() => {
        if (videoId) {
            dispatch(fetchVideoById(videoId))
        }
        return () => {
            dispatch(clearCurrentVideo())
        }
    }, [videoId, dispatch])

    // Set like status and count when video loads
    useEffect(() => {
        if (currentVideo) {
            setIsLiked(currentVideo.isLiked || false)
            setLikeCount(currentVideo.likesCount || 0)
        }
    }, [currentVideo])

    useEffect(() => {
        if (videoId && isAuthenticated) {
            fetchComments()
        }
    }, [videoId, isAuthenticated])

    // Check subscription status when video loads
    useEffect(() => {
        const checkSubscriptionStatus = async () => {
            if (currentVideo?.owner?.username && isAuthenticated && user?._id !== currentVideo.owner._id) {
                try {
                    // Get the channel profile to check subscription status
                    const response = await authService.getChannelProfile(currentVideo.owner.username)
                    setIsSubscribed(response?.data?.isSubscribed || false)
                } catch (error) {
                    console.error('Failed to check subscription status')
                }
            }
        }
        checkSubscriptionStatus()
    }, [currentVideo, isAuthenticated, user])

    // Fetch related videos
    useEffect(() => {
        const fetchRelatedVideos = async () => {
            if (!videoId) return
            setRelatedLoading(true)
            try {
                const response = await videoService.getAllVideos({ limit: 10 })
                const videos = response?.data?.videos || response?.data || []
                // Filter out current video
                const filtered = videos.filter(v => v._id !== videoId)
                setRelatedVideos(filtered)
            } catch (error) {
                console.error('Failed to load related videos')
            } finally {
                setRelatedLoading(false)
            }
        }
        fetchRelatedVideos()
    }, [videoId])

    const fetchComments = async () => {
        setCommentsLoading(true)
        try {
            const response = await commentService.getVideoComments(videoId, { page: 1, limit: 20 })
            // API returns { data: { comments, pagination } }
            const commentsData = response?.data?.comments || response?.data || []
            setComments(Array.isArray(commentsData) ? commentsData : [])
        } catch (error) {
            console.error('Failed to load comments')
        } finally {
            setCommentsLoading(false)
        }
    }

    const handleLike = async () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to like videos')
            return
        }
        try {
            const response = await likeService.toggleVideoLike(videoId)
            // API returns { data: { isLiked: boolean } }
            const newIsLiked = response?.data?.isLiked
            if (typeof newIsLiked === 'boolean') {
                setIsLiked(newIsLiked)
                setLikeCount((prev) => newIsLiked ? prev + 1 : prev - 1)
            }
        } catch (error) {
            // Error handled by interceptor
        }
    }

    const handleSubscribe = async () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to subscribe')
            return
        }
        try {
            const response = await subscriptionService.toggleSubscription(currentVideo.owner._id)
            // API returns { data: { isSubscribed: boolean } }
            const newIsSubscribed = response?.data?.isSubscribed
            if (typeof newIsSubscribed === 'boolean') {
                setIsSubscribed(newIsSubscribed)
                toast.success(newIsSubscribed ? 'Subscribed!' : 'Unsubscribed')
            }
        } catch (error) {
            // Error handled by interceptor
        }
    }

    const handleAddComment = async (e) => {
        e.preventDefault()
        if (!newComment.trim()) return

        try {
            const response = await commentService.addComment(videoId, { content: newComment })
            // API returns { data: comment }
            const newCommentData = response?.data
            if (newCommentData) {
                setComments([newCommentData, ...comments])
                setNewComment('')
                toast.success('Comment added')
            }
        } catch (error) {
            // Error handled by interceptor
        }
    }

    const handleDeleteComment = async (commentId) => {
        try {
            await commentService.deleteComment(commentId)
            setComments(comments.filter((c) => c._id !== commentId))
            toast.success('Comment deleted')
        } catch (error) {
            // Error handled by interceptor
        }
    }

    const handleSaveToPlaylist = () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to save videos')
            return
        }
        // Fetch user's playlists when opening modal
        if (user?._id) {
            dispatch(fetchUserPlaylists(user._id))
        }
        setShowPlaylistModal(true)
    }

    const isVideoInPlaylist = (playlist) => {
        return playlist.videos?.some(v =>
            (typeof v === 'string' ? v : v._id) === videoId
        )
    }

    const handleTogglePlaylist = async (playlist) => {
        const inPlaylist = isVideoInPlaylist(playlist)
        try {
            if (inPlaylist) {
                await dispatch(removeVideoFromPlaylist({ videoId, playlistId: playlist._id })).unwrap()
                toast.success(`Removed from "${playlist.name}"`)
            } else {
                await dispatch(addVideoToPlaylist({ videoId, playlistId: playlist._id })).unwrap()
                toast.success(`Added to "${playlist.name}"`)
            }
            // Refresh playlists
            dispatch(fetchUserPlaylists(user._id))
        } catch (error) {
            // Error handled by interceptor
        }
    }

    const onCreatePlaylist = async (data) => {
        try {
            const result = await dispatch(createPlaylist(data)).unwrap()
            // Add video to the newly created playlist
            if (result?._id) {
                await dispatch(addVideoToPlaylist({ videoId, playlistId: result._id })).unwrap()
                toast.success(`Created "${data.name}" and added video`)
            }
            setShowCreatePlaylist(false)
            reset()
            dispatch(fetchUserPlaylists(user._id))
        } catch (error) {
            // Error handled by interceptor
        }
    }

    if (isVideoLoading) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (!currentVideo) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl text-white">Video not found</h2>
            </div>
        )
    }

    const { title, description, views, createdAt, videoFile, thumbnail, owner } = currentVideo

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Main content - Video and comments */}
            <div className="flex-1 min-w-0">
                {/* Video Player */}
                <VideoPlayer src={videoFile} poster={thumbnail} title={title} />

                {/* Video Info */}
                <div className="mt-4">
                    <h1 className="text-xl font-bold text-white">{title}</h1>

                    <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                        {/* Channel info */}
                        <div className="flex items-center gap-3">
                            <Avatar src={owner?.avatar} alt={owner?.fullName} size="lg" />
                            <div>
                                <h3 className="text-white font-medium">{owner?.fullName}</h3>
                                <p className="text-gray-400 text-sm">
                                    {formatSubscribers(owner?.subscriberCount || 0)}
                                </p>
                            </div>
                            {isAuthenticated && user?._id !== owner?._id && (
                                <Button
                                    variant={isSubscribed ? 'secondary' : 'primary'}
                                    onClick={handleSubscribe}
                                    className="ml-4"
                                >
                                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                                </Button>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${isLiked ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'
                                    }`}
                            >
                                <HiThumbUp className="w-5 h-5" />
                                <span>{likeCount}</span>
                            </button>

                            <button className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition-colors">
                                <HiThumbDown className="w-5 h-5" />
                            </button>

                            <button className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition-colors">
                                <HiShare className="w-5 h-5" />
                                <span>Share</span>
                            </button>

                            <button
                                onClick={handleSaveToPlaylist}
                                className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition-colors"
                            >
                                <HiBookmark className="w-5 h-5" />
                                <span>Save</span>
                            </button>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mt-4 bg-gray-800/50 rounded-xl p-4">
                        <div className="text-gray-400 text-sm mb-2">
                            <span>{formatViews(views)} views</span>
                            <span className="mx-2">•</span>
                            <span>{formatDistanceToNow(createdAt)}</span>
                        </div>
                        <p className="text-white whitespace-pre-wrap">{description}</p>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="mt-8">
                    <h2 className="text-lg font-bold text-white mb-4">
                        {comments.length} Comments
                    </h2>

                    {/* Add comment */}
                    {isAuthenticated ? (
                        <form onSubmit={handleAddComment} className="flex gap-3 mb-6">
                            <Avatar src={user?.avatar} alt={user?.fullName} size="md" />
                            <div className="flex-1">
                                <Textarea
                                    placeholder="Add a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    rows={2}
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setNewComment('')}
                                        disabled={!newComment.trim()}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={!newComment.trim()}>
                                        Comment
                                    </Button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <p className="text-gray-400 mb-6">Sign in to comment</p>
                    )}

                    {/* Comments list */}
                    {commentsLoading ? (
                        <div className="flex justify-center py-4">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <div key={comment._id} className="flex gap-3">
                                    <Avatar
                                        src={comment.owner?.avatar}
                                        alt={comment.owner?.fullName}
                                        size="md"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-medium">
                                                {comment.owner?.fullName}
                                            </span>
                                            <span className="text-gray-500 text-sm">
                                                {formatDistanceToNow(comment.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-gray-300 mt-1">{comment.content}</p>

                                        {user?._id === comment.owner?._id && (
                                            <button
                                                onClick={() => handleDeleteComment(comment._id)}
                                                className="text-red-500 text-sm mt-2 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Related Videos Sidebar */}
            <div className="w-full lg:w-[400px] flex-shrink-0">
                <h3 className="text-lg font-semibold text-white mb-4">Related Videos</h3>
                {relatedLoading ? (
                    <div className="flex justify-center py-4">
                        <LoadingSpinner />
                    </div>
                ) : relatedVideos.length === 0 ? (
                    <p className="text-gray-400">No related videos found</p>
                ) : (
                    <div className="space-y-3">
                        {relatedVideos.map((video) => (
                            <Link
                                key={video._id}
                                to={`/video/${video._id}`}
                                className="flex gap-3 group hover:bg-gray-800/50 p-2 rounded-lg transition-colors"
                            >
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-40 h-24 object-cover rounded-lg bg-gray-800"
                                    />
                                    {video.duration && (
                                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                                            {formatDuration(video.duration)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white text-sm font-medium line-clamp-2 group-hover:text-blue-400 transition-colors">
                                        {video.title}
                                    </h4>
                                    <p className="text-gray-400 text-xs mt-1">
                                        {video.owner?.fullName}
                                    </p>
                                    <p className="text-gray-400 text-xs">
                                        {formatViews(video.views)} views • {formatDistanceToNow(video.createdAt)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Save to Playlist Modal */}
            <Modal
                isOpen={showPlaylistModal}
                onClose={() => {
                    setShowPlaylistModal(false)
                    setShowCreatePlaylist(false)
                }}
                title="Save to playlist"
            >
                {showCreatePlaylist ? (
                    <form onSubmit={handleSubmit(onCreatePlaylist)} className="space-y-4">
                        <Input
                            label="Name"
                            placeholder="Enter playlist name"
                            error={errors.name?.message}
                            {...register('name', {
                                required: 'Playlist name is required',
                                maxLength: { value: 100, message: 'Name must be under 100 characters' }
                            })}
                        />
                        <Textarea
                            label="Description"
                            placeholder="Enter playlist description"
                            rows={3}
                            error={errors.description?.message}
                            {...register('description', {
                                required: 'Description is required',
                                maxLength: { value: 500, message: 'Description must be under 500 characters' }
                            })}
                        />
                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setShowCreatePlaylist(false)
                                    reset()
                                }}
                            >
                                Back
                            </Button>
                            <Button type="submit">
                                Create
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-2">
                        {playlists.length === 0 ? (
                            <p className="text-gray-400 text-center py-4">No playlists yet</p>
                        ) : (
                            playlists.map((playlist) => (
                                <button
                                    key={playlist._id}
                                    onClick={() => handleTogglePlaylist(playlist)}
                                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    <span className="text-white">{playlist.name}</span>
                                    {isVideoInPlaylist(playlist) ? (
                                        <HiCheck className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <HiPlus className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>
                            ))
                        )}
                        <button
                            onClick={() => setShowCreatePlaylist(true)}
                            className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-gray-700 transition-colors text-blue-400"
                        >
                            <HiPlus className="w-5 h-5" />
                            <span>Create new playlist</span>
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default VideoPage
