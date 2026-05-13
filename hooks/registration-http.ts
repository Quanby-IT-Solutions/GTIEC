export type RegistrantPayload = {
  full_name: string
  email: string
  designation: string
  company_name: string
  mobile_no: string
  allow_emails: boolean
}

type RegisterResult = {
  ok: boolean
  message: string
}

export async function registerRegistrant(
  payload: RegistrantPayload
): Promise<RegisterResult> {
  const response = await fetch('/api/registrants', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = (await response.json().catch(() => null)) as
    | { message?: string; details?: string; error?: string }
    | null

  if (!response.ok) {
    return {
      ok: false,
      message:
        data?.details
          ? `${data?.message ?? "Unable to submit registration."} ${data.details}`
          : (data?.message ?? "Unable to submit registration."),
    }
  }

  return {
    ok: true,
    message: data?.message ?? 'Registration submitted successfully.',
  }
}

export type Registrant = {
  id: string
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  createdAt?: string | null
}

export async function getRegistrants(page = 1, limit = 10): Promise<{ items: Registrant[]; total: number | null }> {
  const res = await fetch(`/api/registrants?page=${page}&limit=${limit}`)
  if (!res.ok) {
    throw new Error('Failed to fetch registrants')
  }
  const json = await res.json()
  return {
    items: json.items ?? [],
    total: typeof json.total === 'number' ? json.total : null,
  }
}

import { useEffect, useState } from 'react'

export function useRegistrants(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)
  const [items, setItems] = useState<Registrant[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    getRegistrants(page, limit)
      .then((r) => {
        if (!mounted) return
        setItems(r.items)
        setTotal(r.total)
      })
      .catch((e) => {
        if (!mounted) return
        setError(String(e?.message ?? e))
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [page, limit])

  return { items, total, page, setPage, limit, setLimit, loading, error }
}
