'use client'

export function StepHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8 text-center md:mb-10">
      <h1 className="text-balance text-title-h4 text-text-strong-950 md:text-title-h3">{title}</h1>
      {subtitle ? (
        <p className="mx-auto mt-3 max-w-lg text-pretty text-paragraph-md text-text-sub-600">
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
