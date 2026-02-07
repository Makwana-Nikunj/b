import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { login } from '../store/slices/authSlice'
import { Input, Button } from '../components/ui'
import GoogleLoginButton from '../components/ui/GoogleLoginButton'
import toast from 'react-hot-toast'

function LoginPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { isLoading } = useSelector((state) => state.auth)

    const from = location.state?.from?.pathname || '/'

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onSubmit = async (data) => {
        try {
            const result = await dispatch(login(data)).unwrap()
            if (result) {
                toast.success('Welcome back!')
                navigate(from, { replace: true })
            }
        } catch (error) {
            // Error is handled by the axios interceptor
        }
    }

    return (
        <div className="bg-[#181818] rounded-xl p-6 border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign in</h2>

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

                <Button
                    type="submit"
                    loading={isLoading}
                    className="w-full"
                >
                    Sign in
                </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-700" />
                <span className="text-gray-500 text-sm">or</span>
                <div className="flex-1 h-px bg-gray-700" />
            </div>

            {/* Google Login */}
            <GoogleLoginButton />

            <p className="text-center text-gray-400 mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-500 hover:underline">
                    Sign up
                </Link>
            </p>
        </div>
    )
}

export default LoginPage
