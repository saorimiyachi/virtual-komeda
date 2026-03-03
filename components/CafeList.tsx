'use client'

import { useMemo } from 'react'
import { Session } from '@/types/session'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const TARGET_TOTAL = 0

const ALL_DUMMIES: Omit<Session, 'created_at'>[] = [
  { id: 'dummy-1', nickname: 'たろう', task_name: '資料作成', status: 'working', pomodoro_count: 2 },
  { id: 'dummy-2', nickname: 'はなこ', task_name: 'コード書き', status: 'break', pomodoro_count: 4 },
  { id: 'dummy-3', nickname: 'ゆうき', task_name: '企画書まとめ', status: 'working', pomodoro_count: 1 },
  { id: 'dummy-4', nickname: 'みか', task_name: 'デザイン確認', status: 'working', pomodoro_count: 3 },
  { id: 'dummy-5', nickname: 'けんじ', task_name: '読書', status: 'working', pomodoro_count: 5 },
  { id: 'dummy-6', nickname: 'あかり', task_name: '勉強中', status: 'break', pomodoro_count: 2 },
  { id: 'dummy-7', nickname: 'そうた', task_name: 'メール整理', status: 'working', pomodoro_count: 1 },
  { id: 'dummy-8', nickname: 'なつき', task_name: '報告書作成', status: 'working', pomodoro_count: 3 },
  { id: 'dummy-9', nickname: 'りょう', task_name: 'ちょっと一息', status: 'break', pomodoro_count: 2 },
]

type Props = {
  sessions: Session[]
  mySessionId: string
}

export default function CafeList({ sessions, mySessionId }: Props) {
  const dummies = useMemo(() => {
    const count = Math.max(0, TARGET_TOTAL - sessions.length)
    return ALL_DUMMIES.slice(0, count)
  }, [sessions.length])

  const totalCount = sessions.length + dummies.length

  const renderCard = (
    id: string,
    nickname: string,
    status: 'working' | 'break',
    taskName: string,
    pomodoroCount: number,
    isMe: boolean
  ) => (
    <Card
      key={id}
      className={`shadow-none ${isMe ? 'border-orange-400 bg-orange-50' : 'border-orange-100'}`}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-neutral-900 text-sm">
            {nickname}
            {isMe && <span className="ml-1 text-xs text-neutral-400">（あなた）</span>}
          </span>
          <Badge
            className={
              status === 'working'
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-100 text-xs'
                : 'bg-sky-100 text-sky-700 hover:bg-sky-100 text-xs'
            }
          >
            {status === 'working' ? '作業に集中' : '休憩中'}
          </Badge>
        </div>
        <p className="text-xs text-neutral-600 truncate">{taskName || '（タスクなし）'}</p>
        <p className="text-xs text-neutral-400 mt-0.5">{pomodoroCount} 杯目</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-4">
      <h2 className="font-medium text-neutral-900 mb-4">
        ☕ 店内（{totalCount}人）
      </h2>
      <div className="flex flex-col gap-2">
        {sessions.map(s =>
          renderCard(s.id, s.nickname, s.status, s.task_name, s.pomodoro_count, s.id === mySessionId)
        )}
        {dummies.map(d =>
          renderCard(d.id, d.nickname, d.status, d.task_name, d.pomodoro_count, false)
        )}
      </div>
    </div>
  )
}
