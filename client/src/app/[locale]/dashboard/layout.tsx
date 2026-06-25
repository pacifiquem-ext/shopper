import React from 'react'
import { DashboardSidebar } from '@/components/dashboard/shared/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard/shared/dashboard-header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-brand-50 font-sans">
      <DashboardSidebar />
      <main className="relative flex h-full w-full flex-1 flex-col overflow-y-auto bg-brand-50">
        <DashboardHeader />
        <div className="mx-auto h-full w-full max-w-7xl flex-1 p-8 pb-12">{children}</div>
      </main>
    </div>
  )
}
