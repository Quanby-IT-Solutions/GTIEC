import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

type RegistrantBody = {
  full_name?: string
  company_name?: string
}

type DeleteBody = {
  id?: string
  ids?: string[]
}

type MarkPrintedBody = {
  id?: string
  ids?: string[]
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as RegistrantBody | null

  if (!body) {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 })
  }

  const full_name = body.full_name?.trim() ?? ""
  const company_name = body.company_name?.trim() ?? ""

  if (!full_name || !company_name) {
    return NextResponse.json(
      { message: "Full name and company name are required." },
      { status: 400 }
    )
  }

  try {
    await prisma.registrant.create({
      data: {
        full_name,
        company_name,
      },
    })

    return NextResponse.json(
      { message: "Your registration has been submitted." },
      { status: 201 }
    )
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: "Failed to save registration.",
        details: String(error).slice(0, 300),
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const pageParam = Number(url.searchParams.get("page") ?? "1")
  const limitParam = Number(url.searchParams.get("limit") ?? "10")
  const query = (url.searchParams.get("q") ?? "").trim()
  const sortByParam = (url.searchParams.get("sortBy") ?? "createdAt").trim()
  const sortDirParam = (url.searchParams.get("sortDir") ?? "desc").trim().toLowerCase()

  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 10
  const skip = (page - 1) * limit

  const allowedSortBy = new Set(["createdAt", "full_name", "company_name"])
  const sortBy = allowedSortBy.has(sortByParam) ? sortByParam : "createdAt"
  const sortDir = sortDirParam === "asc" ? "asc" : "desc"

  try {
    const where = query
      ? {
          OR: [
            { full_name: { contains: query, mode: "insensitive" as const } },
            { company_name: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : undefined

    const [items, total] = await Promise.all([
      prisma.registrant.findMany({
        where,
        select: {
          id: true,
          full_name: true,
          company_name: true,
          printedAt: true,
        },
        orderBy: {
          [sortBy]: sortDir,
        },
        skip,
        take: limit,
      }),
      prisma.registrant.count({ where }),
    ])

    return NextResponse.json({
      items: items.map((it) => ({
        id: it.id,
        full_name: it.full_name,
        fullName: it.full_name,
        company_name: it.company_name,
        companyName: it.company_name,
        printedAt: it.printedAt,
      })),
      total,
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: "Failed to fetch registrants.",
        details: String(error).slice(0, 300),
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as MarkPrintedBody | null
  if (!body) {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 })
  }

  const rawIds = [
    ...(body.id ? [body.id] : []),
    ...((body.ids ?? []).filter((value): value is string => typeof value === "string")),
  ]
  const ids = [...new Set(rawIds.map((id) => id.trim()).filter(Boolean))]

  if (ids.length === 0) {
    return NextResponse.json({ message: "At least one registrant id is required." }, { status: 400 })
  }

  try {
    const result = await prisma.registrant.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        printedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: ids.length === 1 ? "Registrant marked as printed." : "Registrants marked as printed.",
      updatedCount: result.count,
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: "Failed to mark registrant(s) as printed.",
        details: String(error).slice(0, 300),
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => null)) as DeleteBody | null
  if (!body) {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 })
  }

  const rawIds = [
    ...(body.id ? [body.id] : []),
    ...((body.ids ?? []).filter((value): value is string => typeof value === "string")),
  ]

  const ids = [...new Set(rawIds.map((id) => id.trim()).filter(Boolean))]
  if (ids.length === 0) {
    return NextResponse.json({ message: "At least one registrant id is required." }, { status: 400 })
  }

  try {
    const result = await prisma.registrant.deleteMany({
      where: {
        id: { in: ids },
      },
    })

    return NextResponse.json({
      message: ids.length === 1 ? "Registrant deleted." : "Registrants deleted.",
      deletedCount: result.count,
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: "Failed to delete registrant(s).",
        details: String(error).slice(0, 300),
      },
      { status: 500 }
    )
  }
}
