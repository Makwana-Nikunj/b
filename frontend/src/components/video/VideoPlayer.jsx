import { useRef, useState, useEffect, useCallback } from 'react'
import {
    HiPlay,
    HiPause,
    HiVolumeUp,
    HiVolumeOff,
    HiArrowsExpand,
} from 'react-icons/hi'
import {
    HiMiniArrowsPointingIn,
    HiMiniSpeakerWave,
    HiMiniSpeakerXMark,
    HiMiniCog6Tooth,
    HiMiniForward,
    HiMiniBackward,
} from 'react-icons/hi2'
import { formatDuration } from '../../utils/formatDuration'

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
const VIDEO_QUALITIES = ['Auto', '1080p', '720p', '480p', '360p']
const SKIP_SECONDS = 10

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
    const hideControlsRef = useRef(null)
    const doubleTapRef = useRef({ last: 0, side: null })
    const seekPreviewRef = useRef(null)
    const longPressRef = useRef(null)

    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [volume, setVolume] = useState(1)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [buffered, setBuffered] = useState(0)
    const [showControls, setShowControls] = useState(true)
    const [skipAnimation, setSkipAnimation] = useState(null)
    const [skipAmount, setSkipAmount] = useState(0)
    const [playbackSpeed, setPlaybackSpeed] = useState(1)
    const [quality, setQuality] = useState('Auto')
    const [videoSrc, setVideoSrc] = useState(src)
    const [showSettingsMenu, setShowSettingsMenu] = useState(false)
    const [settingsView, setSettingsView] = useState('main') // 'main' | 'speed' | 'quality'
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isSeeking, setIsSeeking] = useState(false)
    const [seekPreviewTime, setSeekPreviewTime] = useState(0)
    const [seekPreviewPos, setSeekPreviewPos] = useState(0)
    const [showVolumeSlider, setShowVolumeSlider] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [isLongPress, setIsLongPress] = useState(false)
    const [showMobileSkip, setShowMobileSkip] = useState(null)
    const [mobileSkipTotal, setMobileSkipTotal] = useState(0)

    // Detect mobile
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

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

    // Fullscreen change listener
    useEffect(() => {
        const handler = () => {
            const isFs = !!document.fullscreenElement || !!document.webkitFullscreenElement
            setIsFullscreen(isFs)

            // Unlock orientation when exiting fullscreen
            if (!isFs && isMobile) {
                try {
                    if (screen.orientation?.unlock) {
                        screen.orientation.unlock()
                    }
                } catch (e) { /* ignore */ }
            }
        }
        document.addEventListener('fullscreenchange', handler)
        document.addEventListener('webkitfullscreenchange', handler)
        return () => {
            document.removeEventListener('fullscreenchange', handler)
            document.removeEventListener('webkitfullscreenchange', handler)
        }
    }, [isMobile])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime)
            // Update buffered
            if (video.buffered.length > 0) {
                setBuffered(video.buffered.end(video.buffered.length - 1))
            }
        }
        const handleLoadedMetadata = () => setDuration(video.duration)
        const handleEnded = () => {
            setIsPlaying(false)
            setShowControls(true)
        }
        const handlePlay = () => setIsPlaying(true)
        const handlePause = () => setIsPlaying(false)

        video.addEventListener('timeupdate', handleTimeUpdate)
        video.addEventListener('loadedmetadata', handleLoadedMetadata)
        video.addEventListener('ended', handleEnded)
        video.addEventListener('play', handlePlay)
        video.addEventListener('pause', handlePause)

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate)
            video.removeEventListener('loadedmetadata', handleLoadedMetadata)
            video.removeEventListener('ended', handleEnded)
            video.removeEventListener('play', handlePlay)
            video.removeEventListener('pause', handlePause)
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

        if (['f', 'F', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'k', 'K', 'm', 'M', 'j', 'J', 'l', 'L', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
            e.preventDefault()
        }

        switch (e.key) {
            case 'f':
            case 'F':
                toggleFullscreen()
                break
            case 'k':
            case 'K':
            case ' ':
                togglePlay()
                break
            case 'm':
            case 'M':
                toggleMute()
                break
            case 'j':
            case 'J':
                skip(-SKIP_SECONDS)
                break
            case 'l':
            case 'L':
                skip(SKIP_SECONDS)
                break
            case 'ArrowLeft':
                skip(-5)
                break
            case 'ArrowRight':
                skip(5)
                break
            case 'ArrowUp': {
                const newVolumeUp = Math.min(1, video.volume + 0.05)
                video.volume = newVolumeUp
                setVolume(newVolumeUp)
                setIsMuted(false)
                break
            }
            case 'ArrowDown': {
                const newVolumeDown = Math.max(0, video.volume - 0.05)
                video.volume = newVolumeDown
                setVolume(newVolumeDown)
                setIsMuted(newVolumeDown === 0)
                break
            }
            // Number keys 0-9: seek to percentage
            case '0': case '1': case '2': case '3': case '4':
            case '5': case '6': case '7': case '8': case '9':
                video.currentTime = (parseInt(e.key) / 10) * video.duration
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

    const skip = (seconds) => {
        const video = videoRef.current
        if (!video) return
        const direction = seconds > 0 ? 'forward' : 'backward'
        video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds))
        setSkipAnimation(direction)
        setSkipAmount(Math.abs(seconds))
        setTimeout(() => setSkipAnimation(null), 600)
    }

    const togglePlay = () => {
        const video = videoRef.current
        if (!video) return

        if (isPlaying) {
            video.pause()
        } else {
            video.play()
        }
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
        video.muted = newVolume === 0
    }

    const handleProgressClick = (e) => {
        const video = videoRef.current
        const progress = progressRef.current
        if (!video || !progress) return

        const rect = progress.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const percentage = Math.max(0, Math.min(1, clickX / rect.width))
        video.currentTime = percentage * duration
    }

    const handleProgressHover = (e) => {
        const progress = progressRef.current
        if (!progress) return

        const rect = progress.getBoundingClientRect()
        const hoverX = e.clientX - rect.left
        const percentage = Math.max(0, Math.min(1, hoverX / rect.width))
        setSeekPreviewTime(percentage * duration)
        setSeekPreviewPos(hoverX)
        setIsSeeking(true)
    }

    const handleProgressLeave = () => {
        setIsSeeking(false)
    }

    // Touch progress seeking
    const handleProgressTouch = (e) => {
        const progress = progressRef.current
        const video = videoRef.current
        if (!progress || !video) return

        const touch = e.touches[0]
        const rect = progress.getBoundingClientRect()
        const touchX = touch.clientX - rect.left
        const percentage = Math.max(0, Math.min(1, touchX / rect.width))
        video.currentTime = percentage * duration
    }

    // Mobile-friendly fullscreen with landscape lock
    const toggleFullscreen = async () => {
        const container = containerRef.current
        const video = videoRef.current
        if (!container || !video) return

        if (document.fullscreenElement || document.webkitFullscreenElement) {
            // Unlock orientation before exiting fullscreen
            try {
                if (screen.orientation?.unlock) {
                    screen.orientation.unlock()
                }
            } catch (e) { /* ignore */ }

            if (document.exitFullscreen) {
                document.exitFullscreen()
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen()
            }
        } else {
            if (container.requestFullscreen) {
                await container.requestFullscreen()
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen()
            } else if (video.webkitEnterFullscreen) {
                video.webkitEnterFullscreen()
            }

            // Lock to landscape on mobile
            if (isMobile) {
                try {
                    if (screen.orientation?.lock) {
                        await screen.orientation.lock('landscape')
                    }
                } catch (e) { /* orientation lock not supported or failed */ }
            }
        }
    }

    const resetHideTimer = useCallback(() => {
        setShowControls(true)
        clearTimeout(hideControlsRef.current)
        hideControlsRef.current = setTimeout(() => {
            if (videoRef.current && !videoRef.current.paused) {
                setShowControls(false)
                setShowSettingsMenu(false)
                setShowVolumeSlider(false)
            }
        }, 3000)
    }, [])

    const handleMouseMove = () => {
        if (!isMobile) resetHideTimer()
    }

    // Mobile: tap to toggle controls, double-tap to seek
    const handleVideoAreaTap = (e) => {
        if (e.target.closest('.controls-area') || e.target.closest('.menu-container') || e.target.closest('.settings-panel')) return

        if (isMobile) {
            const now = Date.now()
            const rect = containerRef.current.getBoundingClientRect()
            const tapX = (e.touches?.[0]?.clientX || e.clientX) - rect.left
            const tapSide = tapX < rect.width / 2 ? 'left' : 'right'

            if (now - doubleTapRef.current.last < 300) {
                // Double tap - skip
                e.preventDefault()
                const seconds = tapSide === 'right' ? SKIP_SECONDS : -SKIP_SECONDS
                const video = videoRef.current
                if (video) {
                    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds))
                }

                // Show mobile skip animation
                setShowMobileSkip(tapSide)
                setMobileSkipTotal(prev => prev + SKIP_SECONDS)
                setTimeout(() => {
                    setShowMobileSkip(null)
                    setMobileSkipTotal(0)
                }, 800)

                doubleTapRef.current = { last: 0, side: null }
            } else {
                // Single tap - toggle controls
                doubleTapRef.current = { last: now, side: tapSide }
                setTimeout(() => {
                    if (doubleTapRef.current.last === now) {
                        if (showControls) {
                            setShowControls(false)
                            setShowSettingsMenu(false)
                        } else {
                            resetHideTimer()
                        }
                    }
                }, 300)
            }
        } else {
            // Desktop: click to play/pause
            togglePlay()
        }
    }

    // Mobile long press: 2x speed
    const handleTouchStart = (e) => {
        if (e.target.closest('.controls-area') || e.target.closest('.menu-container')) return

        longPressRef.current = setTimeout(() => {
            const video = videoRef.current
            if (video) {
                video.playbackRate = 2
                setIsLongPress(true)
            }
        }, 500)
    }

    const handleTouchEnd = () => {
        clearTimeout(longPressRef.current)
        if (isLongPress) {
            const video = videoRef.current
            if (video) video.playbackRate = playbackSpeed
            setIsLongPress(false)
        }
    }

    const handleSpeedChange = (speed) => {
        const video = videoRef.current
        if (!video) return
        video.playbackRate = speed
        setPlaybackSpeed(speed)
        setSettingsView('main')
    }

    const handleQualityChange = (q) => {
        setQuality(q)
        setSettingsView('main')
    }

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0
    const bufferedPercentage = duration > 0 ? (buffered / duration) * 100 : 0

    return (
        <div
            ref={containerRef}
            className={`relative bg-black group overflow-hidden select-none ${isFullscreen ? '' : 'rounded-2xl'}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
                if (isPlaying && !isMobile) {
                    setShowControls(false)
                    setShowSettingsMenu(false)
                    setShowVolumeSlider(false)
                }
            }}
        >
            <video
                ref={videoRef}
                src={videoSrc}
                poster={poster}
                className="w-full aspect-video cursor-pointer"
                onClick={isMobile ? undefined : handleVideoAreaTap}
                onTouchEnd={isMobile ? handleVideoAreaTap : undefined}
                onTouchStart={isMobile ? handleTouchStart : undefined}
                onTouchCancel={handleTouchEnd}
                title={title}
                playsInline
                webkit-playsinline="true"
            />

            {/* Long press 2x indicator */}
            {isLongPress && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full flex items-center gap-2 z-20 pointer-events-none animate-fadeInScale">
                    <HiMiniForward className="w-4 h-4" />
                    2x Speed
                </div>
            )}

            {/* Mobile double-tap skip animation */}
            {showMobileSkip === 'left' && (
                <div className="absolute left-0 top-0 bottom-0 w-1/2 flex items-center justify-center pointer-events-none z-10">
                    <div className="bg-white/10 backdrop-blur-sm rounded-full w-28 h-28 flex flex-col items-center justify-center animate-[fadeScale_0.8s_ease-out]">
                        <HiMiniBackward className="w-8 h-8 text-white" />
                        <span className="text-white text-sm font-bold mt-1">{SKIP_SECONDS}s</span>
                    </div>
                </div>
            )}
            {showMobileSkip === 'right' && (
                <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-center pointer-events-none z-10">
                    <div className="bg-white/10 backdrop-blur-sm rounded-full w-28 h-28 flex flex-col items-center justify-center animate-[fadeScale_0.8s_ease-out]">
                        <HiMiniForward className="w-8 h-8 text-white" />
                        <span className="text-white text-sm font-bold mt-1">{SKIP_SECONDS}s</span>
                    </div>
                </div>
            )}

            {/* Desktop skip animations */}
            {skipAnimation === 'backward' && !isMobile && (
                <div className="absolute left-0 top-0 bottom-0 w-1/3 flex items-center justify-center pointer-events-none z-10">
                    <div className="flex flex-col items-center animate-[fadeScale_0.5s_ease-out]">
                        <div className="flex gap-1">
                            <svg className="w-5 h-5 text-white animate-[slideLeft_0.3s_ease-out]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
                            </svg>
                            <svg className="w-5 h-5 text-white animate-[slideLeft_0.3s_ease-out_0.1s]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
                            </svg>
                        </div>
                        <span className="text-white text-sm font-medium mt-1">{skipAmount} seconds</span>
                    </div>
                </div>
            )}

            {skipAnimation === 'forward' && !isMobile && (
                <div className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-center pointer-events-none z-10">
                    <div className="flex flex-col items-center animate-[fadeScale_0.5s_ease-out]">
                        <div className="flex gap-1">
                            <svg className="w-5 h-5 text-white animate-[slideRight_0.3s_ease-out]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
                            </svg>
                            <svg className="w-5 h-5 text-white animate-[slideRight_0.3s_ease-out_0.1s]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
                            </svg>
                        </div>
                        <span className="text-white text-sm font-medium mt-1">{skipAmount} seconds</span>
                    </div>
                </div>
            )}

            {/* Center play button - only when paused */}
            {!isPlaying && (
                <button
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center z-10"
                >
                    <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/80 transition-all duration-200 hover:scale-110 active:scale-95">
                        <HiPlay className="w-8 h-8 sm:w-9 sm:h-9 text-white ml-1" />
                    </div>
                </button>
            )}

            {/* Gradient overlay for controls */}
            <div
                className={`absolute bottom-0 left-0 right-0 pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
                style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.85))', height: isFullscreen ? '140px' : '120px' }}
            />

            {/* Title in fullscreen - top gradient */}
            {isFullscreen && (
                <div
                    className={`absolute top-0 left-0 right-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
                    style={{ background: 'linear-gradient(rgba(0,0,0,0.7), transparent)', padding: '16px 20px' }}
                >
                    <p className="text-white font-medium text-base truncate">{title}</p>
                </div>
            )}

            {/* Bottom controls */}
            <div
                className={`controls-area absolute bottom-0 left-0 right-0 px-3 sm:px-4 pb-2 sm:pb-3 pt-6 transition-opacity duration-300 z-10 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                {/* Progress bar */}
                <div
                    ref={progressRef}
                    className="relative h-[5px] sm:h-1 bg-white/20 rounded-full cursor-pointer mb-2 sm:mb-3 group/progress hover:h-[7px] sm:hover:h-1.5 transition-all touch-none"
                    onClick={handleProgressClick}
                    onMouseMove={handleProgressHover}
                    onMouseLeave={handleProgressLeave}
                    onTouchMove={handleProgressTouch}
                    onTouchStart={handleProgressTouch}
                >
                    {/* Buffered */}
                    <div
                        className="absolute top-0 left-0 h-full bg-white/30 rounded-full"
                        style={{ width: `${bufferedPercentage}%` }}
                    />
                    {/* Progress */}
                    <div
                        className="absolute top-0 left-0 h-full bg-red-500 rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                    >
                        {/* Scrubber handle */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-3 sm:h-3 bg-red-500 rounded-full scale-100 sm:scale-0 sm:group-hover/progress:scale-100 transition-transform shadow-lg" />
                    </div>

                    {/* Seek preview tooltip */}
                    {isSeeking && !isMobile && (
                        <div
                            className="absolute -top-9 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded pointer-events-none"
                            style={{ left: `${seekPreviewPos}px` }}
                        >
                            {formatDuration(seekPreviewTime)}
                        </div>
                    )}
                </div>

                {/* Controls row */}
                <div className="flex items-center justify-between gap-1 sm:gap-2">
                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* Play/Pause */}
                        <button onClick={togglePlay} className="text-white p-1.5 sm:p-1 hover:scale-110 transition-transform active:scale-95 touch-target">
                            {isPlaying ? <HiPause className="w-6 h-6 sm:w-7 sm:h-7" /> : <HiPlay className="w-6 h-6 sm:w-7 sm:h-7" />}
                        </button>

                        {/* Skip backward - mobile */}
                        {isMobile && (
                            <button onClick={() => skip(-SKIP_SECONDS)} className="text-white p-1.5 touch-target">
                                <HiMiniBackward className="w-5 h-5" />
                            </button>
                        )}

                        {/* Skip forward - mobile */}
                        {isMobile && (
                            <button onClick={() => skip(SKIP_SECONDS)} className="text-white p-1.5 touch-target">
                                <HiMiniForward className="w-5 h-5" />
                            </button>
                        )}

                        {/* Volume - desktop */}
                        <div
                            className="hidden sm:flex items-center gap-1 group/vol"
                            onMouseEnter={() => setShowVolumeSlider(true)}
                            onMouseLeave={() => setShowVolumeSlider(false)}
                        >
                            <button onClick={toggleMute} className="text-white p-1 hover:scale-110 transition-transform">
                                {isMuted || volume === 0 ? (
                                    <HiMiniSpeakerXMark className="w-6 h-6" />
                                ) : (
                                    <HiMiniSpeakerWave className="w-6 h-6" />
                                )}
                            </button>
                            <div className={`overflow-hidden transition-all duration-200 ${showVolumeSlider ? 'w-20 opacity-100' : 'w-0 opacity-0'}`}>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="w-full accent-white cursor-pointer h-1"
                                    style={{
                                        background: `linear-gradient(to right, white ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%)`,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Time */}
                        <div className="text-white text-[11px] sm:text-sm font-medium tabular-nums ml-1">
                            <span>{formatDuration(currentTime)}</span>
                            <span className="text-white/60 mx-1">/</span>
                            <span className="text-white/60">{formatDuration(duration)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-0.5 sm:gap-1">
                        {/* Mobile volume toggle */}
                        {isMobile && (
                            <button onClick={toggleMute} className="text-white p-1.5 touch-target">
                                {isMuted || volume === 0 ? (
                                    <HiMiniSpeakerXMark className="w-5 h-5" />
                                ) : (
                                    <HiMiniSpeakerWave className="w-5 h-5" />
                                )}
                            </button>
                        )}

                        {/* Settings button */}
                        <div className="relative menu-container">
                            <button
                                onClick={() => {
                                    setShowSettingsMenu(!showSettingsMenu)
                                    setSettingsView('main')
                                }}
                                className={`text-white p-1.5 sm:p-1 hover:scale-110 transition-all duration-200 touch-target ${showSettingsMenu ? 'rotate-45' : ''}`}
                            >
                                <HiMiniCog6Tooth className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>

                            {/* Settings panel */}
                            {showSettingsMenu && (
                                <div className="settings-panel absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 overflow-hidden min-w-[200px] sm:min-w-[220px]">
                                    {settingsView === 'main' && (
                                        <div className="py-1">
                                            <button
                                                onClick={() => setSettingsView('speed')}
                                                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
                                            >
                                                <span>Playback speed</span>
                                                <span className="text-white/60">{playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`}</span>
                                            </button>
                                            <button
                                                onClick={() => setSettingsView('quality')}
                                                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
                                            >
                                                <span>Quality</span>
                                                <span className="text-white/60">{quality}</span>
                                            </button>
                                        </div>
                                    )}

                                    {settingsView === 'speed' && (
                                        <div>
                                            <button
                                                onClick={() => setSettingsView('main')}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-white/10 border-b border-white/10 font-medium"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                                Playback speed
                                            </button>
                                            <div className="py-1 max-h-[240px] overflow-y-auto">
                                                {PLAYBACK_SPEEDS.map((speed) => (
                                                    <button
                                                        key={speed}
                                                        onClick={() => handleSpeedChange(speed)}
                                                        className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-white/10 transition-colors ${playbackSpeed === speed ? 'text-primary-400' : 'text-white'}`}
                                                    >
                                                        <span>{speed === 1 ? 'Normal' : `${speed}x`}</span>
                                                        {playbackSpeed === speed && (
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {settingsView === 'quality' && (
                                        <div>
                                            <button
                                                onClick={() => setSettingsView('main')}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-white/10 border-b border-white/10 font-medium"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                                Quality
                                            </button>
                                            <div className="py-1">
                                                {VIDEO_QUALITIES.map((q) => (
                                                    <button
                                                        key={q}
                                                        onClick={() => handleQualityChange(q)}
                                                        className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-white/10 transition-colors ${quality === q ? 'text-primary-400' : 'text-white'}`}
                                                    >
                                                        <span>{q}</span>
                                                        {quality === q && (
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Fullscreen */}
                        <button onClick={toggleFullscreen} className="text-white p-1.5 sm:p-1 hover:scale-110 transition-transform active:scale-95 touch-target">
                            {isFullscreen ? (
                                <HiMiniArrowsPointingIn className="w-5 h-5 sm:w-6 sm:h-6" />
                            ) : (
                                <HiArrowsExpand className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoPlayer
