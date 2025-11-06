
"use client"
import * as React from "react"

type TabsContextType = { value: string; setValue: (v: string) => void }
const TabsCtx = React.createContext<TabsContextType | null>(null)

export function Tabs({ defaultValue, className="", children }: { defaultValue: string, className?: string, children: React.ReactNode }) {
  const [value, setValue] = React.useState(defaultValue)
  return <div className={className}><TabsCtx.Provider value={{value, setValue}}>{children}</TabsCtx.Provider></div>
}
export function TabsList({ className="", children }: { className?: string, children: React.ReactNode }) {
  return <div className={`inline-grid gap-1 p-1 bg-white ${className}`}>{children}</div>
}
export function TabsTrigger({ value, className="", children }: { value: string, className?: string, children: React.ReactNode }) {
  const ctx = React.useContext(TabsCtx)!
  const active = ctx.value === value
  return (
    <button onClick={() => ctx.setValue(value)} className={`px-3 py-2 rounded-xl text-sm border ${active ? "bg-[#282a3b] text-white" : "bg-transparent"} ${className}`}>
      {children}
    </button>
  )
}
export function TabsContent({ value, className="", children }: { value: string, className?: string, children: React.ReactNode }) {
  const ctx = React.useContext(TabsCtx)!
  if (ctx.value !== value) return null
  return <div className={className}>{children}</div>
}
