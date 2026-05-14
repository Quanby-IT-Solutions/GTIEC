import { NextResponse } from "next/server"

type RegistrantBody = {
  full_name?: string
  company_name?: string
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
    company_name: body.company_name?.trim() ?? "",
  }

  if (!payload.full_name || !payload.company_name) {
    return NextResponse.json(
      { message: "Full name and company name are required." },
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
      return NextResponse.json(
        {
          message: "Failed to save registration.",
          details: errorText.slice(0, 300),
        },
        { status: 500 }
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
  const query = (url.searchParams.get("q") ?? "").trim()
  const sortByParam = (url.searchParams.get("sortBy") ?? "createdAt").trim()
  const sortDirParam = (url.searchParams.get("sortDir") ?? "desc").trim().toLowerCase()

  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 10
  const offset = (page - 1) * limit

  const allowedSortBy = new Set(["createdAt", "full_name", "company_name"])
  const sortBy = allowedSortBy.has(sortByParam) ? sortByParam : "createdAt"
  const sortDir = sortDirParam === "asc" ? "asc" : "desc"

  const endpoints = ["Registrant", "registrant", "registrants"]
  let lastErrorText = ""
  let lastStatus = 500

  for (const endpoint of endpoints) {
    try {
      const sanitizedQuery = query.replaceAll("*", "")
      const encodedQuery = encodeURIComponent(sanitizedQuery)
      const searchFilter = query
        ? `&or=(${[
            `full_name.ilike.*${encodedQuery}*`,
            `company_name.ilike.*${encodedQuery}*`,
          ].join(",")})`
        : ""

      const res = await fetch(
        `${supabaseUrl}/rest/v1/${endpoint}?select=*&limit=${limit}&offset=${offset}&order=${sortBy}.${sortDir}${searchFilter}`,
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

      const rawItems = JSON.parse(text || "[]")
      const items = (rawItems as any[]).map((it) => ({
        id: it.id ?? it.uuid ?? null,
        full_name: it.full_name ?? it.fullName ?? null,
        fullName: it.full_name ?? it.fullName ?? null,
        company_name: it.company_name ?? null,
        companyName: it.company_name ?? null,
        createdAt: it.createdAt ?? it.created_at ?? null,
      }))

      const contentRange = res.headers.get("content-range")
      let total: number | null = null
      if (contentRange) {
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
