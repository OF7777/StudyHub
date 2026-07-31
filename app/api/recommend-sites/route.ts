import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { subject } = await req.json();

  if (!subject || typeof subject !== "string") {
    return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  }

  const prompt = `Recommend 5 high-quality websites or online resources for studying "${subject}". Return ONLY a valid JSON array of objects, each with "name" (the website name), "url" (full URL), and "description" (1 sentence about what it offers). No markdown, no code fences, just raw JSON.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const text = completion.choices[0]?.message?.content || "[]";

  try {
    const sites = JSON.parse(text);
    return NextResponse.json({ sites });
  } catch {
    return NextResponse.json({ error: "Failed to parse response", raw: text }, { status: 500 });
  }
}
