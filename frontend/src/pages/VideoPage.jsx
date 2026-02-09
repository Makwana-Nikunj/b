import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchVideoById, clearCurrentVideo } from '../store/slices/videoSlice'
import { fetchUserPlaylists, addVideoToPlaylist, removeVideoFromPlaylist, createPlaylist } from '../store/slices/playlistSlice'
import { VideoPlayer } from '../components/video'
import { Avatar, Button, Textarea, Modal, Input, LoadingSpinner } from '../components/ui'
import { VideoPlayerSkeleton, RelatedVideosSkeleton, CommentsSkeleton } from '../components/ui/Skeleton'
import { formatDistanceToNow } from '../utils/formatDate'
import { formatViews, formatSubscribers } from '../utils/formatNumber'
import { formatDuration } from '../utils/formatDuration'
import { HiThumbUp, HiThumbDown, HiShare, HiBookmark, HiPlus, HiCheck, HiChevronDown, HiChevronUp } from 'react-icons/hi'
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
    const [showDescription, setShowDescription] = useState(false)
    const [showCommentInput, setShowCommentInput] = useState(false)

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
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 -mx-4 sm:mx-0">
                <div className="flex-1 min-w-0">
                    <VideoPlayerSkeleton />
                    <div className="mt-6 px-4 sm:px-0">
                        <CommentsSkeleton count={3} />
                    </div>
                </div>
                <div className="lg:w-[360px] flex-shrink-0 px-4 sm:px-0">
                    <RelatedVideosSkeleton count={6} />
                </div>
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
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 animate-fadeIn -mx-4 sm:mx-0">
            {/* Main content - Video and comments */}
            <div className="flex-1 min-w-0">
                {/* Video Player - edge-to-edge on mobile */}
                <div className="sm:rounded-2xl overflow-hidden">
                    <VideoPlayer src={videoFile} poster={thumbnail} title={title} />
                </div>

                {/* Video Info - padded on mobile */}
                <div className="mt-3 sm:mt-4 px-4 sm:px-0">
                    <h1 className="text-lg sm:text-xl font-bold text-white leading-snug">{title}</h1>

                    {/* Views & date - compact on mobile */}
                    <div className="text-gray-400 text-xs sm:text-sm mt-1.5 sm:mt-2">
                        <span>{formatViews(views)} views</span>
                        <span className="mx-1.5">•</span>
                        <span>{formatDistanceToNow(createdAt)}</span>
                    </div>

                    {/* Channel + Subscribe */}
                    <div className="flex items-center justify-between gap-3 mt-3 sm:mt-4">
                        <Link to={`/channel/${owner?.username}`} className="flex items-center gap-2.5 sm:gap-3 min-w-0 group">
                            <Avatar src={owner?.avatar} alt={owner?.fullName} size="lg" />
                            <div className="min-w-0">
                                <h3 className="text-white font-medium text-sm sm:text-base truncate group-hover:text-primary-400 transition-colors">{owner?.fullName}</h3>
                                <p className="text-gray-400 text-xs sm:text-sm">
                                    {formatSubscribers(owner?.subscriberCount || 0)}
                                </p>
                            </div>
                        </Link>
                        {isAuthenticated && user?._id !== owner?._id && (
                            <Button
                                variant={isSubscribed ? 'secondary' : 'primary'}
                                onClick={handleSubscribe}
                                className="flex-shrink-0 !rounded-full !px-4 sm:!px-5 !py-2 !text-sm font-medium"
                            >
                                {isSubscribed ? 'Subscribed' : 'Subscribe'}
                            </Button>
                        )}
                    </div>

                    {/* Action buttons - icons only on mobile, with text on desktop */}
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 overflow-x-auto scrollbar-none pb-1">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-sm transition-all duration-200 active:scale-95 flex-shrink-0 ${isLiked ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-gray-800 text-white hover:bg-gray-700'
                                }`}
                        >
                            <HiThumbUp className="w-5 h-5" />
                            <span className="font-medium">{likeCount}</span>
                        </button>

                        <button className="flex items-center bg-gray-800 text-white p-2 sm:px-4 sm:py-2 rounded-full hover:bg-gray-700 transition-all duration-200 active:scale-95 flex-shrink-0">
                            <HiThumbDown className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => {
                                navigator.clipboard?.writeText(window.location.href)
                                toast.success('Link copied!')
                            }}
                            className="flex items-center gap-1.5 bg-gray-800 text-white px-3 sm:px-4 py-2 rounded-full hover:bg-gray-700 transition-all duration-200 active:scale-95 flex-shrink-0"
                        >
                            <HiShare className="w-5 h-5" />
                            <span className="hidden sm:inline text-sm">Share</span>
                        </button>

                        <button
                            onClick={handleSaveToPlaylist}
                            className="flex items-center gap-1.5 bg-gray-800 text-white px-3 sm:px-4 py-2 rounded-full hover:bg-gray-700 transition-all duration-200 active:scale-95 flex-shrink-0"
                        >
                            <HiBookmark className="w-5 h-5" />
                            <span className="hidden sm:inline text-sm">Save</span>
                        </button>
                    </div>

                    {/* Description - collapsible */}
                    <button
                        onClick={() => setShowDescription(!showDescription)}
                        className="w-full mt-3 sm:mt-4 bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-700/30 hover:bg-gray-800/60 transition-colors duration-200 text-left"
                    >
                        {!showDescription ? (
                            <div>
                                <p className="text-white text-sm line-clamp-2">{description}</p>
                                <div className="flex items-center gap-1 text-gray-400 text-xs mt-2 font-medium">
                                    <span>Show more</span>
                                    <HiChevronDown className="w-4 h-4" />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-white text-sm whitespace-pre-wrap">{description}</p>
                                <div className="flex items-center gap-1 text-gray-400 text-xs mt-3 font-medium">
                                    <span>Show less</span>
                                    <HiChevronUp className="w-4 h-4" />
                                </div>
                            </div>
                        )}
                    </button>
                </div>

                {/* Comments Section */}
                <div className="mt-6 sm:mt-8 px-4 sm:px-0">
                    <h2 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">
                        {comments.length} Comments
                    </h2>

                    {/* Add comment - compact for mobile */}
                    {isAuthenticated ? (
                        <div className="mb-4 sm:mb-6">
                            {!showCommentInput ? (
                                <button
                                    onClick={() => setShowCommentInput(true)}
                                    className="flex items-center gap-3 w-full"
                                >
                                    <Avatar src={user?.avatar} alt={user?.fullName} size="sm" />
                                    <div className="flex-1 text-left text-gray-400 text-sm bg-transparent border-b border-gray-700 pb-2">
                                        Add a comment...
                                    </div>
                                </button>
                            ) : (
                                <form onSubmit={handleAddComment} className="flex gap-2 sm:gap-3">
                                    <Avatar src={user?.avatar} alt={user?.fullName} size="sm" className="mt-1 hidden sm:block" />
                                    <div className="flex-1">
                                        <Textarea
                                            placeholder="Add a comment..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            rows={2}
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setNewComment('')
                                                    setShowCommentInput(false)
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" size="sm" disabled={!newComment.trim()}>
                                                Comment
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm mb-4 sm:mb-6">Sign in to comment</p>
                    )}

                    {/* Comments list */}
                    {commentsLoading ? (
                        <CommentsSkeleton count={4} />
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {comments.map((comment, index) => (
                                <div
                                    key={comment._id}
                                    className="flex gap-2.5 sm:gap-3 animate-fadeIn"
                                    style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}
                                >
                                    <Avatar
                                        src={comment.owner?.avatar}
                                        alt={comment.owner?.fullName}
                                        size="sm"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-medium text-sm">
                                                {comment.owner?.fullName}
                                            </span>
                                            <span className="text-gray-500 text-xs">
                                                {formatDistanceToNow(comment.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-gray-300 text-sm mt-0.5">{comment.content}</p>

                                        {user?._id === comment.owner?._id && (
                                            <button
                                                onClick={() => handleDeleteComment(comment._id)}
                                                className="text-red-400 text-xs mt-1.5 hover:text-red-300 transition-colors duration-200"
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
            <div className="w-full lg:w-[360px] flex-shrink-0 px-4 sm:px-0">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Related Videos</h3>
                {relatedLoading ? (
                    <RelatedVideosSkeleton count={6} />
                ) : relatedVideos.length === 0 ? (
                    <p className="text-gray-500 text-center py-8 text-sm">No related videos found</p>
                ) : (
                    <>
                        {/* Mobile: horizontal scroll */}
                        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-3 -mx-4 px-4 sm:hidden">
                            {relatedVideos.map((video, index) => (
                                <Link
                                    key={video._id}
                                    to={`/video/${video._id}`}
                                    className="flex-shrink-0 w-[200px] group animate-fadeIn"
                                    style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}
                                >
                                    <div className="relative">
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="w-full h-[112px] object-cover rounded-xl bg-gray-800"
                                        />
                                        {video.duration && (
                                            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                                                {formatDuration(video.duration)}
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-white text-xs font-medium line-clamp-2 mt-2 group-hover:text-primary-400 transition-colors">{video.title}</h4>
                                    <p className="text-gray-400 text-[11px] mt-0.5">{video.owner?.fullName}</p>
                                    <p className="text-gray-500 text-[11px]">{formatViews(video.views)} views</p>
                                </Link>
                            ))}
                        </div>

                        {/* Desktop: vertical list */}
                        <div className="hidden sm:block space-y-2">
                            {relatedVideos.map((video, index) => (
                                <Link
                                    key={video._id}
                                    to={`/video/${video._id}`}
                                    className="flex gap-3 group hover:bg-gray-800/50 p-2 rounded-xl transition-all duration-200 animate-fadeIn"
                                    style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}
                                >
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="w-40 h-[90px] object-cover rounded-lg bg-gray-800"
                                        />
                                        {video.duration && (
                                            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                                                {formatDuration(video.duration)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white text-sm font-medium line-clamp-2 group-hover:text-primary-400 transition-colors">
                                            {video.title}
                                        </h4>
                                        <p className="text-gray-400 text-xs mt-1">
                                            {video.owner?.fullName}
                                        </p>
                                        <p className="text-gray-500 text-xs">
                                            {formatViews(video.views)} views • {formatDistanceToNow(video.createdAt)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
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
