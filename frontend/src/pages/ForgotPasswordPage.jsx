import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Input, Button } from '../components/ui'
import toast from 'react-hot-toast'
import axios from '../api/axiosInstance'

function ForgotPasswordPage() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [otpSent, setOtpSent] = useState(false)
    const [email, setEmail] = useState('')

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: '',
        },
    })

    const onSubmit = async (data) => {
        setIsLoading(true)
        try {
            await axios.post('/auth/forgot-password', { email: data.email })
            setEmail(data.email)
            setOtpSent(true)
            toast.success('OTP sent to your email!')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP')
        } finally {
            setIsLoading(false)
        }
    }

    if (otpSent) {
        return (
            <div className="bg-[#181818] rounded-xl p-8 border border-gray-800 text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Check your inbox</h2>
                <p className="text-gray-400 mb-6">
                    We've sent a 6-digit OTP to <span className="text-white font-medium">{email}</span>
                </p>
                <Button
                    onClick={() => navigate('/reset-password', { state: { email } })}
                    className="w-full"
                >
                    Enter OTP
                </Button>
            </div>
        )
    }

    return (
        <div className="bg-[#181818] rounded-xl p-6 border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Forgot Password</h2>
            <p className="text-gray-400 text-center mb-6">Enter your email to receive a reset OTP</p>

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

                <Button
                    type="submit"
                    loading={isLoading}
                    className="w-full"
                >
                    Send OTP
                </Button>
            </form>

            <p className="text-center text-gray-400 mt-6">
                Remember your password?{' '}
                <Link to="/login" className="text-blue-500 hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    )
}

export default ForgotPasswordPage
