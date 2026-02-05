// Performance monitoring middleware
// Logs slow requests and tracks API response times

export const performanceMonitor = (req, res, next) => {
    const start = Date.now()

    // Store original end function
    const originalEnd = res.end

    res.end = function (...args) {
        const duration = Date.now() - start

        // Log slow requests (> 1 second)
        if (duration > 1000) {
            console.warn(`[SLOW] ${req.method} ${req.originalUrl} - ${duration}ms`)
        }

        // Add timing header for debugging
        res.setHeader('X-Response-Time', `${duration}ms`)

        // Call original end
        return originalEnd.apply(this, args)
    }

    next()
}

// Request logger middleware
export const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`)
    next()
}

export default performanceMonitor
