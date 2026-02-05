/**
 * Debounce utility function
 * Delays function execution until after a specified wait time
 */

/**
 * Creates a debounced function that delays invoking func
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait = 300) => {
    let timeoutId = null

    const debounced = (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }

        timeoutId = setTimeout(() => {
            func.apply(null, args)
        }, wait)
    }

    // Allow canceling the debounced call
    debounced.cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
        }
    }

    return debounced
}

/**
 * Throttle utility function
 * Limits function execution to once per specified interval
 * @param {Function} func - Function to throttle
 * @param {number} limit - Minimum time between calls in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit = 300) => {
    let inThrottle = false

    return (...args) => {
        if (!inThrottle) {
            func.apply(null, args)
            inThrottle = true
            setTimeout(() => {
                inThrottle = false
            }, limit)
        }
    }
}

export default debounce
