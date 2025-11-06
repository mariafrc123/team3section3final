
import * as React from "react"
export function Input({ className="", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`h-9 rounded-xl border px-3 text-sm ${className}`} {...props} />
}
