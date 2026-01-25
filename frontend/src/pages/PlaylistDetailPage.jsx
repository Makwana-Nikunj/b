import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import {
    fetchPlaylistById,
    removeVideoFromPlaylist,
    updatePlaylist,
    clearCurrentPlaylist,
} from '../store/slices/playlistSlice'
import { VideoListItem } from '../components/video'
import { Button, Modal, Input, Textarea, LoadingSpinner, EmptyState } from '../components/ui'
import { HiArrowLeft, HiPencil, HiFilm } from 'react-icons/hi'
import toast from 'react-hot-toast'

function PlaylistDetailPage() {
    const { playlistId } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { currentPlaylist, isLoading } = useSelector((state) => state.playlists)
    const { user } = useSelector((state) => state.auth)
    const [showEditModal, setShowEditModal] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm()

    useEffect(() => {
        if (playlistId) {
            dispatch(fetchPlaylistById(playlistId))
        }
        return () => {
            dispatch(clearCurrentPlaylist())
        }
    }, [playlistId, dispatch])

    // Reset form when playlist loads or modal opens
    useEffect(() => {
        if (currentPlaylist && showEditModal) {
            reset({
                name: currentPlaylist.name,
                description: currentPlaylist.description,
            })
        }
    }, [currentPlaylist, showEditModal, reset])

    const handleRemoveVideo = async (videoId) => {
        try {
            await dispatch(removeVideoFromPlaylist({ videoId, playlistId })).unwrap()
            toast.success('Video removed from playlist')
        } catch (error) {
            // Error handled by interceptor
        }
    }

    const onEditPlaylist = async (data) => {
        try {
            await dispatch(updatePlaylist({ playlistId, data })).unwrap()
            toast.success('Playlist updated!')
            setShowEditModal(false)
        } catch (error) {
            // Error handled by interceptor
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (!currentPlaylist) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl text-white">Playlist not found</h2>
            </div>
        )
    }

    const isOwner = user?._id === currentPlaylist.owner?._id

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                    <HiArrowLeft className="w-6 h-6 text-white" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-white">{currentPlaylist.name}</h1>
                    <p className="text-gray-400">{currentPlaylist.description}</p>
                    <p className="text-gray-500 text-sm mt-1">
                        {currentPlaylist.videos?.length || 0} videos
                    </p>
                </div>
                {isOwner && (
                    <Button variant="secondary" onClick={() => setShowEditModal(true)}>
                        <HiPencil className="w-5 h-5" />
                        Edit
                    </Button>
                )}
            </div>

            {/* Videos list */}
            {!currentPlaylist.videos || currentPlaylist.videos.length === 0 ? (
                <EmptyState
                    icon={HiFilm}
                    title="No videos in this playlist"
                    description="Add videos to this playlist to see them here"
                />
            ) : (
                <div className="space-y-4">
                    {currentPlaylist.videos.map((video, index) => (
                        <div key={video._id} className="flex items-center gap-4">
                            <span className="text-gray-500 w-8 text-right">{index + 1}</span>
                            <div className="flex-1">
                                <VideoListItem
                                    video={video}
                                    showRemoveButton={isOwner}
                                    onRemove={handleRemoveVideo}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Playlist Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Playlist"
            >
                <form onSubmit={handleSubmit(onEditPlaylist)} className="space-y-4">
                    <Input
                        label="Name"
                        placeholder="Playlist name"
                        error={errors.name?.message}
                        {...register('name', {
                            required: 'Playlist name is required',
                            maxLength: {
                                value: 100,
                                message: 'Name must be under 100 characters',
                            },
                        })}
                    />
                    <Textarea
                        label="Description"
                        placeholder="Playlist description"
                        rows={3}
                        error={errors.description?.message}
                        {...register('description', {
                            required: 'Description is required',
                            maxLength: {
                                value: 500,
                                message: 'Description must be under 500 characters',
                            },
                        })}
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowEditModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default PlaylistDetailPage
