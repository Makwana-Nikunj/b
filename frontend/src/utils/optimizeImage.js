/**
 * Image optimization utilities for Cloudinary
 * Generates optimized URLs for better performance
 */

/**
 * Optimize a Cloudinary image URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {object} options - Transformation options
 * @returns {string} - Optimized URL
 */
export const optimizeCloudinaryImage = (url, options = {}) => {
    if (!url || !url.includes('cloudinary.com')) {
        return url
    }

    const {
        width = 320,
        height = 180,
        quality = 'auto',
        format = 'auto',
        crop = 'fill'
    } = options

    // Build transformation string
    const transformations = `w_${width},h_${height},c_${crop},f_${format},q_${quality}`

    // Insert transformations after /upload/
    return url.replace('/upload/', `/upload/${transformations}/`)
}

/**
 * Get optimized thumbnail URL
 * @param {string} url - Original thumbnail URL
 * @param {string} size - Size preset ('small', 'medium', 'large')
 * @returns {string} - Optimized URL
 */
export const getOptimizedThumbnail = (url, size = 'medium') => {
    const sizes = {
        small: { width: 168, height: 94 },
        medium: { width: 320, height: 180 },
        large: { width: 640, height: 360 }
    }

    return optimizeCloudinaryImage(url, sizes[size] || sizes.medium)
}

/**
 * Get optimized avatar URL
 * @param {string} url - Original avatar URL
 * @param {string} size - Size preset ('sm', 'md', 'lg')
 * @returns {string} - Optimized URL
 */
export const getOptimizedAvatar = (url, size = 'md') => {
    const sizes = {
        sm: { width: 32, height: 32, crop: 'thumb' },
        md: { width: 48, height: 48, crop: 'thumb' },
        lg: { width: 128, height: 128, crop: 'thumb' }
    }

    return optimizeCloudinaryImage(url, sizes[size] || sizes.md)
}

/**
 * Compress image before upload (browser-side)
 * @param {File} file - Image file to compress
 * @param {number} maxWidth - Maximum width (default: 1280)
 * @param {number} quality - JPEG quality 0-1 (default: 0.8)
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = (file, maxWidth = 1280, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)

        reader.onload = (e) => {
            const img = new Image()
            img.src = e.target.result

            img.onload = () => {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')

                // Calculate new dimensions
                let { width, height } = img
                if (width > maxWidth) {
                    height = (height * maxWidth) / width
                    width = maxWidth
                }

                canvas.width = width
                canvas.height = height

                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height)

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            })
                            resolve(compressedFile)
                        } else {
                            reject(new Error('Failed to compress image'))
                        }
                    },
                    'image/jpeg',
                    quality
                )
            }

            img.onerror = () => reject(new Error('Failed to load image'))
        }

        reader.onerror = () => reject(new Error('Failed to read file'))
    })
}

export default {
    optimizeCloudinaryImage,
    getOptimizedThumbnail,
    getOptimizedAvatar,
    compressImage
}
