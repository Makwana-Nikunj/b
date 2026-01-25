import { useRef, useState, useEffect, useCallback } from 'react'
import {
    HiPlay,
    HiPause,
    HiVolumeUp,
    HiVolumeOff,
    HiArrowsExpand,
} from 'react-icons/hi'
import { formatDuration } from '../../utils/formatDuration'

function VideoPlayer({ src, poster, title }) {
    const videoRef = useRef(null)
    const containerRef = useRef(null)
    const progressRef = useRef(null)

    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [volume, setVolume] = useState(1)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [showControls, setShowControls] = useState(true)
    const [skipAnimation, setSkipAnimation] = useState(null) // 'forward' | 'backward' | null

    let hideControlsTimeout = null

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const handleTimeUpdate = () => setCurrentTime(video.currentTime)
        const handleLoadedMetadata = () => setDuration(video.duration)
        const handleEnded = () => setIsPlaying(false)

        video.addEventListener('timeupdate', handleTimeUpdate)
        video.addEventListener('loadedmetadata', handleLoadedMetadata)
        video.addEventListener('ended', handleEnded)

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate)
            video.removeEventListener('loadedmetadata', handleLoadedMetadata)
            video.removeEventListener('ended', handleEnded)
        }
    }, [])

    // Keyboard controls
    const handleKeyDown = useCallback((e) => {
        const video = videoRef.current
        if (!video) return

        // Prevent default for these keys
        if (['f', 'F', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
            e.preventDefault()
        }

        switch (e.key) {
            case 'f':
            case 'F':
                if (document.fullscreenElement) {
                    document.exitFullscreen()
                } else {
                    video.parentElement.requestFullscreen()
                }
                break
            case 'ArrowLeft':
                video.currentTime = Math.max(0, video.currentTime - 5)
                setSkipAnimation('backward')
                setTimeout(() => setSkipAnimation(null), 500)
                break
            case 'ArrowRight':
                video.currentTime = Math.min(video.duration, video.currentTime + 5)
                setSkipAnimation('forward')
                setTimeout(() => setSkipAnimation(null), 500)
                break
            case 'ArrowUp':
                const newVolumeUp = Math.min(1, video.volume + 0.1)
                video.volume = newVolumeUp
                setVolume(newVolumeUp)
                setIsMuted(false)
                break
            case 'ArrowDown':
                const newVolumeDown = Math.max(0, video.volume - 0.1)
                video.volume = newVolumeDown
                setVolume(newVolumeDown)
                setIsMuted(newVolumeDown === 0)
                break
            case ' ':
                if (video.paused) {
                    video.play()
                    setIsPlaying(true)
                } else {
                    video.pause()
                    setIsPlaying(false)
                }
                break
            default:
                break
        }
    }, [])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [handleKeyDown])

    const togglePlay = () => {
        const video = videoRef.current
        if (!video) return

        if (isPlaying) {
            video.pause()
        } else {
            video.play()
        }
        setIsPlaying(!isPlaying)
    }

    const toggleMute = () => {
        const video = videoRef.current
        if (!video) return

        video.muted = !isMuted
        setIsMuted(!isMuted)
    }

    const handleVolumeChange = (e) => {
        const video = videoRef.current
        if (!video) return

        const newVolume = parseFloat(e.target.value)
        video.volume = newVolume
        setVolume(newVolume)
        setIsMuted(newVolume === 0)
    }

    const handleProgressClick = (e) => {
        const video = videoRef.current
        const progress = progressRef.current
        if (!video || !progress) return

        const rect = progress.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const percentage = clickX / rect.width
        video.currentTime = percentage * duration
    }

    const toggleFullscreen = () => {
        const video = videoRef.current
        if (!video) return

        if (document.fullscreenElement) {
            document.exitFullscreen()
        } else {
            video.parentElement.requestFullscreen()
        }
    }

    const handleMouseMove = () => {
        setShowControls(true)
        clearTimeout(hideControlsTimeout)
        hideControlsTimeout = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false)
            }
        }, 3000)
    }

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

    return (
        <div
            className="relative bg-black group"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full aspect-video"
                onClick={togglePlay}
                title={title}
            />

            {/* Skip backward animation */}
            {skipAnimation === 'backward' && (
                <div className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center justify-center animate-ping">
                    <div className="bg-black/60 rounded-full p-4 flex flex-col items-center">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.5 3C17.15 3 21.08 6.03 22.47 10.22L20.1 11C19.05 7.81 16.04 5.5 12.5 5.5C10.54 5.5 8.77 6.22 7.38 7.38L10 10H3V3L5.6 5.6C7.45 4 9.85 3 12.5 3M10 12V22H8V14H6V12H10M18 14V20C18 21.11 17.11 22 16 22H14C12.9 22 12 21.11 12 20V14C12 12.9 12.9 12 14 12H16C17.11 12 18 12.9 18 14M14 14V20H16V14H14Z" />
                        </svg>
                        <span className="text-white text-sm font-bold mt-1">5s</span>
                    </div>
                </div>
            )}

            {/* Skip forward animation */}
            {skipAnimation === 'forward' && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center justify-center animate-ping">
                    <div className="bg-black/60 rounded-full p-4 flex flex-col items-center">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 3C4.08 3 0 6.97 0 12H2C2 8.07 5.59 5 10 5C11.96 5 13.73 5.72 15.12 6.88L12.5 9.5H19.5V2.5L17.09 4.91C15.26 3.42 12.77 2.5 10 2.5V3M8 14V20C8 21.11 7.11 22 6 22H4C2.9 22 2 21.11 2 20V14C2 12.9 2.9 12 4 12H6C7.11 12 8 12.9 8 14M4 14V20H6V14H4M18 12H12V14H16V16H14V18H16V20H12V22H18V12Z" />
                        </svg>
                        <span className="text-white text-sm font-bold mt-1">5s</span>
                    </div>
                </div>
            )}

            {/* Play/Pause overlay */}
            <button
                onClick={togglePlay}
                className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                <div className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center">
                    {isPlaying ? (
                        <HiPause className="w-8 h-8 text-white" />
                    ) : (
                        <HiPlay className="w-8 h-8 text-white ml-1" />
                    )}
                </div>
            </button>

            {/* Controls */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                {/* Progress bar */}
                <div
                    ref={progressRef}
                    className="h-1 bg-gray-600 rounded-full cursor-pointer mb-3"
                    onClick={handleProgressClick}
                >
                    <div
                        className="h-full bg-red-600 rounded-full relative"
                        style={{ width: `${progressPercentage}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full" />
                    </div>
                </div>

                {/* Controls row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Play/Pause */}
                        <button onClick={togglePlay} className="text-white">
                            {isPlaying ? (
                                <HiPause className="w-6 h-6" />
                            ) : (
                                <HiPlay className="w-6 h-6" />
                            )}
                        </button>

                        {/* Volume */}
                        <div className="flex items-center gap-2">
                            <button onClick={toggleMute} className="text-white">
                                {isMuted || volume === 0 ? (
                                    <HiVolumeOff className="w-6 h-6" />
                                ) : (
                                    <HiVolumeUp className="w-6 h-6" />
                                )}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-20 accent-white"
                            />
                        </div>

                        {/* Time */}
                        <div className="text-white text-sm">
                            {formatDuration(currentTime)} / {formatDuration(duration)}
                        </div>
                    </div>

                    {/* Fullscreen */}
                    <button onClick={toggleFullscreen} className="text-white">
                        <HiArrowsExpand className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VideoPlayer
