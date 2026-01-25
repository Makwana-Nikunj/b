import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
    updateAccount,
    updateAvatar,
    updateCoverImage,
    changePassword,
    deleteAccount,
} from '../store/slices/authSlice'
import { Input, Button, Avatar, Modal } from '../components/ui'
import { HiCamera, HiExclamation } from 'react-icons/hi'
import toast from 'react-hot-toast'

function SettingsPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user, isLoading } = useSelector((state) => state.auth)
    const [activeTab, setActiveTab] = useState('profile')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState('')

    // Profile form
    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        formState: { errors: profileErrors },
    } = useForm({
        defaultValues: {
            fullName: user?.fullName || '',
            email: user?.email || '',
        },
    })

    // Password form
    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        reset: resetPassword,
        watch,
        formState: { errors: passwordErrors },
    } = useForm({
        defaultValues: {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    })

    const newPassword = watch('newPassword')

    const onUpdateProfile = async (data) => {
        try {
            await dispatch(updateAccount(data)).unwrap()
            toast.success('Profile updated!')
        } catch (error) {
            // Error handled by interceptor
        }
    }

    const onChangePassword = async (data) => {
        try {
            await dispatch(
                changePassword({
                    oldPassword: data.oldPassword,
                    newPassword: data.newPassword,
                })
            ).unwrap()
            toast.success('Password changed!')
            resetPassword()
        } catch (error) {
            // Error handled by interceptor
        }
    }

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append('avatar', file)

        try {
            await dispatch(updateAvatar(formData)).unwrap()
            toast.success('Avatar updated!')
        } catch (error) {
            // Error handled by interceptor
        }
    }

    const handleCoverUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append('coverImage', file)

        try {
            await dispatch(updateCoverImage(formData)).unwrap()
            toast.success('Cover image updated!')
        } catch (error) {
            // Error handled by interceptor
        }
    }

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== user?.username) {
            toast.error('Please type your username correctly')
            return
        }

        try {
            await dispatch(deleteAccount()).unwrap()
            toast.success('Account deleted successfully')
            navigate('/')
        } catch (error) {
            // Error handled by interceptor
        }
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-800 mb-6">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`pb-3 px-2 border-b-2 transition-colors ${activeTab === 'profile'
                        ? 'border-white text-white'
                        : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                >
                    Profile
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`pb-3 px-2 border-b-2 transition-colors ${activeTab === 'security'
                        ? 'border-white text-white'
                        : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                >
                    Security
                </button>
                <button
                    onClick={() => setActiveTab('danger')}
                    className={`pb-3 px-2 border-b-2 transition-colors ${activeTab === 'danger'
                        ? 'border-red-500 text-red-500'
                        : 'border-transparent text-gray-400 hover:text-red-400'
                        }`}
                >
                    Danger Zone
                </button>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="space-y-8">
                    {/* Cover Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Cover Image
                        </label>
                        <div className="relative h-40 bg-gray-800 rounded-xl overflow-hidden group">
                            {user?.coverImage && (
                                <img
                                    src={user.coverImage}
                                    alt="Cover"
                                    className="w-full h-full object-cover"
                                />
                            )}
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <HiCamera className="w-8 h-8 text-white" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleCoverUpload}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Avatar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Avatar
                        </label>
                        <div className="relative w-24 h-24 group">
                            <Avatar src={user?.avatar} alt={user?.fullName} size="2xl" />
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <HiCamera className="w-6 h-6 text-white" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
                        <Input
                            label="Full Name"
                            error={profileErrors.fullName?.message}
                            {...registerProfile('fullName', {
                                required: 'Full name is required',
                            })}
                        />
                        <Input
                            label="Email"
                            type="email"
                            error={profileErrors.email?.message}
                            {...registerProfile('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address',
                                },
                            })}
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Username
                            </label>
                            <input
                                type="text"
                                value={user?.username || ''}
                                disabled
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-gray-500 text-sm mt-1">Username cannot be changed</p>
                        </div>
                        <Button type="submit" loading={isLoading}>
                            Save Changes
                        </Button>
                    </form>
                </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
                    <h2 className="text-lg font-semibold text-white mb-4">Change Password</h2>

                    <Input
                        label="Current Password"
                        type="password"
                        error={passwordErrors.oldPassword?.message}
                        {...registerPassword('oldPassword', {
                            required: 'Current password is required',
                        })}
                    />
                    <Input
                        label="New Password"
                        type="password"
                        error={passwordErrors.newPassword?.message}
                        {...registerPassword('newPassword', {
                            required: 'New password is required',
                            minLength: {
                                value: 6,
                                message: 'Password must be at least 6 characters',
                            },
                        })}
                    />
                    <Input
                        label="Confirm New Password"
                        type="password"
                        error={passwordErrors.confirmPassword?.message}
                        {...registerPassword('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: (value) =>
                                value === newPassword || 'Passwords do not match',
                        })}
                    />
                    <Button type="submit" loading={isLoading}>
                        Change Password
                    </Button>
                </form>
            )}

            {/* Danger Zone Tab */}
            {activeTab === 'danger' && (
                <div className="space-y-6">
                    <div className="border border-red-500/50 rounded-xl p-6 bg-red-500/10">
                        <h2 className="text-lg font-semibold text-red-500 mb-2">Delete Account</h2>
                        <p className="text-gray-400 mb-4">
                            Once you delete your account, there is no going back. This will permanently delete:
                        </p>
                        <ul className="list-disc list-inside text-gray-400 mb-4 space-y-1">
                            <li>Your profile and all personal data</li>
                            <li>All your videos, thumbnails, and media files</li>
                            <li>All your comments and likes</li>
                            <li>All your tweets and playlists</li>
                            <li>All your subscriptions</li>
                        </ul>
                        <Button
                            variant="danger"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            Delete My Account
                        </Button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false)
                    setDeleteConfirmation('')
                }}
                title="Delete Account"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-red-500/20 rounded-lg">
                        <HiExclamation className="w-6 h-6 text-red-500 flex-shrink-0" />
                        <p className="text-red-400 text-sm">
                            This action cannot be undone. All your data will be permanently deleted.
                        </p>
                    </div>
                    <p className="text-gray-300">
                        Please type <span className="font-bold text-white">{user?.username}</span> to confirm:
                    </p>
                    <Input
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="Enter your username"
                    />
                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowDeleteModal(false)
                                setDeleteConfirmation('')
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteAccount}
                            loading={isLoading}
                            disabled={deleteConfirmation !== user?.username}
                        >
                            Delete Account
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default SettingsPage
