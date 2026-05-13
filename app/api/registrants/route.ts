import { NextResponse } from "next/server"

type RegistrantBody = {
  full_name?: string
  email?: string
  designation?: string
  company_name?: string
  mobile_no?: string
  allow_emails?: boolean
}

function getServiceRoleKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = getServiceRoleKey()

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { message: "Supabase configuration is missing." },
      { status: 500 }
    )
  }

  const body = (await request.json().catch(() => null)) as RegistrantBody | null

  if (!body) {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 })
  }

  const payload = {
    id: crypto.randomUUID(),
    full_name: body.full_name?.trim() ?? "",
    email: body.email?.trim() ?? "",
    designation: body.designation?.trim() ?? "",
    company_name: body.company_name?.trim() ?? "",
    mobile_no: body.mobile_no?.trim() ?? "",
    receive_updates: body.allow_emails === true,
  }
  const payloadWithoutReceiveUpdates = {
    id: payload.id,
    full_name: payload.full_name,
    email: payload.email,
    designation: payload.designation,
    company_name: payload.company_name,
    mobile_no: payload.mobile_no,
  }

  const hasEmptyField = [
    payload.full_name,
    payload.email,
    payload.designation,
    payload.company_name,
    payload.mobile_no,
  ].some((value) => value.length === 0)

  if (hasEmptyField) {
    return NextResponse.json(
      { message: "All registration fields are required." },
      { status: 400 }
    )
  }

  const endpoints = ["Registrant", "registrant", "registrants"]
  let lastErrorText = ""
  let lastStatus = 500

  for (const endpoint of endpoints) {
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    })

    if (insertResponse.ok) {
      return NextResponse.json(
        { message: "Your registration has been submitted." },
        { status: 201 }
      )
    }

    lastStatus = insertResponse.status
    const errorText = await insertResponse.text()
    lastErrorText = errorText

    if (insertResponse.status !== 404) {
      const duplicateEmail =
        errorText.includes("duplicate key") ||
        errorText.includes("unique constraint")
      const missingReceiveUpdatesColumn =
        errorText.includes("receive_updates") &&
        (errorText.includes("does not exist") || errorText.includes("column"))

      if (missingReceiveUpdatesColumn) {
        const fallbackInsertResponse = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify(payloadWithoutReceiveUpdates),
        })

        if (fallbackInsertResponse.ok) {
          return NextResponse.json(
            { message: "Your registration has been submitted." },
            { status: 201 }
          )
        }
      }

      return NextResponse.json(
        {
          message: duplicateEmail
            ? "This email is already registered."
            : "Failed to save registration.",
          details: errorText.slice(0, 300),
        },
        { status: duplicateEmail ? 409 : 500 }
      )
    }
  }

  return NextResponse.json(
    {
      message: "Failed to save registration.",
      details: `Supabase table endpoint not found. Last status: ${lastStatus}.`,
      error: lastErrorText.slice(0, 300),
    },
    { status: 500 }
  )
}

export async function GET(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = getServiceRoleKey()

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { message: "Supabase configuration is missing." },
      { status: 500 }
    )
  }

  const url = new URL(request.url)
  const pageParam = Number(url.searchParams.get("page") ?? "1")
  const limitParam = Number(url.searchParams.get("limit") ?? "10")
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 10
  const offset = (page - 1) * limit

  const endpoints = ["Registrant", "registrant", "registrants"]
  let lastErrorText = ""
  let lastStatus = 500

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/${endpoint}?select=*&limit=${limit}&offset=${offset}`,
        {
          method: "GET",
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            Prefer: "count=exact",
          },
        }
      )

      const text = await res.text()
      if (!res.ok) {
        lastStatus = res.status
        lastErrorText = text
        if (res.status !== 404) {
          return NextResponse.json(
            { message: "Failed to fetch registrants.", details: text.slice(0, 300) },
            { status: res.status }
          )
        }
        continue
      }

      // parse json
      const rawItems = JSON.parse(text || "[]")

      // normalize fields to the shape the UI expects
      const items = (rawItems as any[]).map((it) => {
        const fullName = it.full_name ?? it.fullName ?? ""
        const parts = String(fullName).trim().split(/\s+/)
        const firstName = parts.slice(0, -1).join(" ") || parts[0] || null
        const lastName = parts.length > 1 ? parts[parts.length - 1] : null
        return {
          id: it.id ?? it.uuid ?? null,
          firstName,
          lastName,
          email: it.email ?? null,
          createdAt: it.createdAt ?? it.created_at ?? null,
        }
      })

      // Try to read total from Content-Range header
      const contentRange = res.headers.get("content-range")
      let total: number | null = null
      if (contentRange) {
        // content-range format: 0-9/123
        const parts = contentRange.split("/")
        const totalPart = parts[1]
        const n = Number(totalPart)
        if (!Number.isNaN(n)) total = n
      }

      return NextResponse.json({ items, total })
    } catch (err: any) {
      lastErrorText = String(err?.message ?? err)
    }
  }

  return NextResponse.json(
    {
      message: "Failed to fetch registrants.",
      details: `Supabase table endpoint not found. Last status: ${lastStatus}.`,
      error: lastErrorText.slice(0, 300),
    },
    { status: 500 }
  )
}
