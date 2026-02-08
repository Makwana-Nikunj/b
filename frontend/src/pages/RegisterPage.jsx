import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { register as registerUser } from '../store/slices/authSlice'
import { Input, Button } from '../components/ui'
import toast from 'react-hot-toast'
import axios from '../api/axiosInstance'

function RegisterPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { token } = useParams()
    const { isLoading } = useSelector((state) => state.auth)

    const [verifiedEmail, setVerifiedEmail] = useState(null)
    const [verifying, setVerifying] = useState(true)
    const [verificationError, setVerificationError] = useState(null)

    const [avatarPreview, setAvatarPreview] = useState(null)
    const [coverPreview, setCoverPreview] = useState(null)

    // Verify token on mount
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setVerificationError('No verification token provided')
                setVerifying(false)
                return
            }

            try {
                const response = await axios.get(`/auth/verify-email/${token}`)
                setVerifiedEmail(response.data.email)
            } catch (error) {
                setVerificationError(error.response?.data?.message || 'Invalid or expired verification link')
            } finally {
                setVerifying(false)
            }
        }

        verifyToken()
    }, [token])

    useEffect(() => {
        return () => {
            if (avatarPreview) URL.revokeObjectURL(avatarPreview)
            if (coverPreview) URL.revokeObjectURL(coverPreview)
        }
    }, [avatarPreview, coverPreview])

    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: { errors },
    } = useForm({
        defaultValues: {
            fullName: '',
            username: '',
            password: '',
            confirmPassword: '',
        },
    })

    const password = watch('password')

    const { onChange: onAvatarChange, ...avatarProps } = register('avatar', {
        required: 'Avatar is required',
    })

    const { onChange: onCoverChange, ...coverProps } = register('coverImage')

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setAvatarPreview(URL.createObjectURL(file))
        }
    }

    const handleCoverChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setCoverPreview(URL.createObjectURL(file))
        }
    }

    const onSubmit = async (data) => {
        const formData = new FormData()
        formData.append('fullName', data.fullName)
        formData.append('username', data.username)
        formData.append('password', data.password)
        formData.append('token', token)

        if (data.avatar?.[0]) {
            formData.append('avatar', data.avatar[0])
        }
        if (data.coverImage?.[0]) {
            formData.append('coverImage', data.coverImage[0])
        }

        try {
            await dispatch(registerUser(formData)).unwrap()
            toast.success('Account created! Please sign in.')
            navigate('/login')
        } catch (error) {
            if (error?.errors && Array.isArray(error.errors)) {
                error.errors.forEach((err) => {
                    setError(err.field, {
                        type: 'server',
                        message: err.message,
                    })
                })
            }
        }
    }

    // Loading state
    if (verifying) {
        return (
            <div className="bg-[#181818] rounded-xl p-8 border border-gray-800 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-400 mt-4">Verifying your email...</p>
            </div>
        )
    }

    // Error state
    if (verificationError) {
        return (
            <div className="bg-[#181818] rounded-xl p-8 border border-gray-800 text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
                <p className="text-gray-400 mb-6">{verificationError}</p>
                <Link
                    to="/initiate-register"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                    Try Again
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-[#181818] rounded-xl p-6 border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Complete your account</h2>
            <p className="text-gray-400 text-center mb-6">
                Email verified: <span className="text-green-500 font-medium">{verifiedEmail}</span>
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Cover Image Preview */}
                {coverPreview && (
                    <div className="relative h-32 rounded-lg overflow-hidden">
                        <img
                            src={coverPreview}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Avatar Preview */}
                <div className="flex justify-center">
                    {avatarPreview ? (
                        <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            className="w-20 h-20 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">Avatar</span>
                        </div>
                    )}
                </div>

                <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    error={errors.fullName?.message}
                    {...register('fullName', {
                        required: 'Full name is required',
                    })}
                />

                <Input
                    label="Username"
                    placeholder="Enter your username"
                    error={errors.username?.message}
                    {...register('username', {
                        required: 'Username is required',
                        pattern: {
                            value: /^[a-z0-9_]+$/,
                            message: 'Username can only contain lowercase letters, numbers, and underscores',
                        },
                    })}
                />

                <Input
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    error={errors.password?.message}
                    {...register('password', {
                        required: 'Password is required',
                        minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters',
                        },
                    })}
                />

                <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm your password"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) =>
                            value === password || 'Passwords do not match',
                    })}
                />

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Avatar (required)
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                        {...avatarProps}
                        onChange={(e) => {
                            onAvatarChange(e)
                            handleAvatarChange(e)
                        }}
                    />
                    {errors.avatar && (
                        <p className="mt-1 text-sm text-red-500">{errors.avatar.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Cover Image (optional)
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                        {...coverProps}
                        onChange={(e) => {
                            onCoverChange(e)
                            handleCoverChange(e)
                        }}
                    />
                </div>

                <Button
                    type="submit"
                    loading={isLoading}
                    className="w-full"
                >
                    Create account
                </Button>
            </form>

            <p className="text-center text-gray-400 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-500 hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    )
}

export default RegisterPage
