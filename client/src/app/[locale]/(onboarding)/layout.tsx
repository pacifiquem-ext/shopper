import type React from 'react'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-weak-50 text-text-strong-950">
      {children}
    </div>
  )
}
