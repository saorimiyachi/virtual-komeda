export type Session = {
  id: string
  nickname: string
  task_name: string
  status: 'working' | 'break'
  pomodoro_count: number
  created_at: string
}
