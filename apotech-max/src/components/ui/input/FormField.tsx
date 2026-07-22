import * as React from 'react'
import { cn } from '@/lib/cn'
import { Label } from './Label'

export interface FormFieldProps {
  /** Label text. If omitted, no label is rendered. */
  label?: React.ReactNode
  /** Mark the field as required (asterisk + html5 hint). */
  required?: boolean
  /** Add "(Opsional)" suffix to the label. */
  optional?: boolean
  /** Help text shown under the input (gray). Hidden when `error` is set. */
  helpText?: React.ReactNode
  /** Error text shown under the input (red). Takes precedence over `helpText`. */
  error?: React.ReactNode
  /**
   * Input id. If omitted, an auto-generated id is used so `<Label>` and
   * `aria-describedby` wiring works.
   */
  htmlFor?: string
  className?: string
  children: React.ReactElement
}

/**
 * FormField — wraps a single input control with a label, optional help text,
 * and error message. Wires up `id`, `aria-invalid`, and `aria-describedby`
 * automatically.
 *
 *     <FormField label="Lot size" required helpText="Jumlah unit dalam lot">
 *       <Input name="lotSize" type="number" />
 *     </FormField>
 */
export function FormField({
  label,
  required,
  optional,
  helpText,
  error,
  htmlFor,
  className,
  children
}: FormFieldProps) {
  const reactId = React.useId()
  const id = htmlFor ?? (children.props as { id?: string }).id ?? reactId
  const descriptionId = helpText || error ? `${id}-desc` : undefined

  // Clone the child input to inject id + aria wiring.
  const child = React.cloneElement(children, {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': descriptionId,
    'aria-required': required || undefined,
    required,
    // Propagate the variant when an error exists.
    variant: error ? 'error' : (children.props as { variant?: string }).variant
  } as Record<string, unknown>)

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <Label htmlFor={id} required={required} optional={optional}>
          {label}
        </Label>
      )}
      {child}
      {(error || helpText) && (
        <p
          id={descriptionId}
          className={cn(
            'text-xs leading-relaxed',
            error
              ? 'text-[color:var(--color-danger)]'
              : 'text-[color:var(--color-fg-muted)]'
          )}
        >
          {error || helpText}
        </p>
      )}
    </div>
  )
}
