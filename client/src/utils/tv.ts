import { createTV } from 'tailwind-variants'

export type { VariantProps, ClassValue } from 'tailwind-variants'
export const tv = createTV({
  twMerge: true,
  twMergeConfig: {
    theme: {
      borderRadius: ['10', '20'],
    },
  },
})
