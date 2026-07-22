import * as React from 'react'
import { cn } from '@/lib/cn'
import { inputVariants, type InputVariantProps } from './Input.variants'

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    InputVariantProps {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, variant, size, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(inputVariants({ variant, size }), className)}
      {...rest}
    />
  )
})

/* -------------------------------------------------------------------------- */
/*  Select — same visual envelope as Input.                                   */
/* -------------------------------------------------------------------------- */

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    InputVariantProps {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, variant, size, children, ...rest },
  ref
) {
  return (
    <select
      ref={ref}
      className={cn(inputVariants({ variant, size }), 'pr-8 appearance-none cursor-pointer', className)}
      {...rest}
    >
      {children}
    </select>
  )
})

/* -------------------------------------------------------------------------- */
/*  Textarea                                                                  */
/* -------------------------------------------------------------------------- */

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    InputVariantProps {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, variant, size, rows = 4, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(inputVariants({ variant, size }), 'h-auto py-2 resize-y', className)}
        {...rest}
      />
    )
  }
)
