'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, Heart } from 'lucide-react'

interface AudioPlayerProps {
  track?: {
    id: string
    title: string
    artist: string
    audioUrl: string
    coverImage?: string
    duration: number
  }
}

export default function AudioPlayer({ track }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    
    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [track])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const progressBar = progressRef.current
    if (!audio || !progressBar) return

    const rect = progressBar.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width
    const newTime = (clickX / width) * duration
    
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  if (!track) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
        <div className="text-center text-gray-400">
          Select a track to start playing
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
      <audio 
        ref={audioRef} 
        src={track.audioUrl}
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Track Info */}
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
            {track.coverImage ? (
              <img 
                src={track.coverImage} 
                alt={track.title} 
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Play className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-white font-medium truncate">{track.title}</div>
            <div className="text-gray-400 text-sm truncate">{track.artist}</div>
          </div>
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
          </button>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center space-y-2 flex-1 max-w-md">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsShuffle(!isShuffle)}
              className={`p-2 rounded-full transition-colors ${
                isShuffle ? 'text-purple-500 bg-purple-500/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Shuffle className="w-5 h-5" />
            </button>
            
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <SkipBack className="w-6 h-6" />
            </button>
            
            <button
              onClick={togglePlay}
              className="p-3 bg-white text-black rounded-full hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <SkipForward className="w-6 h-6" />
            </button>
            
            <button 
              onClick={() => setIsRepeat(!isRepeat)}
              className={`p-2 rounded-full transition-colors ${
                isRepeat ? 'text-purple-500 bg-purple-500/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Repeat className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center space-x-2 w-full">
            <span className="text-xs text-gray-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <div 
              ref={progressRef}
              onClick={handleProgressClick}
              className="flex-1 h-2 bg-gray-700 rounded-full cursor-pointer group"
            >
              <div 
                className="h-full bg-white rounded-full relative group-hover:bg-purple-500 transition-colors"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="text-xs text-gray-400 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2 flex-1 justify-end">
          <Volume2 className="w-5 h-5 text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => {
              const newVolume = parseFloat(e.target.value)
              setVolume(newVolume)
              if (audioRef.current) {
                audioRef.current.volume = newVolume
              }
            }}
            className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, white 0%, white ${volume * 100}%, rgb(55 65 81) ${volume * 100}%, rgb(55 65 81) 100%)`
            }}
          />
        </div>
      </div>
    </div>
  )
}
