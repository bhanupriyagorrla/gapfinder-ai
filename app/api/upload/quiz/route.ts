
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const topic = String(body.topic ?? body.subject ?? "General knowledge");

    return NextResponse.json({
      quiz: [
        {
          question: `What is the best first step when studying ${topic}?`,
          options: [
            "Understand the basic concepts",
            "Skip directly to the exam",
            "Avoid practising",
            "Ignore difficult topics"
          ],
          answer: "Understand the basic concepts"
        }
      ]
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
