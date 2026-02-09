import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchVideos, clearVideos } from '../store/slices/videoSlice'
import { VideoGrid } from '../components/video'
import { EmptyState } from '../components/ui'
import { HiSearch } from 'react-icons/hi'

function SearchPage() {
    const [searchParams] = useSearchParams()
    const query = searchParams.get('q') || ''

    const dispatch = useDispatch()
    const { videos, isLoading } = useSelector((state) => state.videos)

    useEffect(() => {
        if (query) {
            dispatch(fetchVideos({ query, page: 1, limit: 20 }))
        } else {
            dispatch(clearVideos())
        }

        return () => {
            dispatch(clearVideos())
        }
    }, [query, dispatch])

    if (!query) {
        return (
            <EmptyState
                icon={HiSearch}
                title="Search for videos"
                description="Enter a search term to find videos"
            />
        )
    }

    return (
        <div className="animate-fadeIn">
            <h1 className="text-xl text-white mb-6">
                Search results for: <span className="font-semibold text-primary-400">"{query}"</span>
            </h1>

            <VideoGrid
                videos={videos}
                isLoading={isLoading}
                emptyMessage={`No results found for "${query}"`}
            />
        </div>
    )
}

export default SearchPage
