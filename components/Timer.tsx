'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const PRESETS = [
  { label: '作業25分／休憩5分', work: 25 * 60, break: 5 * 60 },
  { label: '作業52分／休憩17分', work: 52 * 60, break: 17 * 60 },
]

function playAlarm() {
  try {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.type = 'sine'
    oscillator.frequency.value = 660
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 1.5)
  } catch {
    // AudioContext非対応環境では無視
  }
}

type Props = {
  taskName?: string
  onModeChange?: (mode: 'work' | 'break', pomodoroCount: number) => void
}

export default function Timer({ taskName = '今日のタスクを入力', onModeChange }: Props) {
  const [presetIndex, setPresetIndex] = useState(0)
  const [mode, setMode] = useState<'work' | 'break'>('work')
  const [timeLeft, setTimeLeft] = useState(PRESETS[0].work)
  const [isRunning, setIsRunning] = useState(false)
  const [pomodoroCount, setPomodoroCount] = useState(0)

  const currentPreset = PRESETS[presetIndex]

  // カウントダウン
  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning])

  // タイマーが0になったらアラームを鳴らしてストップ
  const handleTimerEnd = useCallback(() => {
    playAlarm()
    setIsRunning(false)
    if (mode === 'work') {
      const newCount = pomodoroCount + 1
      setPomodoroCount(newCount)
      setMode('break')
      setTimeLeft(currentPreset.break)
      onModeChange?.('break', newCount)
    } else {
      setMode('work')
      setTimeLeft(currentPreset.work)
      onModeChange?.('work', pomodoroCount)
    }
  }, [mode, pomodoroCount, currentPreset, onModeChange])

  useEffect(() => {
    if (timeLeft !== 0 || !isRunning) return
    handleTimerEnd()
  }, [timeLeft, isRunning, handleTimerEnd])

  const handleStartPause = () => {
    setIsRunning(prev => !prev)
  }

  const handleReset = () => {
    setIsRunning(false)
    setMode('work')
    setTimeLeft(currentPreset.work)
  }

  const handlePresetChange = (index: number) => {
    setPresetIndex(index)
    setIsRunning(false)
    setMode('work')
    setTimeLeft(PRESETS[index].work)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* モード表示 */}
      <Badge
        className={
          mode === 'work'
            ? 'bg-orange-100 text-orange-800 hover:bg-orange-100 text-sm px-4 py-1'
            : 'bg-sky-100 text-sky-700 hover:bg-sky-100 text-sm px-4 py-1'
        }
      >
        {mode === 'work' ? '作業に集中' : '休憩中'}
      </Badge>

      {/* タイマー */}
      <div className="text-8xl font-bold text-neutral-900 tabular-nums tracking-tight">
        {formatTime(timeLeft)}
      </div>

      {/* プリセット切り替え */}
      <div className="flex gap-2">
        {PRESETS.map((preset, i) => (
          <Button
            key={i}
            variant="outline"
            onClick={() => handlePresetChange(i)}
            className={
              presetIndex === i
                ? 'rounded-full bg-neutral-700 text-white border-neutral-700 hover:bg-neutral-800 hover:text-white'
                : 'rounded-full border-neutral-200 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-800'
            }
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* 操作ボタン */}
      <div className="flex flex-col items-center gap-3">
        <Button
          onClick={handleStartPause}
          className="w-48 rounded-full bg-amber-700 hover:bg-amber-800 text-white"
        >
          {isRunning ? '⏸ 一時停止' : '▶ スタート'}
        </Button>
        <Button
          variant="ghost"
          onClick={handleReset}
          className="text-neutral-400 hover:text-neutral-700 hover:bg-transparent"
        >
          リセット
        </Button>
      </div>

      {/* タスク名・ポモドーロ数 */}
      <div className="text-center">
        <p className="text-neutral-700 text-sm">📝 {taskName}</p>
        <p className="text-neutral-400 text-xs mt-1">今日 {pomodoroCount} 杯目</p>
      </div>
    </div>
  )
}
