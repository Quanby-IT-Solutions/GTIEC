"use client"

import { useState } from "react"

import { registerRegistrant, type RegistrantPayload } from "@/hooks/registration-http"

type FormState = {
  full_name: string
  company_name: string
  contact_no: string
  email: string
  receive_mail: boolean
}

const initialState: FormState = {
  full_name: "",
  company_name: "",
  contact_no: "",
  email: "",
  receive_mail: false,
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
      company_name: form.company_name.trim(),
      contact_no: form.contact_no.trim(),
      email: form.email.trim(),
      receive_mail: form.receive_mail,
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
