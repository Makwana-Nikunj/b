/**
 * Format views count (e.g., 1234567 -> "1.2M")
 * @param {number} count
 * @returns {string}
 */
export function formatViews(count) {
    if (count === undefined || count === null) return '0'

    if (count >= 1000000000) {
        return `${(count / 1000000000).toFixed(1)}B`
    }

    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M`
    }

    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K`
    }

    return count.toString()
}

/**
 * Format subscribers count
 * @param {number} count
 * @returns {string}
 */
export function formatSubscribers(count) {
    const formatted = formatViews(count)
    return `${formatted} ${count === 1 ? 'subscriber' : 'subscribers'}`
}
