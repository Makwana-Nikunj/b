import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import videoService from '../services/videoService'
import { Input, Textarea, Button } from '../components/ui'
import { HiPhotograph, HiArrowLeft } from 'react-icons/hi'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function EditVideoPage() {
    const { videoId } = useParams()
    const navigate = useNavigate()

    const [video, setVideo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [thumbnailPreview, setThumbnailPreview] = useState(null)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm()

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const response = await videoService.getVideoById(videoId)
                const videoData = response?.data || response
                setVideo(videoData)
                setThumbnailPreview(videoData.thumbnail)
                reset({
                    title: videoData.title,
                    description: videoData.description,
                })
            } catch (error) {
                toast.error('Failed to load video')
                navigate('/dashboard')
            } finally {
                setLoading(false)
            }
        }

        fetchVideo()
    }, [videoId, reset, navigate])

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setThumbnailPreview(URL.createObjectURL(file))
        }
    }

    const onSubmit = async (data) => {
        setUpdating(true)
        try {
            const formData = new FormData()
            formData.append('title', data.title)
            formData.append('description', data.description)

            if (data.thumbnail?.[0]) {
                formData.append('thumbnail', data.thumbnail[0])
            }

            const response = await videoService.updateVideo(videoId, formData)
            toast.success('Video updated successfully!')
            navigate('/dashboard')
        } catch (error) {
            // Error handled by interceptor
        } finally {
            setUpdating(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (!video) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400">Video not found</p>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
                <HiArrowLeft className="w-5 h-5" />
                Back to Dashboard
            </button>

            <h1 className="text-2xl font-bold text-white mb-6">Edit Video</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Current video preview */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Current Video
                    </label>
                    <video
                        src={video.videoFile}
                        className="w-full aspect-video rounded-lg bg-gray-800"
                        controls
                    />
                </div>

                {/* Thumbnail */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Thumbnail
                    </label>
                    <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 relative">
                        {thumbnailPreview ? (
                            <div className="space-y-4">
                                <img
                                    src={thumbnailPreview}
                                    alt="Thumbnail preview"
                                    className="w-full aspect-video object-cover rounded-lg"
                                />
                                <p className="text-gray-400 text-sm flex items-center gap-2">
                                    <HiPhotograph className="w-5 h-5" />
                                    Click to change thumbnail
                                </p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <HiPhotograph className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                <p className="text-gray-400 mb-2">
                                    Upload a new thumbnail
                                </p>
                                <p className="text-gray-500 text-sm">
                                    PNG, JPG, or GIF (recommended 1280x720)
                                </p>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            {...register('thumbnail', {
                                onChange: handleThumbnailChange,
                            })}
                        />
                    </div>
                </div>

                {/* Title */}
                <div>
                    <Input
                        label="Title"
                        placeholder="Enter video title"
                        error={errors.title?.message}
                        {...register('title', {
                            required: 'Title is required',
                            maxLength: {
                                value: 100,
                                message: 'Title must be under 100 characters',
                            },
                        })}
                    />
                </div>

                {/* Description */}
                <div>
                    <Textarea
                        label="Description"
                        placeholder="Tell viewers about your video"
                        rows={5}
                        error={errors.description?.message}
                        {...register('description', {
                            required: 'Description is required',
                            maxLength: {
                                value: 500,
                                message: 'Description must be under 500 characters',
                            },
                        })}
                    />
                </div>

                {/* Submit buttons */}
                <div className="flex gap-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate('/dashboard')}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={updating}
                        className="flex-1"
                    >
                        {updating ? (
                            <>
                                <LoadingSpinner size="sm" />
                                <span className="ml-2">Updating...</span>
                            </>
                        ) : (
                            'Update Video'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default EditVideoPage
