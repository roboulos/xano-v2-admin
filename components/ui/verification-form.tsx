'use client'

/**
 * Verification Form Component
 * Generic form builder for sign-offs and confirmations
 */

import React, { useState } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Checkbox } from './checkbox'

export interface FormField {
  id: string
  label: string
  type: 'text' | 'checkbox' | 'select' | 'textarea'
  required?: boolean
  value?: string | boolean
  options?: Array<{ label: string; value: string }>
  placeholder?: string
  description?: string
}

export interface VerificationFormProps {
  title?: string
  description?: string
  fields: FormField[]
  onSubmit: (values: Record<string, string | boolean>) => Promise<void> | void
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
  className?: string
}

export function VerificationForm({
  title,
  description,
  fields,
  onSubmit,
  submitLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onCancel,
  className = '',
}: VerificationFormProps) {
  const [values, setValues] = useState<Record<string, string | boolean>>(() => {
    const initial: Record<string, string | boolean> = {}
    for (const field of fields) {
      initial[field.id] = field.value || ''
    }
    return initial
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (fieldId: string, value: string | boolean) => {
    setValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[fieldId]
        return next
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    for (const field of fields) {
      if (field.required && !values[field.id]) {
        newErrors[field.id] = `${field.label} is required`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      console.error('Form submission error:', error)
      setErrors({
        _form: error instanceof Error ? error.message : 'Submission failed',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-6 ${className}`}>
      {(title || description) && (
        <div>
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      )}

      {errors._form && (
        <div className="p-3 border border-red-200 rounded-lg bg-red-50 text-red-700 text-sm">
          {errors._form}
        </div>
      )}

      {/* Fields */}
      <div className="flex flex-col gap-4">
        {fields.map((field) => (
          <div key={field.id} className="flex flex-col gap-2">
            <label htmlFor={field.id} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.type === 'text' && (
              <Input
                id={field.id}
                type="text"
                placeholder={field.placeholder}
                value={String(values[field.id] || '')}
                onChange={(e) => handleChange(field.id, e.target.value)}
                disabled={isSubmitting}
                className={errors[field.id] ? 'border-red-500' : ''}
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                id={field.id}
                placeholder={field.placeholder}
                value={String(values[field.id] || '')}
                onChange={(e) => handleChange(field.id, e.target.value)}
                disabled={isSubmitting}
                rows={4}
                className={`px-3 py-2 border rounded-lg text-sm ${
                  errors[field.id] ? 'border-red-500' : 'border-input'
                } focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50`}
              />
            )}

            {field.type === 'select' && (
              <select
                id={field.id}
                value={String(values[field.id] || '')}
                onChange={(e) => handleChange(field.id, e.target.value)}
                disabled={isSubmitting}
                className={`px-3 py-2 border rounded-lg text-sm ${
                  errors[field.id] ? 'border-red-500' : 'border-input'
                } focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50`}
              >
                <option value="">Select {field.label.toLowerCase()}</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}

            {field.type === 'checkbox' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  id={field.id}
                  checked={Boolean(values[field.id] === true)}
                  onCheckedChange={(checked) => handleChange(field.id, checked === true)}
                  disabled={isSubmitting}
                />
                <span className="text-sm">{field.label}</span>
              </label>
            )}

            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}

            {errors[field.id] && <p className="text-xs text-red-500">{errors[field.id]}</p>}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default VerificationForm
