import { useRef, useState, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'

export default function AudioPlayer({ src }: { src: string }) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const updateTime = () => setCurrentTime(audio.currentTime)
        const updateDuration = () => setDuration(audio.duration)
        const onEnded = () => setIsPlaying(false)

        audio.addEventListener('timeupdate', updateTime)
        audio.addEventListener('loadedmetadata', updateDuration)
        audio.addEventListener('ended', onEnded)

        return () => {
            audio.removeEventListener('timeupdate', updateTime)
            audio.removeEventListener('loadedmetadata', updateDuration)
            audio.removeEventListener('ended', onEnded)
        }
    }, [])

    const togglePlay = () => {
        if (!audioRef.current) return
        if (isPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.play()
        }
        setIsPlaying(!isPlaying)
    }

    const formatTime = (time: number) => {
        const min = Math.floor(time / 60)
        const sec = Math.floor(time % 60).toString().padStart(2, '0')
        return `${min}:${sec}`
    }

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0

    return (
        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm w-full">
            <button
                onClick={togglePlay}
                className="w-10 h-10 flex-shrink-0 bg-[#4A9FE0] hover:bg-[#3b82f6] text-white rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-[0_4px_14px_rgba(74,159,224,0.3)]"
            >
                {isPlaying ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5 ml-1" fill="currentColor" />}
            </button>

            <div className="flex-1">
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#4A9FE0] transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between mt-1 text-[0.65rem] text-slate-500 stat-number">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            <audio ref={audioRef} src={src} preload="metadata" />
        </div>
    )
}
