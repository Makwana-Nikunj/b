import { useRef, useState, useEffect, useCallback } from 'react'
import {
    HiPlay,
    HiPause,
    HiVolumeUp,
    HiVolumeOff,
    HiArrowsExpand,
} from 'react-icons/hi'
import { formatDuration } from '../../utils/formatDuration'

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]
const VIDEO_QUALITIES = ['Auto', '1080p', '720p', '480p', '360p']

// Generate Cloudinary URL with quality transformation
const getQualityUrl = (originalUrl, quality) => {
    if (!originalUrl || quality === 'Auto') return originalUrl

    const height = parseInt(quality)
    if (isNaN(height)) return originalUrl

    if (originalUrl.includes('cloudinary.com')) {
        const uploadIndex = originalUrl.indexOf('/upload/')
        if (uploadIndex !== -1) {
            const beforeUpload = originalUrl.slice(0, uploadIndex + 8)
            const afterUpload = originalUrl.slice(uploadIndex + 8)
            return `${beforeUpload}q_auto,h_${height}/${afterUpload}`
        }
    }
    return originalUrl
}

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
    const [skipAnimation, setSkipAnimation] = useState(null)
    const [playbackSpeed, setPlaybackSpeed] = useState(1)
    const [quality, setQuality] = useState('Auto')
    const [videoSrc, setVideoSrc] = useState(src)
    const [showSpeedMenu, setShowSpeedMenu] = useState(false)
    const [showQualityMenu, setShowQualityMenu] = useState(false)

    let hideControlsTimeout = null

    // Update video source when quality changes
    useEffect(() => {
        const newSrc = getQualityUrl(src, quality)
        if (newSrc !== videoSrc) {
            const video = videoRef.current
            const currentTimePos = video?.currentTime || 0
            const wasPlaying = !video?.paused

            setVideoSrc(newSrc)

            if (video) {
                video.onloadedmetadata = () => {
                    video.currentTime = currentTimePos
                    if (wasPlaying) video.play()
                }
            }
        }
    }, [src, quality])

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

        const activeElement = document.activeElement
        const isTyping = activeElement?.tagName === 'INPUT' ||
            activeElement?.tagName === 'TEXTAREA' ||
            activeElement?.isContentEditable

        if (isTyping) return

        if (['f', 'F', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
            e.preventDefault()
        }

        switch (e.key) {
            case 'f':
            case 'F':
                toggleFullscreen()
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

    // Mobile-friendly fullscreen
    const toggleFullscreen = () => {
        const container = containerRef.current
        const video = videoRef.current
        if (!container || !video) return

        if (document.fullscreenElement || document.webkitFullscreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen()
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen()
            }
        } else {
            // Try container first, fallback to video for iOS
            if (container.requestFullscreen) {
                container.requestFullscreen()
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen()
            } else if (video.webkitEnterFullscreen) {
                // iOS Safari native fullscreen
                video.webkitEnterFullscreen()
            }
        }
    }

    const handleMouseMove = () => {
        setShowControls(true)
        clearTimeout(hideControlsTimeout)
        hideControlsTimeout = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false)
                setShowSpeedMenu(false)
                setShowQualityMenu(false)
            }
        }, 3000)
    }

    const handleSpeedChange = (speed) => {
        const video = videoRef.current
        if (!video) return
        video.playbackRate = speed
        setPlaybackSpeed(speed)
        setShowSpeedMenu(false)
    }

    const handleQualityChange = (q) => {
        setQuality(q)
        setShowQualityMenu(false)
    }

    const closeMenus = () => {
        setShowSpeedMenu(false)
        setShowQualityMenu(false)
    }

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

    return (
        <div
            ref={containerRef}
            className="relative bg-black group rounded-2xl overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
                if (isPlaying) setShowControls(false)
                closeMenus()
            }}
            onClick={(e) => {
                // Close menus when clicking outside
                if (!e.target.closest('.menu-container')) {
                    closeMenus()
                }
            }}
        >
            <video
                ref={videoRef}
                src={videoSrc}
                poster={poster}
                className="w-full aspect-video"
                onClick={togglePlay}
                title={title}
                playsInline
                webkit-playsinline="true"
            />

            {/* Skip animations - YouTube style */}
            {skipAnimation === 'backward' && (
                <div className="absolute left-0 top-0 bottom-0 w-1/3 flex items-center justify-center pointer-events-none">
                    <div className="flex flex-col items-center animate-[fadeScale_0.5s_ease-out]">
                        <div className="flex gap-1">
                            <svg className="w-5 h-5 text-white animate-[slideLeft_0.3s_ease-out]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
                            </svg>
                            <svg className="w-5 h-5 text-white animate-[slideLeft_0.3s_ease-out_0.1s]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
                            </svg>
                        </div>
                        <span className="text-white text-sm font-medium mt-1">5 seconds</span>
                    </div>
                </div>
            )}

            {skipAnimation === 'forward' && (
                <div className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-center pointer-events-none">
                    <div className="flex flex-col items-center animate-[fadeScale_0.5s_ease-out]">
                        <div className="flex gap-1">
                            <svg className="w-5 h-5 text-white animate-[slideRight_0.3s_ease-out]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
                            </svg>
                            <svg className="w-5 h-5 text-white animate-[slideRight_0.3s_ease-out_0.1s]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
                            </svg>
                        </div>
                        <span className="text-white text-sm font-medium mt-1">5 seconds</span>
                    </div>
                </div>
            )}

            {/* Center play/pause overlay */}
            <button
                onClick={togglePlay}
                className={`absolute inset-0 flex items-center justify-center transition-opacity ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
            >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-all hover:scale-110">
                    {isPlaying ? (
                        <HiPause className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    ) : (
                        <HiPlay className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" />
                    )}
                </div>
            </button>

            {/* Bottom controls */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-4 pt-12 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}
            >
                {/* Progress bar */}
                <div
                    ref={progressRef}
                    className="h-1 bg-white/30 rounded-full cursor-pointer mb-3 group/progress hover:h-1.5 transition-all"
                    onClick={handleProgressClick}
                >
                    <div
                        className="h-full bg-red-500 rounded-full relative"
                        style={{ width: `${progressPercentage}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full scale-0 group-hover/progress:scale-100 transition-transform" />
                    </div>
                </div>

                {/* Controls row */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Play/Pause */}
                        <button onClick={togglePlay} className="text-white p-1 hover:scale-110 transition-transform">
                            {isPlaying ? <HiPause className="w-6 h-6" /> : <HiPlay className="w-6 h-6" />}
                        </button>

                        {/* Volume - hide on mobile */}
                        <div className="hidden sm:flex items-center gap-2">
                            <button onClick={toggleMute} className="text-white p-1">
                                {isMuted || volume === 0 ? <HiVolumeOff className="w-6 h-6" /> : <HiVolumeUp className="w-6 h-6" />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-16 accent-white cursor-pointer"
                            />
                        </div>

                        {/* Time */}
                        <div className="text-white text-xs sm:text-sm">
                            {formatDuration(currentTime)} / {formatDuration(duration)}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* Speed selector */}
                        <div className="relative menu-container">
                            <button
                                onClick={() => {
                                    setShowSpeedMenu(!showSpeedMenu)
                                    setShowQualityMenu(false)
                                }}
                                className={`text-white text-xs sm:text-sm px-2 py-1 rounded hover:bg-white/20 transition-colors ${playbackSpeed !== 1 ? 'bg-white/20' : ''}`}
                            >
                                {playbackSpeed}x
                            </button>
                            {showSpeedMenu && (
                                <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 overflow-hidden min-w-[80px]">
                                    {PLAYBACK_SPEEDS.map((speed) => (
                                        <button
                                            key={speed}
                                            onClick={() => handleSpeedChange(speed)}
                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-white/10 transition-colors ${playbackSpeed === speed ? 'text-blue-400 bg-white/5' : 'text-white'
                                                }`}
                                        >
                                            {speed}x
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quality selector */}
                        <div className="relative menu-container">
                            <button
                                onClick={() => {
                                    setShowQualityMenu(!showQualityMenu)
                                    setShowSpeedMenu(false)
                                }}
                                className={`text-white text-xs sm:text-sm px-2 py-1 rounded hover:bg-white/20 transition-colors ${quality !== 'Auto' ? 'bg-white/20' : ''}`}
                            >
                                {quality}
                            </button>
                            {showQualityMenu && (
                                <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 overflow-hidden min-w-[80px]">
                                    {VIDEO_QUALITIES.map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => handleQualityChange(q)}
                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-white/10 transition-colors ${quality === q ? 'text-blue-400 bg-white/5' : 'text-white'
                                                }`}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Fullscreen */}
                        <button onClick={toggleFullscreen} className="text-white p-1 hover:scale-110 transition-transform">
                            <HiArrowsExpand className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoPlayer
