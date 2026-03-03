'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Session } from '@/types/session'
import Timer from '@/components/Timer'
import CafeList from '@/components/CafeList'
import SoundControl from '@/components/SoundControl'

export default function RoomPage() {
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [taskName, setTaskName] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [sessions, setSessions] = useState<Session[]>([])

  // localStorageからセッション情報を読み込み
  useEffect(() => {
    const savedSessionId = localStorage.getItem('sessionId')
    const savedNickname = localStorage.getItem('nickname')
    if (!savedSessionId || !savedNickname) {
      router.replace('/')
      return
    }
    setSessionId(savedSessionId)
    setNickname(savedNickname)
    setTaskName(localStorage.getItem('taskName') ?? '')
  }, [router])

  // Supabaseのセッション一覧をリアルタイム購読
  useEffect(() => {
    if (!sessionId) return

    // 2分以内に生存確認があったセッションのみ取得
    const fetchSessions = async () => {
      const twoMinutesAgo = new Date(Date.now() - 45 * 1000).toISOString()
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .gt('last_seen_at', twoMinutesAgo)
        .order('created_at')
      if (data) setSessions(data as Session[])
    }
    fetchSessions()

    // リアルタイム購読
    const channel = supabase
      .channel('sessions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sessions' }, payload => {
        setSessions(prev => [...prev, payload.new as Session])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions' }, payload => {
        setSessions(prev => prev.map(s => s.id === payload.new.id ? payload.new as Session : s))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'sessions' }, payload => {
        setSessions(prev => prev.filter(s => s.id !== payload.old.id))
      })
      .subscribe()

    // ポーリング（5秒ごとに再取得・TTLフィルタを適用）
    const pollingInterval = setInterval(fetchSessions, 5000)

    return () => {
      clearInterval(pollingInterval)
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  // ハートビート（30秒ごとにlast_seen_atを更新）
  useEffect(() => {
    if (!sessionId) return

    const heartbeat = async () => {
      await supabase
        .from('sessions')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', sessionId)
    }
    heartbeat()
    const interval = setInterval(heartbeat, 15000)

    return () => clearInterval(interval)
  }, [sessionId])

  // タイマーのモード切り替え時にSupabaseを更新
  const handleModeChange = useCallback(async (mode: 'work' | 'break', pomodoroCount: number) => {
    if (!sessionId) return
    const status = mode === 'work' ? 'working' : 'break'
    await supabase.from('sessions').update({ status, pomodoro_count: pomodoroCount }).eq('id', sessionId)
  }, [sessionId])

  // 退店
  const handleExit = async () => {
    if (sessionId) {
      await supabase.from('sessions').delete().eq('id', sessionId)
    }
    localStorage.removeItem('sessionId')
    localStorage.removeItem('nickname')
    localStorage.removeItem('taskName')
    localStorage.removeItem('pomodoroCount')
    router.push('/')
  }

  if (!nickname) return null

  return (
    <div className="flex flex-col h-screen bg-orange-50">
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-orange-100">
        <span className="font-bold text-neutral-900">☕ virtual komeda</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-700">{nickname}</span>
          <button
            onClick={handleExit}
            className="text-sm text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            退店
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="flex flex-1 overflow-hidden">
        {/* タイマーエリア */}
        <div className="flex-1 flex items-center justify-center p-8">
          <Timer taskName={taskName} onModeChange={handleModeChange} />
        </div>

        {/* カフェリスト */}
        <div className="w-80 border-l border-orange-100 overflow-y-auto bg-white">
          <CafeList sessions={sessions} mySessionId={sessionId} />
        </div>
      </div>

      {/* 環境音コントロール */}
      <div className="border-t border-orange-100 bg-white px-6 py-3">
        <SoundControl />
      </div>
    </div>
  )
}
