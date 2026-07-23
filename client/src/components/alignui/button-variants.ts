import { tv, type VariantProps } from '@/utils/tv'

export const buttonVariants = tv({
  slots: {
    root: [
      'group relative inline-flex items-center justify-center whitespace-nowrap outline-none',
      'transition duration-200 ease-out cursor-pointer',
      'focus:outline-none',
      'disabled:pointer-events-none disabled:bg-bg-weak-50 disabled:text-text-disabled-300 disabled:ring-transparent',
    ],
    icon: 'flex size-5 shrink-0 items-center justify-center',
  },
  variants: {
    variant: {
      primary: {},
      neutral: {},
      error: {},
    },
    mode: {
      filled: {},
      stroke: { root: 'ring-1 ring-inset' },
      lighter: { root: 'ring-1 ring-inset' },
      ghost: { root: 'ring-1 ring-inset' },
    },
    size: {
      medium: {
        root: 'h-10 gap-3 rounded-10 px-3.5 text-label-sm',
        icon: '-mx-1',
      },
      small: {
        root: 'h-9 gap-3 rounded-lg px-3 text-label-sm',
        icon: '-mx-1',
      },
      xsmall: {
        root: 'h-8 gap-2.5 rounded-lg px-2.5 text-label-sm',
        icon: '-mx-1',
      },
      xxsmall: {
        root: 'h-7 gap-2.5 rounded-lg px-2 text-label-sm',
        icon: '-mx-1',
      },
    },
  },
  compoundVariants: [
    {
      variant: 'primary',
      mode: 'filled',
      class: {
        root: [
          'bg-primary-base text-static-white shadow-regular-xs',
          'hover:bg-primary-darker',
          'focus-visible:shadow-button-primary-focus',
        ],
      },
    },
    {
      variant: 'primary',
      mode: 'stroke',
      class: {
        root: [
          'bg-bg-white-0 text-primary-base ring-primary-base',
          'hover:bg-primary-alpha-10 hover:ring-transparent',
          'focus-visible:shadow-button-primary-focus',
        ],
      },
    },
    {
      variant: 'primary',
      mode: 'lighter',
      class: {
        root: [
          'bg-primary-alpha-10 text-primary-base ring-transparent',
          'hover:bg-bg-white-0 hover:ring-primary-base',
          'focus-visible:shadow-button-primary-focus',
        ],
      },
    },
    {
      variant: 'primary',
      mode: 'ghost',
      class: {
        root: [
          'bg-transparent text-primary-base ring-transparent',
          'hover:bg-primary-alpha-10',
          'focus-visible:shadow-button-primary-focus',
        ],
      },
    },
    {
      variant: 'neutral',
      mode: 'filled',
      class: {
        root: [
          'bg-bg-strong-950 text-static-white',
          'hover:bg-bg-surface-800',
          'focus-visible:shadow-button-important-focus',
        ],
      },
    },
    {
      variant: 'neutral',
      mode: 'stroke',
      class: {
        root: [
          'bg-bg-white-0 text-text-sub-600 shadow-regular-xs ring-stroke-soft-200',
          'hover:bg-bg-weak-50 hover:text-text-strong-950 hover:shadow-none hover:ring-transparent',
          'focus-visible:text-text-strong-950 focus-visible:shadow-button-important-focus focus-visible:ring-stroke-strong-950',
        ],
      },
    },
    {
      variant: 'neutral',
      mode: 'lighter',
      class: {
        root: [
          'bg-bg-weak-50 text-text-sub-600 ring-transparent',
          'hover:bg-bg-white-0 hover:text-text-strong-950 hover:shadow-regular-xs hover:ring-stroke-soft-200',
          'focus-visible:bg-bg-white-0 focus-visible:text-text-strong-950 focus-visible:shadow-button-important-focus focus-visible:ring-stroke-strong-950',
        ],
      },
    },
    {
      variant: 'neutral',
      mode: 'ghost',
      class: {
        root: [
          'bg-transparent text-text-sub-600 ring-transparent',
          'hover:bg-bg-weak-50 hover:text-text-strong-950',
          'focus-visible:bg-bg-white-0 focus-visible:text-text-strong-950 focus-visible:shadow-button-important-focus focus-visible:ring-stroke-strong-950',
        ],
      },
    },
    {
      variant: 'error',
      mode: 'filled',
      class: {
        root: [
          'bg-error-base text-static-white',
          'hover:bg-red-700',
          'focus-visible:shadow-button-error-focus',
        ],
      },
    },
    {
      variant: 'error',
      mode: 'stroke',
      class: {
        root: [
          'bg-bg-white-0 text-error-base ring-error-base',
          'hover:bg-error-alpha-10 hover:ring-transparent',
          'focus-visible:shadow-button-error-focus',
        ],
      },
    },
    {
      variant: 'error',
      mode: 'lighter',
      class: {
        root: [
          'bg-error-alpha-10 text-error-base ring-transparent',
          'hover:bg-bg-white-0 hover:ring-error-base',
          'focus-visible:bg-bg-white-0 focus-visible:shadow-button-error-focus focus-visible:ring-error-base',
        ],
      },
    },
    {
      variant: 'error',
      mode: 'ghost',
      class: {
        root: [
          'bg-transparent text-error-base ring-transparent',
          'hover:bg-error-alpha-10',
          'focus-visible:shadow-button-error-focus',
        ],
      },
    },
  ],
  defaultVariants: {
    variant: 'primary',
    mode: 'filled',
    size: 'medium',
  },
})

export type ButtonVariantProps = VariantProps<typeof buttonVariants>
