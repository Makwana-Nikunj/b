import { useEffect, useState } from 'react'
import { authService } from '../services'
import { VideoListItem } from '../components/video'
import { EmptyState } from '../components/ui'
import { HistorySkeleton } from '../components/ui/Skeleton'
import { HiClock } from 'react-icons/hi'

function HistoryPage() {
    const [history, setHistory] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            const response = await authService.getWatchHistory()
            const historyData = response?.data || []
            setHistory(Array.isArray(historyData) ? historyData : [])
        } catch (error) {
            console.error('Failed to load watch history')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <HistorySkeleton count={6} />
    }

    return (
        <div className="animate-fadeIn">
            <h1 className="text-2xl font-bold text-white mb-6">Watch History</h1>

            {history.length === 0 ? (
                <EmptyState
                    icon={HiClock}
                    title="No watch history"
                    description="Videos you watch will appear here"
                />
            ) : (
                <div className="space-y-3">
                    {history.map((video, index) => (
                        <div
                            key={video._id}
                            className="animate-fadeIn"
                            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                        >
                            <VideoListItem video={video} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default HistoryPage
