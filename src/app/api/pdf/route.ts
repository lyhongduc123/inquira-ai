// src/app/api/pdf/route.ts
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 })
  }

  const res = await fetch(url)

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch PDF" }, { status: 500 })
  }

  return new NextResponse(res.body, {
    headers: {
      "Content-Type": "application/pdf",
    },
  })
}
