import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let parser: PDFParse | undefined;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please select a PDF file." },
        { status: 400 }
      );
    }

    if (file.size === 0 || file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "PDF must be non-empty and smaller than 10 MB." },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Please upload a PDF file." },
        { status: 400 }
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const signature = new TextDecoder().decode(bytes.slice(0, 5));

    if (signature !== "%PDF-") {
      return NextResponse.json(
        { error: "The selected file is not a valid PDF." },
        { status: 400 }
      );
    }

    parser = new PDFParse({ data: bytes });

    const result = await parser.getText();
    const extractedText = result.text.trim();

    if (!extractedText) {
      return NextResponse.json(
        {
          error:
            "No selectable text found. This PDF may be scanned and need OCR.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      characters: extractedText.length,
      text: extractedText.slice(0, 200000),
      message: "PDF text extracted successfully.",
    });
  } catch (error) {
    console.error("PDF extraction error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown PDF extraction error",
      },
      { status: 500 }
    );
  } finally {
    if (parser) {
      await parser.destroy().catch((error) => {
        console.error("PDF parser cleanup error:", error);
      });
    }
  }
}
