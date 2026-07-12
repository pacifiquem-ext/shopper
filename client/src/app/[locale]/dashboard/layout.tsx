import React from 'react'
import { DashboardSidebar } from '@/components/dashboard/shared/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard/shared/dashboard-header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg-weak-50">
      <DashboardSidebar />
      <div className="relative flex h-full min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto outline-none">
          <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
