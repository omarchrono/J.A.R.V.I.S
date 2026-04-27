import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const all = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  return NextResponse.json({ tasks: all });
}

export async function POST(req: NextRequest) {
  const { title, priority, due } = await req.json();
  const [task] = await db.insert(tasks).values({
    title,
    priority: priority || "medium",
    due: due || "",
  }).returning();
  return NextResponse.json({ task });
}

export async function PATCH(req: NextRequest) {
  const { id, done } = await req.json();
  const [task] = await db
    .update(tasks)
    .set({ done, completedAt: done ? new Date() : null })
    .where(eq(tasks.id, id))
    .returning();
  return NextResponse.json({ task });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.delete(tasks).where(eq(tasks.id, id));
  return NextResponse.json({ success: true });
}
