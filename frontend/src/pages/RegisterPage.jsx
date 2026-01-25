import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { register as registerUser } from '../store/slices/authSlice'
import { Input, Button } from '../components/ui'
import toast from 'react-hot-toast'

function RegisterPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { isLoading } = useSelector((state) => state.auth)

    const [avatarPreview, setAvatarPreview] = useState(null)
    const [coverPreview, setCoverPreview] = useState(null)

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            fullName: '',
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    })

    const password = watch('password')

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
        formData.append('email', data.email)
        formData.append('password', data.password)

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
            // Error is handled by the axios interceptor
        }
    }

    return (
        <div className="bg-[#181818] rounded-xl p-6 border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Create account</h2>

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
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    error={errors.email?.message}
                    {...register('email', {
                        required: 'Email is required',
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
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
                        {...register('avatar', {
                            required: 'Avatar is required',
                            onChange: handleAvatarChange,
                        })}
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
                        {...register('coverImage', {
                            onChange: handleCoverChange,
                        })}
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
