import { NextResponse } from "next/server";
import { db } from "@/db";
import { systemLogs } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const logs = await db
    .select()
    .from(systemLogs)
    .orderBy(desc(systemLogs.createdAt))
    .limit(20);
  return NextResponse.json({ logs });
}
