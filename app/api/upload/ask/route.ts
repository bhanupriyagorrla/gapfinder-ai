
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = String(body.question ?? body.message ?? "").trim();

    if (!question) {
      return NextResponse.json(
        { error: "Please enter a question." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      answer:
        "Your question is: " +
        question +
        ". Review your study material, identify the key concepts, and practise with examples. For a personalized AI answer, an AI provider API must be configured."
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
