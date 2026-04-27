import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { messages, systemLogs } from "@/db/schema";
import { desc } from "drizzle-orm";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are JARVIS — Mark III. The most advanced AI desktop assistant ever built.
You are brilliant, fast, witty, and capable of almost anything.

You understand English, Arabic (Darija included), and French perfectly.
Detect the user's language and always reply in the SAME language.

══ STRICT RESPONSE FORMAT ══
Respond ONLY with valid JSON. Zero extra text. Zero markdown fences.

{
  "action": "<action>",
  "target": "<value>",
  "message": "<cool jarvis reply>",
  "extra": {},
  "confirm_required": false,
  "speak": "<short version of message to speak aloud — max 20 words>"
}

══ ALL ACTIONS ══

SYSTEM:
  open_app       → target = app command
  open_url       → target = full https:// URL
  system_cmd     → target = screenshot|shutdown|reboot|lock|sleep|logout
  volume         → target = up|down|mute|0-100
  brightness     → target = up|down|0-100
  terminal_cmd   → target = shell command
  kill_app       → target = process name

FILES:
  browse_files   → target = path
  analyze_file   → target = path
  create_file    → target = path, extra={"content":"..."}
  delete_file    → target = path, confirm_required=true
  find_files     → target = search term

PRODUCTIVITY:
  add_task       → target = title, extra={"priority":"high|medium|low","due":"optional"}
  list_tasks     → target = all|pending|done
  complete_task  → target = id or keyword
  delete_task    → target = id or keyword
  add_note       → target = title, extra={"content":"...","tags":"optional"}
  list_notes     → target = "" or tag
  add_reminder   → target = text, extra={"time":"HH:MM","date":"YYYY-MM-DD"}
  list_reminders → target = ""
  set_timer      → target = seconds, extra={"label":"timer label"}

CODE & DEV:
  write_code     → target = language, extra={"task":"description","code":"FULL working code"}
  debug_code     → target = language, extra={"error":"...","code":"...","fix":"fixed code","explanation":"..."}
  git_cmd        → target = git command

INFORMATION:
  get_weather    → target = city name
  get_time       → target = city (optional)
  system_info    → target = cpu|ram|disk|network|all
  chat           → target = "", full intelligent answer in message

NATURAL LANGUAGE MASTERY:
- "I wanna see YouTube" → open_url https://youtube.com
- "fire up chrome" → open_app google-chrome
- "write a Python Discord bot" → write_code python
- "what's the weather in Casablanca?" → get_weather
- "شنو هو الذكاء الاصطناعي" → chat (reply in Arabic)
- "ouvre Firefox" → open_app firefox (reply in French)

RESPONSE RULES:
- confirm_required=true for: delete, shutdown, reboot, send messages, run scripts, destructive terminal
- speak field: short TTS-friendly version (20 words max), same language as user
- write_code extra.code: REAL, complete, working code always
- Be witty, cool, futuristic. Tony Stark's AI.
- NEVER break JSON. NEVER add text outside JSON.`;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
    }

    // Save user message
    await db.insert(messages).values({
      role: "user",
      content: message,
      action: "user_input",
    });

    // Build messages for Groq
    const chatMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history || []).slice(-20).map((h: { role: string; content: string }) => ({
        role: h.role,
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: chatMessages,
        max_tokens: 2500,
        temperature: 0.12,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const raw = data.choices[0].message.content.trim();

    let parsed: Record<string, unknown> = {
      action: "chat",
      target: "",
      message: raw,
      extra: {},
      confirm_required: false,
      speak: raw.slice(0, 80),
    };

    try {
      // Remove markdown fences if present
      let cleanRaw = raw;
      if (cleanRaw.includes("```")) {
        const parts = cleanRaw.split("```");
        for (const part of parts) {
          const p = part.trim().replace(/^json\s*/, "").trim();
          try {
            parsed = JSON.parse(p);
            break;
          } catch {
            continue;
          }
        }
      } else {
        parsed = JSON.parse(cleanRaw);
      }
    } catch {
      // Use default parsed with raw message
    }

    // Save assistant message
    await db.insert(messages).values({
      role: "assistant",
      content: String(parsed.message || raw),
      action: String(parsed.action || "chat"),
      rawJson: JSON.stringify(parsed),
    });

    // Log to system logs
    await db.insert(systemLogs).values({
      event: String(parsed.action || "chat"),
      details: String(parsed.message || "").slice(0, 500),
      level: "info",
    });

    return NextResponse.json({ result: parsed, raw });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  try {
    const history = await db
      .select()
      .from(messages)
      .orderBy(desc(messages.createdAt))
      .limit(50);
    return NextResponse.json({ messages: history.reverse() });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}
