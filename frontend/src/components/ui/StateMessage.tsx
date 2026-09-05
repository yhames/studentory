import type { ReactNode } from 'react'

interface StateMessageProps {
  icon: string
  title: string
  description: string
  action?: ReactNode
  compact?: boolean
}

export function StateMessage({
  icon,
  title,
  description,
  action,
  compact = false,
}: StateMessageProps) {
  return (
    <div className={`state-message ${compact ? 'compact' : ''}`} role="status">
      <span className="state-icon" aria-hidden="true">{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      {action !== undefined ? <div className="state-action">{action}</div> : null}
    </div>
  )
}
