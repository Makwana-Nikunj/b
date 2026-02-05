import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchUserPlaylists, createPlaylist, deletePlaylist } from '../store/slices/playlistSlice'
import { Button, Modal, Input, Textarea, EmptyState } from '../components/ui'
import { PlaylistGridSkeleton } from '../components/ui/Skeleton'
import { HiPlus, HiCollection, HiTrash } from 'react-icons/hi'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

function PlaylistPage() {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { playlists, isLoading } = useSelector((state) => state.playlists)
    const [showCreateModal, setShowCreateModal] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: '',
            description: '',
        },
    })

    useEffect(() => {
        if (user?._id) {
            dispatch(fetchUserPlaylists(user._id))
        }
    }, [user, dispatch])

    const onCreatePlaylist = async (data) => {
        try {
            await dispatch(createPlaylist(data)).unwrap()
            toast.success('Playlist created!')
            setShowCreateModal(false)
            reset()
        } catch (error) {
            // Error handled by interceptor
        }
    }

    const handleDelete = async (playlistId) => {
        if (!window.confirm('Are you sure you want to delete this playlist?')) return

        try {
            await dispatch(deletePlaylist(playlistId)).unwrap()
            toast.success('Playlist deleted')
        } catch (error) {
            // Error handled by interceptor
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Your Playlists</h1>
                <Button onClick={() => setShowCreateModal(true)}>
                    <HiPlus className="w-5 h-5" />
                    New Playlist
                </Button>
            </div>

            {isLoading ? (
                <PlaylistGridSkeleton count={6} />
            ) : playlists.length === 0 ? (
                <EmptyState
                    icon={HiCollection}
                    title="No playlists yet"
                    description="Create your first playlist to organize your favorite videos"
                    action={
                        <Button onClick={() => setShowCreateModal(true)}>
                            <HiPlus className="w-5 h-5" />
                            Create Playlist
                        </Button>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {playlists.map((playlist) => (
                        <div
                            key={playlist._id}
                            className="bg-gray-800/50 rounded-xl overflow-hidden group"
                        >
                            <Link to={`/playlist/${playlist._id}`}>
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
                            </Link>

                            <div className="p-3">
                                <div className="flex items-start justify-between">
                                    <Link to={`/playlist/${playlist._id}`}>
                                        <h3 className="text-white font-medium line-clamp-1 hover:text-blue-400 transition-colors">
                                            {playlist.name}
                                        </h3>
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(playlist._id)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
                                    >
                                        <HiTrash className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-gray-400 text-sm line-clamp-2 mt-1">
                                    {playlist.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Playlist Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false)
                    reset()
                }}
                title="Create Playlist"
            >
                <form onSubmit={handleSubmit(onCreatePlaylist)} className="space-y-4">
                    <Input
                        label="Name"
                        placeholder="Enter playlist name"
                        error={errors.name?.message}
                        {...register('name', {
                            required: 'Name is required',
                        })}
                    />
                    <Textarea
                        label="Description"
                        placeholder="Describe your playlist"
                        error={errors.description?.message}
                        {...register('description', {
                            required: 'Description is required',
                        })}
                    />
                    <div className="flex gap-3 justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setShowCreateModal(false)
                                reset()
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" loading={isLoading}>
                            Create
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default PlaylistPage
