
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const subject = String(body.subject ?? "Your subject").trim();

    return NextResponse.json({
      plan: [
        { day: 1, task: `Review the fundamentals of ${subject}.` },
        { day: 2, task: `Study important concepts in ${subject}.` },
        { day: 3, task: `Practise questions on ${subject}.` },
        { day: 4, task: `Revise and test your understanding of ${subject}.` }
      ]
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
