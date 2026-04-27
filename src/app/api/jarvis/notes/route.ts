import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const all = await db.select().from(notes).orderBy(desc(notes.createdAt));
  return NextResponse.json({ notes: all });
}

export async function POST(req: NextRequest) {
  const { title, content, tags } = await req.json();
  const [note] = await db.insert(notes).values({ title, content, tags: tags || "" }).returning();
  return NextResponse.json({ note });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.delete(notes).where(eq(notes.id, id));
  return NextResponse.json({ success: true });
}
