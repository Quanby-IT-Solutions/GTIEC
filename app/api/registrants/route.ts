import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

type RegistrantBody = {
  full_name?: string
  company_name?: string
  contact_no?: string
  email?: string
  receive_mail?: boolean
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
  const contact_no = body.contact_no?.trim() ?? ""
  const email = body.email?.trim() ?? ""
  const receive_mail = Boolean(body.receive_mail)

  if (!full_name || !company_name || !contact_no || !email) {
    return NextResponse.json(
      { message: "Full name, company name, contact no, and email are required." },
      { status: 400 }
    )
  }

  try {
    await prisma.registrant.create({
      data: {
        full_name,
        company_name,
        contact_no,
        email,
        receive_mail,
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
  const dateParam = (url.searchParams.get("date") ?? "").trim()
  const sortByParam = (url.searchParams.get("sortBy") ?? "createdAt").trim()
  const sortDirParam = (url.searchParams.get("sortDir") ?? "desc").trim().toLowerCase()

  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 10
  const skip = (page - 1) * limit

  const allowedSortBy = new Set(["createdAt", "full_name", "company_name", "contact_no", "email"])
  const sortBy = allowedSortBy.has(sortByParam) ? sortByParam : "createdAt"
  const sortDir = sortDirParam === "asc" ? "asc" : "desc"

  try {
    const where: {
      OR?: Array<
        | { full_name: { contains: string; mode: "insensitive" } }
        | { company_name: { contains: string; mode: "insensitive" } }
        | { contact_no: { contains: string; mode: "insensitive" } }
        | { email: { contains: string; mode: "insensitive" } }
      >
      createdAt?: { gte: Date; lt: Date }
    } = {}

    if (query) {
      where.OR = [
        { full_name: { contains: query, mode: "insensitive" } },
        { company_name: { contains: query, mode: "insensitive" } },
        { contact_no: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ]
    }

    if (dateParam) {
      const start = new Date(`${dateParam}T00:00:00`)
      const end = new Date(`${dateParam}T23:59:59.999`)
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
        where.createdAt = {
          gte: start,
          lt: end,
        }
      }
    }

    const [items, total] = await Promise.all([
      prisma.registrant.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        select: {
          id: true,
          createdAt: true,
          full_name: true,
          company_name: true,
          contact_no: true,
          email: true,
          receive_mail: true,
          printedAt: true,
        },
        orderBy: {
          [sortBy]: sortDir,
        },
        skip,
        take: limit,
      }),
      prisma.registrant.count({
        where: Object.keys(where).length > 0 ? where : undefined,
      }),
    ])

    return NextResponse.json({
      items: items.map((it) => ({
        id: it.id,
        createdAt: it.createdAt,
        full_name: it.full_name,
        fullName: it.full_name,
        company_name: it.company_name,
        companyName: it.company_name,
        contact_no: it.contact_no,
        contactNo: it.contact_no,
        email: it.email,
        receive_mail: it.receive_mail,
        receiveMail: it.receive_mail,
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
