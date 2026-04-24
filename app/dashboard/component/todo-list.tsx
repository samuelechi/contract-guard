"use client";

import { useState } from "react";
import { toggleTodo, addTodo, deleteTodo } from "../todo-actions";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";

type Todo = { id: string; task: string; isDone: boolean };

export default function TodoList({ initialTodos, userId }: { initialTodos: Todo[]; userId: string }) {
    const [taskInput, setTaskInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async (id: string, currentStatus: boolean) => {
        await toggleTodo(id, !currentStatus);
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskInput.trim()) return;
        setIsLoading(true);
        await addTodo(userId, taskInput);
        setTaskInput("");
        setIsLoading(false);
    };

    return (
        <div className="space-y-3">
            <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                {initialTodos.length === 0 ? (
                    <div className="text-center py-6">
                        <CheckCircle2 className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-400 dark:text-slate-500">All caught up! No tasks.</p>
                    </div>
                ) : (
                    initialTodos.map((todo) => (
                        <div key={todo.id} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#1a2235] group transition-colors">
                            <label className="flex items-center gap-3 cursor-pointer flex-1">
                                <div
                                    onClick={() => handleToggle(todo.id, todo.isDone)}
                                    className={`w-4.5 h-4.5 rounded-md border shrink-0 flex items-center justify-center cursor-pointer transition-all ${todo.isDone
                                            ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-400 dark:border-emerald-500'
                                            : 'border-slate-300 dark:border-[#263652] hover:border-blue-400 dark:hover:border-blue-500/50'
                                        }`}
                                >
                                    {todo.isDone && (
                                        <svg className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`text-sm transition-all ${todo.isDone ? "line-through text-slate-300 dark:text-slate-600" : "text-slate-700 dark:text-slate-300"}`}>
                                    {todo.task}
                                </span>
                            </label>
                            <button
                                onClick={() => deleteTodo(todo.id)}
                                className="opacity-0 group-hover:opacity-100 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-all shrink-0"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))
                )}
            </div>
            <form onSubmit={handleAdd} className="flex gap-2 pt-3 border-t border-slate-100 dark:border-[#1e2d45]">
                <input
                    type="text"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-1 text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-[#1a2235] border border-slate-200 dark:border-[#263652] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-400 dark:focus:border-blue-500/50 transition-colors"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !taskInput.trim()}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </form>
        </div>
    );
}