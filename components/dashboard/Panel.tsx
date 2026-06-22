import { ReactNode } from 'react'

interface PanelProps {
  title?: string
  badge?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function Panel({ title, badge, action, children, className = '' }: PanelProps) {
  return (
    <div className={`glass p-4 flex flex-col gap-3 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {title && (
              <span className="text-[10px] font-semibold tracking-widest uppercase text-[var(--color-ink-3)]">
                {title}
              </span>
            )}
            {badge}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
