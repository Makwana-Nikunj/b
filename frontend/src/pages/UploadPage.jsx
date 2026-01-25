import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { publishVideo } from '../store/slices/videoSlice'
import { Input, Textarea, Button } from '../components/ui'
import { HiUpload, HiFilm, HiPhotograph } from 'react-icons/hi'
import toast from 'react-hot-toast'

function UploadPage() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { isLoading } = useSelector((state) => state.videos)

    const [videoPreview, setVideoPreview] = useState(null)
    const [thumbnailPreview, setThumbnailPreview] = useState(null)
    const [uploadProgress, setUploadProgress] = useState(0)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: '',
            description: '',
        },
    })

    const handleVideoChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setVideoPreview(URL.createObjectURL(file))
        }
    }

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setThumbnailPreview(URL.createObjectURL(file))
        }
    }

    const onSubmit = async (data) => {
        const formData = new FormData()
        formData.append('title', data.title)
        formData.append('description', data.description)

        if (data.videoFile?.[0]) {
            formData.append('videoFile', data.videoFile[0])
        }
        if (data.thumbnailImage?.[0]) {
            formData.append('thumbnailImage', data.thumbnailImage[0])
        }

        try {
            const result = await dispatch(publishVideo(formData)).unwrap()
            toast.success('Video uploaded successfully!')
            if (result?._id) {
                navigate(`/video/${result._id}`)
            } else {
                navigate('/')
            }
        } catch (error) {
            // Error handled by interceptor
        }
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6">Upload video</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Video upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Video file
                    </label>
                    <div className="border-2 border-dashed border-gray-700 rounded-xl p-6">
                        {videoPreview ? (
                            <div className="space-y-4">
                                <video
                                    src={videoPreview}
                                    className="w-full aspect-video rounded-lg"
                                    controls
                                />
                                <p className="text-green-500 text-sm flex items-center gap-2">
                                    <HiFilm className="w-5 h-5" />
                                    Video selected
                                </p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <HiUpload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                <p className="text-gray-400 mb-2">
                                    Drag and drop video file or click to browse
                                </p>
                                <p className="text-gray-500 text-sm">
                                    MP4, WebM, or OGG (max 100MB)
                                </p>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="video/*"
                            className={`${videoPreview ? 'hidden' : 'absolute inset-0 opacity-0 cursor-pointer'}`}
                            style={{ position: videoPreview ? 'static' : 'absolute' }}
                            {...register('videoFile', {
                                required: 'Video file is required',
                                onChange: handleVideoChange,
                            })}
                        />
                    </div>
                    {errors.videoFile && (
                        <p className="mt-1 text-sm text-red-500">{errors.videoFile.message}</p>
                    )}
                </div>

                {/* Thumbnail upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Thumbnail
                    </label>
                    <div className="border-2 border-dashed border-gray-700 rounded-xl p-6">
                        {thumbnailPreview ? (
                            <div className="space-y-4">
                                <img
                                    src={thumbnailPreview}
                                    alt="Thumbnail preview"
                                    className="w-full aspect-video object-cover rounded-lg"
                                />
                                <p className="text-green-500 text-sm flex items-center gap-2">
                                    <HiPhotograph className="w-5 h-5" />
                                    Thumbnail selected
                                </p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <HiPhotograph className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                <p className="text-gray-400 mb-2">
                                    Upload a thumbnail image
                                </p>
                                <p className="text-gray-500 text-sm">
                                    PNG, JPG, or GIF (recommended 1280x720)
                                </p>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className={`${thumbnailPreview ? 'hidden' : 'absolute inset-0 opacity-0 cursor-pointer'}`}
                            style={{ position: thumbnailPreview ? 'static' : 'absolute' }}
                            {...register('thumbnailImage', {
                                required: 'Thumbnail is required',
                                onChange: handleThumbnailChange,
                            })}
                        />
                    </div>
                    {errors.thumbnailImage && (
                        <p className="mt-1 text-sm text-red-500">{errors.thumbnailImage.message}</p>
                    )}
                </div>

                {/* Title */}
                <Input
                    label="Title"
                    placeholder="Enter video title"
                    error={errors.title?.message}
                    {...register('title', {
                        required: 'Title is required',
                        maxLength: {
                            value: 100,
                            message: 'Title must be less than 100 characters',
                        },
                    })}
                />

                {/* Description */}
                <Textarea
                    label="Description"
                    placeholder="Describe your video"
                    rows={5}
                    error={errors.description?.message}
                    {...register('description', {
                        required: 'Description is required',
                    })}
                />

                {/* Upload progress */}
                {isLoading && uploadProgress > 0 && (
                    <div className="bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-2 bg-blue-600 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                )}

                {/* Submit */}
                <div className="flex gap-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" loading={isLoading} className="flex-1">
                        Upload
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default UploadPage
