'use client'

import * as React from 'react'
import { OTPInput, OTPInputContext } from 'input-otp'
import { cn } from '@/lib/utils'
import { InputOTPSlot } from './input-otp-slot'
import { InputOTPSeparator } from './input-otp-separator'

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        'flex items-center gap-2 has-disabled:opacity-50',
        containerClassName,
      )}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn('flex items-center', className)}
      {...props}
    />
  )
}

// Compose the public API: keep the original input-otp.tsx exports so
// existing imports `from '@/components/ui/input-otp'` still work. The
// split subcomponents are colocated in this barrel file but each lives
// in its own subfile so the no-multi-comp rule sees one component per
// file.
export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
