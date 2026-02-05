// Simple in-memory cache with TTL (Time To Live)
// Alternative to Redis for free-tier deployments

class SimpleCache {
    constructor() {
        this.cache = new Map()
        this.stats = {
            hits: 0,
            misses: 0
        }
    }

    /**
     * Set a value in cache with TTL
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - Time to live in seconds (default: 300 = 5 mins)
     */
    set(key, value, ttl = 300) {
        const expiresAt = Date.now() + (ttl * 1000)
        this.cache.set(key, { value, expiresAt })
    }

    /**
     * Get a value from cache
     * @param {string} key - Cache key
     * @returns {any|null} - Cached value or null if expired/not found
     */
    get(key) {
        const item = this.cache.get(key)

        if (!item) {
            this.stats.misses++
            return null
        }

        // Check if expired
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key)
            this.stats.misses++
            return null
        }

        this.stats.hits++
        return item.value
    }

    /**
     * Check if key exists and is not expired
     * @param {string} key - Cache key
     * @returns {boolean}
     */
    has(key) {
        const item = this.cache.get(key)
        if (!item) return false
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key)
            return false
        }
        return true
    }

    /**
     * Delete a specific key
     * @param {string} key - Cache key
     */
    delete(key) {
        this.cache.delete(key)
    }

    /**
     * Clear all cached items
     */
    clear() {
        this.cache.clear()
    }

    /**
     * Get cache statistics
     * @returns {object} - Cache stats
     */
    getStats() {
        const hitRate = this.stats.hits + this.stats.misses > 0
            ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
            : 0

        return {
            ...this.stats,
            hitRate: `${hitRate}%`,
            size: this.cache.size
        }
    }

    /**
     * Clean up expired entries (call periodically)
     */
    cleanup() {
        const now = Date.now()
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiresAt) {
                this.cache.delete(key)
            }
        }
    }
}

// Create singleton instance
export const cache = new SimpleCache()

// Run cleanup every 5 minutes
setInterval(() => {
    cache.cleanup()
}, 5 * 60 * 1000)

export default cache
