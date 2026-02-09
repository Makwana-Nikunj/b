import { useLocation } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'

/**
 * Wrapper component that animates page transitions
 * Triggers smooth fade + slide animation when route changes
 */
function PageTransition({ children }) {
    const location = useLocation()
    const [displayChildren, setDisplayChildren] = useState(children)
    const [phase, setPhase] = useState('visible') // 'visible' | 'exiting' | 'entering'
    const prevPath = useRef(location.pathname)

    useEffect(() => {
        if (prevPath.current === location.pathname) {
            setDisplayChildren(children)
            return
        }

        prevPath.current = location.pathname

        // Start exit
        setPhase('exiting')

        const exitTimer = setTimeout(() => {
            // Swap content and start enter
            setDisplayChildren(children)
            setPhase('entering')

            const enterTimer = setTimeout(() => {
                setPhase('visible')
            }, 250)

            return () => clearTimeout(enterTimer)
        }, 100)

        return () => clearTimeout(exitTimer)
    }, [location.pathname, children])

    const getStyles = () => {
        switch (phase) {
            case 'exiting':
                return 'opacity-0 translate-y-1 scale-[0.995]'
            case 'entering':
                return 'opacity-0 translate-y-2'
            default:
                return 'opacity-100 translate-y-0 scale-100'
        }
    }

    return (
        <div
            className={`transition-all duration-250 ease-out ${getStyles()}`}
            style={{ transitionDuration: phase === 'entering' ? '300ms' : '150ms' }}
        >
            {displayChildren}
        </div>
    )
}

export default PageTransition
