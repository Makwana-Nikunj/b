import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

/**
 * Wrapper component that animates page transitions
 * Triggers fade animation when route changes
 */
function PageTransition({ children }) {
    const location = useLocation()
    const [isAnimating, setIsAnimating] = useState(false)
    const [displayChildren, setDisplayChildren] = useState(children)

    useEffect(() => {
        // Start animation on route change
        setIsAnimating(true)

        // Small delay to allow exit animation, then swap content
        const timer = setTimeout(() => {
            setDisplayChildren(children)
            setIsAnimating(false)
        }, 50)

        return () => clearTimeout(timer)
    }, [location.pathname, children])

    return (
        <div
            className={`transition-all duration-300 ease-out ${isAnimating
                    ? 'opacity-0 translate-y-2'
                    : 'opacity-100 translate-y-0'
                }`}
        >
            {displayChildren}
        </div>
    )
}

export default PageTransition
