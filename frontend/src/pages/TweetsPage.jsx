import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { tweetService, likeService } from '../services'
import { Avatar, Button, Textarea, EmptyState } from '../components/ui'
import { TweetsSkeleton } from '../components/ui/Skeleton'
import { HiAnnotation, HiThumbUp, HiTrash } from 'react-icons/hi'
import { formatDistanceToNow } from '../utils/formatDate'
import toast from 'react-hot-toast'

function TweetsPage() {
    const { user } = useSelector((state) => state.auth)
    const [tweets, setTweets] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: { content: '' },
    })

    useEffect(() => {
        if (user?._id) {
            fetchTweets()
        }
    }, [user])

    const fetchTweets = async () => {
        try {
            const response = await tweetService.getUserTweets(user._id)
            // API returns { data: { tweets: [], pagination: {} } }
            const tweetsData = response?.data?.tweets || response?.data || []
            setTweets(Array.isArray(tweetsData) ? tweetsData : [])
        } catch (error) {
            console.error('Failed to load tweets')
            setTweets([])
        } finally {
            setIsLoading(false)
        }
    }

    const onCreateTweet = async (data) => {
        try {
            const response = await tweetService.createTweet(data)
            const newTweet = response?.data
            if (newTweet) {
                setTweets([newTweet, ...tweets])
            }
            reset()
            toast.success('Tweet posted!')
        } catch (error) {
            // Error handled by interceptor
        }
    }

    const handleDelete = async (tweetId) => {
        try {
            await tweetService.deleteTweet(tweetId)
            setTweets(tweets.filter((t) => t._id !== tweetId))
            toast.success('Tweet deleted')
        } catch (error) {
            // Error handled by interceptor
        }
    }

    const handleLike = async (tweetId) => {
        try {
            await likeService.toggleTweetLike(tweetId)
            setTweets(
                tweets.map((t) =>
                    t._id === tweetId
                        ? { ...t, isLiked: !t.isLiked, likesCount: t.isLiked ? t.likesCount - 1 : t.likesCount + 1 }
                        : t
                )
            )
        } catch (error) {
            // Error handled by interceptor
        }
    }

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="h-8 bg-gray-700 rounded w-24 mb-6 animate-pulse" />
                <TweetsSkeleton count={5} />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6">Tweets</h1>

            {/* Create tweet form */}
            <form onSubmit={handleSubmit(onCreateTweet)} className="mb-8">
                <div className="flex gap-3">
                    <Avatar src={user?.avatar} alt={user?.fullName} size="md" />
                    <div className="flex-1">
                        <Textarea
                            placeholder="What's happening?"
                            error={errors.content?.message}
                            rows={3}
                            {...register('content', {
                                required: 'Tweet content is required',
                                maxLength: {
                                    value: 280,
                                    message: 'Tweet must be less than 280 characters',
                                },
                            })}
                        />
                        <div className="flex justify-end mt-2">
                            <Button type="submit">Tweet</Button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Tweets list */}
            {tweets.length === 0 ? (
                <EmptyState
                    icon={HiAnnotation}
                    title="No tweets yet"
                    description="Share your thoughts with the world"
                />
            ) : (
                <div className="space-y-4">
                    {tweets.map((tweet) => (
                        <div key={tweet._id} className="bg-gray-800/50 rounded-xl p-4">
                            <div className="flex gap-3">
                                <Avatar
                                    src={tweet.owner?.avatar || user?.avatar}
                                    alt={tweet.owner?.fullName || user?.fullName}
                                    size="md"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-white font-medium">
                                                {tweet.owner?.fullName || user?.fullName}
                                            </span>
                                            <span className="text-gray-500 text-sm ml-2">
                                                @{tweet.owner?.username || user?.username}
                                            </span>
                                            <span className="text-gray-600 text-sm mx-2">•</span>
                                            <span className="text-gray-500 text-sm">
                                                {formatDistanceToNow(tweet.createdAt)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(tweet._id)}
                                            className="text-gray-500 hover:text-red-500 transition-colors"
                                        >
                                            <HiTrash className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <p className="text-white mt-2">{tweet.content}</p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <button
                                            onClick={() => handleLike(tweet._id)}
                                            className={`flex items-center gap-1 transition-colors ${tweet.isLiked ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
                                                }`}
                                        >
                                            <HiThumbUp className="w-5 h-5" />
                                            <span>{tweet.likesCount || 0}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default TweetsPage
