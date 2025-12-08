import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import ensureUser from "@/lib/ensureUser";

// Lightweight Clerk webhook receiver for local/dev. This will upsert user
// records on `user.created` and `user.updated`, and delete on `user.deleted`.
// Security: In production you should validate Clerk's webhook signature.

export async function POST(request) {
  try {
    const body = await request.json();

    // Clerk typically sends events with a `type` and `data` payload.
    // For a user.created event the payload shape used in your Inngest functions
    // appears to be { id, first_name, last_name, email_address, image_url }
    const type = body.type || body.event || (body?.data?.type);
    const data = body.data || body;

    console.log("[clerk-webhook] received event:", type);

    if (!type) return NextResponse.json({ ok: false, reason: "no event type" }, { status: 400 });

    if (type.includes("user.created") || type.includes("user.created")) {
      // when a user is created, call ensureUser to upsert
      const userId = data?.id || data?.user?.id || data?.user_id;
      if (!userId) return NextResponse.json({ ok: false, reason: "no user id" }, { status: 400 });
      await ensureUser(userId);
      return NextResponse.json({ ok: true });
    }

    if (type.includes("user.updated")) {
      const userId = data?.id || data?.user?.id || data?.user_id;
      if (!userId) return NextResponse.json({ ok: false, reason: "no user id" }, { status: 400 });
      await ensureUser(userId);
      return NextResponse.json({ ok: true });
    }

    if (type.includes("user.deleted")) {
      const userId = data?.id || data?.user?.id || data?.user_id;
      if (!userId) return NextResponse.json({ ok: false, reason: "no user id" }, { status: 400 });
      await prisma.user.deleteMany({ where: { id: userId } });
      return NextResponse.json({ ok: true });
    }

    // unknown event — return 204 so clerk doesn't retry excessively
    return NextResponse.json({ ok: true, ignored: true }, { status: 204 });
  } catch (err) {
    console.error("clerk-webhook error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
