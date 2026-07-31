import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { essay } = await req.json();

  if (!essay || typeof essay !== "string") {
    return NextResponse.json({ error: "Essay text is required" }, { status: 400 });
  }

  const prompt = `You are an expert writing editor. Analyze the following essay and provide specific, actionable suggestions for improvement. Focus on grammar, clarity, style, and flow.

Return your response as a JSON array of objects. Each object should have:
- "original": the exact text from the essay that needs improvement (must match exactly)
- "replacement": your suggested replacement text
- "reason": a brief explanation of why this change improves the essay
- "type": one of "grammar", "style", "clarity", "flow", or "wording"

If the essay is already excellent, return an empty array.

Essay to analyze:
"""
${essay}
"""

Return ONLY the JSON array, no markdown formatting or code blocks.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const text = completion.choices[0]?.message?.content || "[]";

  try {
    const suggestions = JSON.parse(text);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ error: "Failed to parse suggestions", raw: text }, { status: 500 });
  }
}
