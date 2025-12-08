import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import ensureUser from "@/lib/ensureUser";
import { clerkClient } from "@clerk/nextjs/server";

// Admin endpoint to help debug missing users.
// GET: returns last N DB users (for inspection)
// POST: accepts { clerkUserIds: string[] } and returns which are missing from DB
// POST with { userId } will upsert that single user (calls ensureUser)

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || 50);

    const users = await prisma.user.findMany({ take: limit, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ count: users.length, users });
  } catch (err) {
    console.error("missing-users GET error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // If single userId provided, upsert that user via ensureUser
    if (body.userId) {
      const res = await ensureUser(body.userId);
      return NextResponse.json({ ok: true, user: res });
    }

    const clerkUserIds = body.clerkUserIds;
    if (!Array.isArray(clerkUserIds)) {
      return NextResponse.json({ ok: false, reason: "provide clerkUserIds array or a userId" }, { status: 400 });
    }

    // Find which IDs are missing locally
    const existing = await prisma.user.findMany({ where: { id: { in: clerkUserIds } }, select: { id: true } });
    const present = new Set(existing.map((u) => u.id));
    const missing = clerkUserIds.filter((id) => !present.has(id));

    return NextResponse.json({ ok: true, missing, presentCount: existing.length });
  } catch (err) {
    console.error("missing-users POST error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
