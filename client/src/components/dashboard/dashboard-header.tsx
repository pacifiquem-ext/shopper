'use client'

import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function DashboardHeader() {
  return (
    <header className="flex h-20 w-full items-center justify-between bg-white px-8 py-4">
      <div className="flex w-1/3 items-center">
        {/* We can add a mobile menu toggle here in the future if needed */}
      </div>

      <div className="flex w-1/3 items-center justify-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search"
            className="focus-visible:ring-brand-500 w-full rounded-full border-gray-200 bg-gray-50 pr-4 pl-10"
          />
        </div>
      </div>

      <div className="flex w-1/3 items-center justify-end gap-3">
        <button className="bg-brand-900 hover:bg-brand-800 relative flex h-9 w-9 items-center justify-center rounded-full text-white shadow-sm transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500"></span>
        </button>
      </div>
    </header>
  )
}
