export default function LoadingShop() {
  return (
    <div className='min-h-screen bg-[#F5F1EB]'>
      <div className='mx-auto max-w-6xl px-4 py-10'>
        <div className='mb-8 space-y-3'>
          <div className='h-9 w-44 animate-pulse rounded-full bg-[#EAE4DC]' />
          <div className='h-5 w-96 max-w-full animate-pulse rounded-md bg-[#EAE4DC]' />
          <div className='mt-6 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end'>
            <div className='space-y-2'>
              <div className='h-4 w-24 animate-pulse rounded-md bg-[#EAE4DC]' />
              <div className='h-10 w-full animate-pulse rounded-2xl bg-[#EAE4DC]' />
            </div>
            <div className='h-10 w-28 animate-pulse rounded-2xl bg-[#EAE4DC]' />
          </div>
        </div>

        <ul className='grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4'>
          {Array.from({ length: 12 }).map((_, i) => (
            <li
              key={i}
              className='overflow-hidden rounded-[1.6rem] border border-[rgba(43,43,43,0.08)] bg-white/60 p-2 shadow-[0_1px_2px_rgba(43,43,43,0.03)] backdrop-blur-md'
            >
              <div className='aspect-[4/5] w-full animate-pulse rounded-[1.25rem] bg-[#EAE4DC]' />
              <div className='space-y-3 px-3 py-4'>
                <div className='h-3 w-20 animate-pulse rounded-md bg-[#EAE4DC]' />
                <div className='h-4 w-3/4 animate-pulse rounded-md bg-[#EAE4DC]' />
                <div className='flex items-end justify-between gap-3 pt-1'>
                  <div className='h-5 w-24 animate-pulse rounded-md bg-[#EAE4DC]' />
                  <div className='h-11 w-11 animate-pulse rounded-full bg-[#EAE4DC]' />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
