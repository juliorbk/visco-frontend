'use client'

import * as React from 'react'
import { MinusIcon } from '@heroicons/react/24/outline'

function InputOTPSeparator({ ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  )
}

export { InputOTPSeparator }
