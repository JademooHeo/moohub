'use client';

import { useState, useEffect, useRef } from 'react';

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'moohub-todos';
const LAST_RESET_KEY = 'moohub-todos-last-reset';

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10); // yyyy-MM-dd
}

function loadTodos(): TodoItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    let todos: TodoItem[] = data ? JSON.parse(data) : [];

    // 자정 자동 리셋: 날짜가 바뀌면 완료된 항목 삭제
    const lastReset = localStorage.getItem(LAST_RESET_KEY);
    const today = getTodayStr();
    if (lastReset && lastReset !== today) {
      const before = todos.length;
      todos = todos.filter((t) => !t.done);
      if (todos.length !== before) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      }
    }
    localStorage.setItem(LAST_RESET_KEY, today);

    return todos;
  } catch {
    return [];
  }
}

function saveTodos(todos: TodoItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export default function TodoWidget() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTodos(loadTodos());
  }, []);

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text,
      done: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [newTodo, ...todos];
    setTodos(updated);
    saveTodos(updated);
    setInput('');
    inputRef.current?.focus();
  };

  const toggleTodo = (id: string) => {
    const updated = todos.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    );
    setTodos(updated);
    saveTodos(updated);
  };

  const deleteTodo = (id: string) => {
    const updated = todos.filter((t) => t.id !== id);
    setTodos(updated);
    saveTodos(updated);
  };

  const clearDone = () => {
    const updated = todos.filter((t) => !t.done);
    setTodos(updated);
    saveTodos(updated);
  };

  const filtered = todos.filter((t) => {
    if (filter === 'active') return !t.done;
    if (filter === 'done') return t.done;
    return true;
  });

  const doneCount = todos.filter((t) => t.done).length;
  const totalCount = todos.length;
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">✅</span>
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            할 일
          </h2>
          {totalCount > 0 && (
            <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[11px] font-bold tabular-nums text-indigo-500">
              {doneCount}/{totalCount}
            </span>
          )}
        </div>
        {doneCount > 0 && (
          <button
            onClick={clearDone}
            className="text-[11px] text-gray-400 transition-colors hover:text-red-400"
          >
            완료 삭제
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-gray-200/50 dark:bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Input */}
      <div className="mb-3 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          placeholder="할 일을 입력하세요"
          className="glass-input flex-1 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:text-white"
        />
        <button
          onClick={addTodo}
          disabled={!input.trim()}
          className="glass-btn shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:transform-none disabled:shadow-none"
        >
          추가
        </button>
      </div>

      {/* Filter Tabs */}
      {totalCount > 0 && (
        <div className="mb-2 flex gap-1 rounded-lg bg-gray-900/[0.03] p-0.5 dark:bg-white/[0.03]">
          {(['all', 'active', 'done'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 rounded-md py-1 text-[11px] font-medium transition-all ${
                filter === f
                  ? 'bg-white text-gray-800 shadow-sm dark:bg-white/10 dark:text-white'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {f === 'all' ? '전체' : f === 'active' ? '진행 중' : '완료'}
            </button>
          ))}
        </div>
      )}

      {/* Todo List */}
      <div className="max-h-48 space-y-0.5 overflow-y-auto">
        {filtered.length === 0 && totalCount === 0 && (
          <div className="py-6 text-center">
            <span className="mb-1 block text-2xl">📋</span>
            <p className="text-xs text-gray-400">할 일을 추가해보세요!</p>
          </div>
        )}
        {filtered.length === 0 && totalCount > 0 && (
          <div className="py-4 text-center">
            <p className="text-xs text-gray-400">
              {filter === 'active' ? '모두 완료했어요! 🎉' : '완료한 일이 없어요'}
            </p>
          </div>
        )}
        {filtered.map((todo) => (
          <div
            key={todo.id}
            className="group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-900/[0.03] dark:hover:bg-white/[0.03]"
          >
            {/* Checkbox */}
            <button
              onClick={() => toggleTodo(todo.id)}
              className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-all ${
                todo.done
                  ? 'border-indigo-500 bg-indigo-500 text-white'
                  : 'border-gray-300 hover:border-indigo-400 dark:border-gray-600'
              }`}
            >
              {todo.done && (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            {/* Text */}
            <span
              className={`flex-1 text-sm transition-all ${
                todo.done
                  ? 'text-gray-400 line-through dark:text-gray-500'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {todo.text}
            </span>

            {/* Delete */}
            <button
              onClick={() => deleteTodo(todo.id)}
              className="shrink-0 text-gray-300 opacity-40 transition-opacity group-hover:opacity-100 hover:text-red-400 dark:text-gray-600 md:opacity-0"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
