export type RegistrantPayload = {
  full_name: string
  company_name: string
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
