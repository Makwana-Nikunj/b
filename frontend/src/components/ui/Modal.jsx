import { HiX } from 'react-icons/hi'
import { useEffect } from 'react'

function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    }

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70"
                onClick={onClose}
            />

            {/* Modal content */}
            <div
                className={`
          relative bg-[#212121] rounded-xl shadow-xl
          ${sizeClasses[size] || sizeClasses.md}
          w-full mx-4 max-h-[90vh] overflow-y-auto
        `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <HiX className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Modal
