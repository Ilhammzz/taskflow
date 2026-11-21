'use client'

import * as React from 'react'
import { CheckCircle2, Circle, Plus, Trash2, ListTodo, Moon, Sun, Monitor, Sparkles } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type Priority = 'low' | 'medium' | 'high'

type Task = {
  id: string
  text: string
  completed: boolean
  priority: Priority
  createdAt: number
}

type Filter = 'all' | 'active' | 'completed'

const STORAGE_KEY = 'taskflow.tasks.v1'

const priorityMeta: Record<Priority, { label: string; className: string; dot: string }> = {
  high: {
    label: 'High',
    className: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
  medium: {
    label: 'Medium',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  low: {
    label: 'Low',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

export default function Home() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [mounted, setMounted] = React.useState(false)

  const [tasks, setTasks] = React.useState<Task[]>([])
  const [text, setText] = React.useState('')
  const [priority, setPriority] = React.useState<Priority>('medium')
  const [filter, setFilter] = React.useState<Filter>('all')

  // Load from localStorage on mount
  React.useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Task[]
        if (Array.isArray(parsed)) setTasks(parsed)
      }
    } catch {
      // ignore malformed storage
    }
  }, [])

  // Persist to localStorage on change
  React.useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      // storage might be unavailable (private mode) — silently ignore
    }
  }, [tasks, mounted])

  const addTask = () => {
    const trimmed = text.trim()
    if (!trimmed) {
      toast({
        title: 'Task is empty',
        description: 'Type something before adding a task.',
        variant: 'destructive',
      })
      return
    }
    const newTask: Task = {
      id: uid(),
      text: trimmed,
      completed: false,
      priority,
      createdAt: Date.now(),
    }
    setTasks((prev) => [newTask, ...prev])
    setText('')
    toast({ title: 'Task added', description: `"${trimmed}" added to your list.` })
  }

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    toast({ title: 'Task removed' })
  }

  const clearCompleted = () => {
    const count = tasks.filter((t) => t.completed).length
    if (count === 0) {
      toast({ title: 'Nothing to clear', description: 'No completed tasks yet.' })
      return
    }
    setTasks((prev) => prev.filter((t) => !t.completed))
    toast({ title: 'Cleared completed', description: `${count} task${count > 1 ? 's' : ''} removed.` })
  }

  const filtered = React.useMemo(() => {
    const sorted = [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      const order = { high: 0, medium: 1, low: 2 }
      if (order[a.priority] !== order[b.priority]) return order[a.priority] - order[b.priority]
      return b.createdAt - a.createdAt
    })
    if (filter === 'active') return sorted.filter((t) => !t.completed)
    if (filter === 'completed') return sorted.filter((t) => t.completed)
    return sorted
  }, [tasks, filter])

  const stats = React.useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.completed).length
    const active = total - completed
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100)
    return { total, completed, active, pct }
  }, [tasks])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTask()
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50/40 via-background to-background dark:from-emerald-950/20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/30">
              <ListTodo className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-semibold tracking-tight">TaskFlow</h1>
              <p className="text-xs text-muted-foreground">Minimal task manager</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Toggle theme">
                {mounted && theme === 'dark' ? (
                  <Moon className="h-4 w-4" />
                ) : mounted && theme === 'light' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Monitor className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="mr-2 h-4 w-4" /> System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Stay focused. Get it done.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            A clean place for your tasks. Everything is saved in your browser — no account, no servers.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <StatCard label="Total" value={stats.total} accent="text-foreground" />
          <StatCard label="Active" value={stats.active} accent="text-emerald-600 dark:text-emerald-400" />
          <StatCard label="Done" value={stats.completed} accent="text-muted-foreground" />
        </div>

        {/* Progress */}
        {stats.total > 0 && (
          <div className="mb-6">
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span className="font-medium tabular-nums">{stats.pct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${stats.pct}%` }}
              />
            </div>
          </div>
        )}

        {/* Add task */}
        <Card className="mb-6 border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Add a new task..."
                className="flex-1"
                aria-label="New task"
              />
              <div className="flex items-center gap-2">
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger className="w-[130px]" aria-label="Priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High priority</SelectItem>
                    <SelectItem value="medium">Medium priority</SelectItem>
                    <SelectItem value="low">Low priority</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addTask} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="mr-1.5 h-4 w-4" /> Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter + clear */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Done</TabsTrigger>
            </TabsList>
          </Tabs>
          {stats.completed > 0 && (
            <Button variant="ghost" size="sm" onClick={clearCompleted}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Clear done
            </Button>
          )}
        </div>

        {/* Task list */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <EmptyState filter={filter} hasTasks={tasks.length > 0} />
          ) : (
            filtered.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => toggleTask(task.id)}
                onDelete={() => deleteTask(task.id)}
              />
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/60 bg-background/60">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-between gap-1 px-4 py-5 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
          <p className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            TaskFlow — your tasks stay private in your browser.
          </p>
          <p>Built with Next.js &amp; shadcn/ui</p>
        </div>
      </footer>
    </div>
  )
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent: string
}) {
  return (
    <Card className="border-border/60 shadow-none">
      <CardContent className="px-3 py-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className={cn('mt-0.5 text-2xl font-bold tabular-nums', accent)}>{value}</p>
      </CardContent>
    </Card>
  )
}

function TaskItem({
  task,
  onToggle,
  onDelete,
}: {
  task: Task
  onToggle: () => void
  onDelete: () => void
}) {
  const meta = priorityMeta[task.priority]
  return (
    <Card
      className={cn(
        'group border-border/60 shadow-none transition-colors hover:bg-muted/40',
        task.completed && 'opacity-60'
      )}
    >
      <CardContent className="flex items-center gap-3 p-3.5">
        <button
          onClick={onToggle}
          className="shrink-0 rounded-md transition-transform hover:scale-110 active:scale-95"
          aria-label={task.completed ? 'Mark as not done' : 'Mark as done'}
        >
          {task.completed ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground/60" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'truncate text-sm font-medium',
              task.completed && 'line-through decoration-muted-foreground/50'
            )}
          >
            {task.text}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium', meta.className)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
              {meta.label}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {new Date(task.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
          onClick={onDelete}
          aria-label="Delete task"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

function EmptyState({ filter, hasTasks }: { filter: Filter; hasTasks: boolean }) {
  const messages: Record<Filter, { title: string; desc: string }> = {
    all: {
      title: hasTasks ? 'No tasks here yet' : 'Your list is empty',
      desc: hasTasks
        ? 'Add a new task above to get started.'
        : 'Add your first task above and start getting things done.',
    },
    active: {
      title: 'All caught up!',
      desc: 'You have no active tasks. Time for a break.',
    },
    completed: {
      title: 'Nothing completed yet',
      desc: 'Completed tasks will show up here.',
    },
  }
  const m = messages[filter]
  return (
    <Card className="border-dashed border-border/60 shadow-none">
      <CardContent className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          <ListTodo className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium">{m.title}</p>
        <p className="max-w-xs text-xs text-muted-foreground">{m.desc}</p>
      </CardContent>
    </Card>
  )
}
