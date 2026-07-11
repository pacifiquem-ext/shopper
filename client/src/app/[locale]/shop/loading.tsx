export default function LoadingShop() {
  return (
    <div className='min-h-screen bg-[#f7f7f7]'>
      <div className='mx-auto max-w-6xl px-4 py-10'>
        <div className='mb-8 space-y-3'>
          <div className='h-9 w-44 animate-pulse rounded-full bg-[#ebebeb]' />
          <div className='h-5 w-96 max-w-full animate-pulse rounded-md bg-[#ebebeb]' />
          <div className='mt-6 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end'>
            <div className='space-y-2'>
              <div className='h-4 w-24 animate-pulse rounded-md bg-[#ebebeb]' />
              <div className='h-10 w-full animate-pulse rounded-2xl bg-[#ebebeb]' />
            </div>
            <div className='h-10 w-28 animate-pulse rounded-2xl bg-[#ebebeb]' />
          </div>
        </div>

        <ul className='grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4'>
          {Array.from({ length: 12 }).map((_, i) => (
            <li
              key={i}
              className='overflow-hidden rounded-[1.6rem] border border-stroke-soft-200 bg-white/60 p-2 shadow-regular-xs backdrop-blur-md'
            >
              <div className='aspect-[4/5] w-full animate-pulse rounded-[1.25rem] bg-[#ebebeb]' />
              <div className='space-y-3 px-3 py-4'>
                <div className='h-3 w-20 animate-pulse rounded-md bg-[#ebebeb]' />
                <div className='h-4 w-3/4 animate-pulse rounded-md bg-[#ebebeb]' />
                <div className='flex items-end justify-between gap-3 pt-1'>
                  <div className='h-5 w-24 animate-pulse rounded-md bg-[#ebebeb]' />
                  <div className='h-11 w-11 animate-pulse rounded-full bg-[#ebebeb]' />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
