"use client"

import { useState } from "react"

import { registerRegistrant, type RegistrantPayload } from "@/hooks/registration-http"

type FormState = {
  full_name: string
  email: string
  designation: string
  company_name: string
  mobile_no: string
  allow_emails: boolean
}

const initialState: FormState = {
  full_name: "",
  email: "",
  designation: "",
  company_name: "",
  mobile_no: "",
  allow_emails: false,
}

export function useRegistrantRegistration() {
  const [form, setForm] = useState<FormState>(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const submit = async () => {
    setIsSubmitting(true)
    setMessage(null)
    setError(null)

    const payload: RegistrantPayload = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      designation: form.designation.trim(),
      company_name: form.company_name.trim(),
      mobile_no: form.mobile_no.trim(),
      allow_emails: form.allow_emails,
    }

    const result = await registerRegistrant(payload)

    if (!result.ok) {
      setError(result.message)
      setIsSubmitting(false)
      return
    }

    setMessage(result.message)
    setForm(initialState)
    setIsSubmitting(false)
  }

  return {
    form,
    setField,
    submit,
    isSubmitting,
    message,
    error,
  }
}
