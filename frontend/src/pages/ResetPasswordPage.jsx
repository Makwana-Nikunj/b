import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Input, Button } from '../components/ui'
import toast from 'react-hot-toast'
import axios from '../api/axiosInstance'

function ResetPasswordPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const [isLoading, setIsLoading] = useState(false)

    const emailFromState = location.state?.email || ''

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: emailFromState,
            otp: '',
            newPassword: '',
            confirmPassword: '',
        },
    })

    const newPassword = watch('newPassword')

    const onSubmit = async (data) => {
        setIsLoading(true)
        try {
            await axios.post('/auth/reset-password', {
                email: data.email,
                otp: data.otp,
                newPassword: data.newPassword
            })
            toast.success('Password reset successfully!')
            navigate('/login')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-[#181818] rounded-xl p-6 border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Reset Password</h2>
            <p className="text-gray-400 text-center mb-6">Enter the OTP sent to your email</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        OTP Code
                    </label>
                    <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        className="w-full bg-gray-800 text-white text-center text-2xl tracking-widest py-3 px-4 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                        {...register('otp', {
                            required: 'OTP is required',
                            pattern: {
                                value: /^\d{6}$/,
                                message: 'OTP must be 6 digits',
                            },
                        })}
                    />
                    {errors.otp && (
                        <p className="mt-1 text-sm text-red-500">{errors.otp.message}</p>
                    )}
                </div>

                <Input
                    label="New Password"
                    type="password"
                    placeholder="Enter new password"
                    error={errors.newPassword?.message}
                    {...register('newPassword', {
                        required: 'New password is required',
                        minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters',
                        },
                    })}
                />

                <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm new password"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) =>
                            value === newPassword || 'Passwords do not match',
                    })}
                />

                <Button
                    type="submit"
                    loading={isLoading}
                    className="w-full"
                >
                    Reset Password
                </Button>
            </form>

            <p className="text-center text-gray-400 mt-6">
                <Link to="/forgot-password" className="text-blue-500 hover:underline">
                    Didn't receive OTP? Try again
                </Link>
            </p>
        </div>
    )
}

export default ResetPasswordPage
