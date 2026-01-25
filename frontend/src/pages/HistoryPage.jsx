import { useEffect, useState } from 'react'
import { authService } from '../services'
import { VideoListItem } from '../components/video'
import { LoadingSpinner, EmptyState } from '../components/ui'
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
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">Watch History</h1>

            {history.length === 0 ? (
                <EmptyState
                    icon={HiClock}
                    title="No watch history"
                    description="Videos you watch will appear here"
                />
            ) : (
                <div className="space-y-4">
                    {history.map((video) => (
                        <VideoListItem key={video._id} video={video} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default HistoryPage
