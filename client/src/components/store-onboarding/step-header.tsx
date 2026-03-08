'use client'

export function StepHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-10 text-center md:mb-12">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-5xl">{title}</h1>
      {subtitle && <p className="mt-4 text-lg text-gray-500">{subtitle}</p>}
    </div>
  )
}
