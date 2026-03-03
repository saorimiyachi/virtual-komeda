'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function EntryPage() {
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [taskName, setTaskName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleEnter = async () => {
    if (!nickname.trim() || isLoading) return
    setIsLoading(true)

    // 古いセッションが残っていれば削除
    const oldSessionId = localStorage.getItem('sessionId')
    if (oldSessionId) {
      await supabase.from('sessions').delete().eq('id', oldSessionId)
      localStorage.removeItem('sessionId')
    }

    const sessionId = crypto.randomUUID()

    const { error } = await supabase.from('sessions').insert({
      id: sessionId,
      nickname: nickname.trim(),
      task_name: taskName.trim(),
      status: 'working',
      pomodoro_count: 0,
    })

    if (error) {
      console.error('セッションの作成に失敗しました:', error)
      setIsLoading(false)
      return
    }

    localStorage.setItem('sessionId', sessionId)
    localStorage.setItem('nickname', nickname.trim())
    localStorage.setItem('taskName', taskName.trim())
    router.push('/room')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-orange-50">
      <div className="flex flex-col items-center gap-8 w-full max-w-sm px-6">
        {/* ロゴ */}
        <div className="text-center">
          <p className="text-4xl mb-2">☕</p>
          <h1 className="text-2xl font-bold text-neutral-900">virtual komeda</h1>
          <p className="text-sm text-neutral-500 mt-1">バーチャルコメダで集中だ</p>
        </div>

        {/* 入力フォーム */}
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nickname" className="text-neutral-800 text-xs">ニックネーム</Label>
            <Input
              id="nickname"
              placeholder="おなまえ(ニックネーム)"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              maxLength={20}
              className="border-orange-200 focus-visible:ring-orange-400 text-neutral-900 placeholder:text-gray-400 bg-white"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="taskName" className="text-neutral-800 text-xs">今日のタスク <span className="text-neutral-400">（任意）</span></Label>
            <Input
              id="taskName"
              placeholder="例：資料をつくる"
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              maxLength={50}
              className="border-orange-200 focus-visible:ring-orange-400 text-neutral-900 placeholder:text-gray-400 bg-white"
            />
          </div>
        </div>

        {/* 入場ボタン */}
        <Button
          onClick={handleEnter}
          disabled={!nickname.trim() || isLoading}
          className="w-full rounded-full bg-amber-700 hover:bg-amber-800 text-white"
        >
          {isLoading ? '入店中...' : '入店して集中する'}
        </Button>

      </div>
    </div>
  )
}
