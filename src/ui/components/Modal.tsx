import React, { useEffect } from 'react'

export const Modal: React.FC<{
  isOpen: boolean
  onClose: () => void
  ariaLabelledBy: string
  ariaDescribedBy?: string
  children: React.ReactNode
}> = ({ isOpen, onClose, ariaLabelledBy, ariaDescribedBy, children }) => {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
