import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchSubscribedChannels } from '../store/slices/subscriptionSlice'
import { Avatar, EmptyState } from '../components/ui'
import { SubscriptionsSkeleton } from '../components/ui/Skeleton'
import { HiUserGroup } from 'react-icons/hi'
import { formatSubscribers } from '../utils/formatNumber'

function SubscriptionsPage() {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { subscribedChannels: rawSubscribedChannels, isLoading } = useSelector((state) => state.subscriptions)

    // Ensure subscribedChannels is always an array
    const subscribedChannels = Array.isArray(rawSubscribedChannels) ? rawSubscribedChannels : []

    useEffect(() => {
        if (user?._id) {
            dispatch(fetchSubscribedChannels(user._id))
        }
    }, [user, dispatch])

    if (isLoading) {
        return (
            <div className="animate-fadeIn">
                <div className="h-8 skeleton-shimmer rounded-lg w-36 mb-6" />
                <SubscriptionsSkeleton count={8} />
            </div>
        )
    }

    return (
        <div className="animate-fadeIn">
            <h1 className="text-2xl font-bold text-white mb-6">Subscriptions</h1>

            {subscribedChannels.length === 0 ? (
                <EmptyState
                    icon={HiUserGroup}
                    title="No subscriptions yet"
                    description="Subscribe to channels to see them here"
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {subscribedChannels.map((subscription, index) => {
                        const channel = subscription.channel || subscription
                        if (!channel?.username) return null
                        return (
                            <Link
                                key={channel._id}
                                to={`/channel/${channel.username}`}
                                className="flex items-center gap-4 p-4 bg-gray-800/40 rounded-xl hover:bg-gray-800/80 transition-all duration-200 card-hover border border-gray-800/50 animate-fadeIn"
                                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                            >
                                <Avatar src={channel.avatar} alt={channel.fullName} size="lg" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-medium truncate">{channel.fullName}</h3>
                                    <p className="text-gray-400 text-sm truncate">@{channel.username}</p>
                                    <p className="text-gray-500 text-sm">
                                        {formatSubscribers(channel.subscriberCount || 0)}
                                    </p>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default SubscriptionsPage
