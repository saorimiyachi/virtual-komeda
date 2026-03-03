'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

export default function SoundControl() {
  const [isOn, setIsOn] = useState(false)
  const [volume, setVolume] = useState(50)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio('/cafe-ambient.mp3')
    audio.loop = true
    audio.volume = volume / 100
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  const handleToggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (!isOn) {
      audio.play()
      setIsOn(true)
    } else {
      audio.pause()
      setIsOn(false)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const vol = value[0]
    setVolume(vol)
    if (audioRef.current) {
      audioRef.current.volume = vol / 100
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className={`text-lg hover:bg-transparent ${isOn ? 'text-neutral-700' : 'text-neutral-300'}`}
      >
        {isOn ? '🔊' : '🔇'}
      </Button>
      <Slider
        value={[volume]}
        onValueChange={handleVolumeChange}
        disabled={!isOn}
        min={0}
        max={100}
        className="w-28"
      />
      <span className="text-xs text-neutral-500">店内の環境音</span>
    </div>
  )
}
