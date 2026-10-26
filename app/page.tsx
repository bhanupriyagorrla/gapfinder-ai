
"use client";

import { useState } from "react";

type Topic = {
  name: string;
  subject: string;
  score: number;
  level: "Weak" | "Medium" | "Strong";
};

const initialTopics: Topic[] = [
  { name: "Introduction to AI", subject: "Artificial Intelligence", score: 85, level: "Strong" },
  { name: "Neural Networks", subject: "Deep Learning", score: 62, level: "Medium" },
  { name: "Backpropagation", subject: "Deep Learning", score: 32, level: "Weak" },
  { name: "Decision Trees", subject: "Machine Learning", score: 45, level: "Weak" },
];

type ExtractedDocument = {
  fileName: string;
  text: string;
  characters: number;
};

export default function Home() {
  const [active, setActive] = useState("Overview");
  const [material, setMaterial] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [documents, setDocuments] = useState<ExtractedDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const [topics] = useState<Topic[]>(initialTopics);

  const weakCount = topics.filter((topic) => topic.level === "Weak").length;
  const strongCount = topics.filter((topic) => topic.level === "Strong").length;

  function handleFiles(files: FileList | null) {
    if (!files) return;

    const pdfFiles = Array.from(files).filter((file) =>
      file.name.toLowerCase().endsWith(".pdf")
    );

    if (pdfFiles.length !== files.length) {
      setMessage("Only PDF files are supported right now.");
    } else {
      setMessage(`${pdfFiles.length} PDF file(s) selected.`);
    }

    setSelectedFiles(pdfFiles);
    setDocuments([]);
  }

  async function prepareMaterials() {
    if (selectedFiles.length === 0) {
      setMessage("Please select at least one PDF file first.");
      return;
    }

    setIsProcessing(true);
    setMessage("Uploading and extracting your PDF files...");
    setDocuments([]);

    try {
      const results: ExtractedDocument[] = [];

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            `${file.name}: ${result.error || "PDF processing failed."}`
          );
        }

        results.push({
          fileName: result.fileName || file.name,
          text: result.text || "",
          characters: result.characters || 0,
        });
      }

      setDocuments(results);

      const totalCharacters = results.reduce(
        (total, document) => total + document.characters,
        0
      );

      setMessage(
        `Success! Extracted ${totalCharacters.toLocaleString()} characters from ${results.length} PDF file(s).`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while extracting your PDFs."
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 md:flex">
      <aside className="w-full border-b border-slate-200 bg-white p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white">
            G
          </div>
          <div>
            <h1 className="text-xl font-bold">GapFinder AI</h1>
            <p className="text-xs text-slate-500">Study smarter, not longer</p>
          </div>
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Workspace
        </p>

        <nav className="flex gap-2 overflow-x-auto md:flex-col">
          {["Overview", "Study Materials", "Knowledge Gaps", "Revision Plan"].map(
            (item) => (
              <button
                key={item}
                onClick={() => setActive(item)}
                className={`shrink-0 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  active === item
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-indigo-50"
                }`}
              >
                {item === "Overview" && "▦ "}
                {item === "Study Materials" && "▤ "}
                {item === "Knowledge Gaps" && "◉ "}
                {item === "Revision Plan" && "☷ "}
                {item}
              </button>
            )
          )}
        </nav>

        <div className="mt-8 rounded-2xl bg-indigo-50 p-4">
          <p className="font-semibold text-indigo-900">Your goal</p>
          <p className="mt-1 text-sm leading-6 text-indigo-800">
            Find what you don&apos;t know before your next exam.
          </p>
        </div>
      </aside>

      <section className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              Your personal learning workspace
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight">{active}</h2>
          </div>

          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
            ✦ AI study assistant
          </div>
        </header>

        {active === "Overview" && (
          <>
            <div className="mb-8 rounded-3xl bg-gradient-to-r from-indigo-700 to-violet-600 p-7 text-white sm:p-9">
              <p className="text-sm font-medium text-indigo-100">
                PERSONALIZED LEARNING
              </p>
              <h3 className="mt-3 max-w-xl text-3xl font-bold sm:text-4xl">
                Discover your gaps. Build your confidence.
              </h3>
              <p className="mt-3 max-w-xl leading-7 text-indigo-100">
                Upload your study material, take a diagnostic quiz, and focus
                your revision on the topics that need the most attention.
              </p>
              <button
                onClick={() => setActive("Study Materials")}
                className="mt-6 rounded-xl bg-white px-5 py-3 font-semibold text-indigo-700 hover:bg-indigo-50"
              >
                Add study materials →
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Topics mapped", value: String(topics.length), icon: "▤" },
                { label: "Strong topics", value: String(strongCount), icon: "✓" },
                { label: "Topics to improve", value: String(weakCount), icon: "↗" },
                { label: "Documents extracted", value: String(documents.length), icon: "▧" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <p className="text-2xl text-indigo-600">{stat.icon}</p>
                  <p className="mt-4 text-3xl font-bold">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-lg font-bold">Knowledge snapshot</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Example scores only. These are not yet based on quiz answers.
                </p>

                <div className="mt-6 space-y-5">
                  {topics.map((topic) => (
                    <div key={topic.name}>
                      <div className="mb-2 flex justify-between gap-3 text-sm">
                        <span className="font-medium">{topic.name}</span>
                        <span className="text-slate-500">{topic.score}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            topic.level === "Strong"
                              ? "bg-emerald-500"
                              : topic.level === "Medium"
                                ? "bg-amber-500"
                                : "bg-rose-500"
                          }`}
                          style={{ width: `${topic.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-lg font-bold">Recommended next steps</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Example revision priorities.
                </p>

                <div className="mt-5 space-y-3">
                  {[
                    ["01", "Revise Backpropagation", "High priority · 25 min"],
                    ["02", "Practice Decision Trees", "High priority · 20 min"],
                    ["03", "Review Neural Networks", "Medium priority · 15 min"],
                  ].map(([number, title, detail]) => (
                    <div
                      key={number}
                      className="flex gap-4 rounded-xl bg-slate-50 p-4"
                    >
                      <span className="font-bold text-indigo-600">{number}</span>
                      <div>
                        <p className="font-semibold">{title}</p>
                        <p className="mt-1 text-sm text-slate-500">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setActive("Revision Plan")}
                  className="mt-5 font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  View revision plan →
                </button>
              </div>
            </div>
          </>
        )}

        {active === "Study Materials" && (
          <div className="max-w-3xl">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h3 className="text-xl font-bold">Upload your study materials</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Choose syllabus documents, textbook chapters, class notes, or
                past question papers. This version extracts text from PDFs.
              </p>

              <label className="mt-6 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-10 text-center hover:bg-indigo-50">
                <span className="text-4xl text-indigo-600">⇧</span>
                <span className="mt-3 font-semibold">Choose PDF files</span>
                <span className="mt-2 text-sm text-slate-500">
                  Select one or more PDFs from your computer
                </span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  className="mt-5 block max-w-full text-sm"
                  onChange={(event) => handleFiles(event.target.files)}
                />
              </label>

              {selectedFiles.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold">Selected files</h4>
                  <ul className="mt-3 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <li
                        key={`${file.name}-${index}`}
                        className="break-words rounded-lg bg-slate-50 p-3 text-sm"
                      >
                        ▤ {file.name}{" "}
                        <span className="text-slate-500">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <label className="mt-6 block text-sm font-semibold">
                Subject or syllabus name
                <input
                  value={material}
                  onChange={(event) => setMaterial(event.target.value)}
                  placeholder="e.g. Deep Learning — Unit III"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>

              <button
                onClick={prepareMaterials}
                disabled={isProcessing}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isProcessing ? "Extracting PDF text..." : "Prepare materials →"}
              </button>

              {message && (
                <p
                  role="status"
                  className="mt-4 break-words rounded-xl bg-indigo-50 p-4 text-sm text-indigo-800"
                >
                  {message}
                </p>
              )}

              {documents.length > 0 && (
                <div className="mt-6 space-y-5">
                  {documents.map((document) => (
                    <div
                      key={document.fileName}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <h4 className="break-words font-bold">
                        {document.fileName}
                      </h4>
                      <p className="mt-1 text-sm text-slate-500">
                        {document.characters.toLocaleString()} characters extracted
                      </p>
                      <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white p-4 text-sm leading-6">
                        {document.text || "No text was returned."}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {active === "Knowledge Gaps" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-xl font-bold">Topic-level diagnosis</h3>
            <p className="mt-2 text-sm text-slate-500">
              These sample ratings will eventually be replaced with evidence
              from your diagnostic quiz answers.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {topics.map((topic) => (
                <div
                  key={topic.name}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      topic.level === "Strong"
                        ? "bg-emerald-100 text-emerald-700"
                        : topic.level === "Medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {topic.level}
                  </span>
                  <h4 className="mt-4 font-bold">{topic.name}</h4>
                  <p className="mt-1 text-sm text-slate-500">{topic.subject}</p>
                  <p className="mt-3 text-2xl font-bold">{topic.score}%</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {topic.level === "Weak"
                      ? "Suggested action: review the fundamentals and practice questions."
                      : topic.level === "Medium"
                        ? "Suggested action: practice more questions to improve confidence."
                        : "Suggested action: revise periodically to retain your knowledge."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {active === "Revision Plan" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-xl font-bold">Your revision plan</h3>
            <p className="mt-2 text-sm text-slate-500">
              This is a sample plan. Later, it will be generated from your
              diagnostic results and available study time.
            </p>

            <div className="mt-6 space-y-4">
              {[
                { day: "Session 1", topic: "Backpropagation", time: "25 minutes", task: "Review concepts and solve practice questions" },
                { day: "Session 2", topic: "Decision Trees", time: "20 minutes", task: "Study splitting criteria and practice examples" },
                { day: "Session 3", topic: "Neural Networks", time: "15 minutes", task: "Review architecture and activation functions" },
                { day: "Session 4", topic: "Mixed diagnostic quiz", time: "15 minutes", task: "Check improvement and update priorities" },
              ].map((item) => (
                <div
                  key={item.day}
                  className="flex flex-wrap gap-4 rounded-xl bg-slate-50 p-4"
                >
                  <div className="min-w-24">
                    <p className="text-sm font-semibold text-indigo-600">
                      {item.day}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{item.time}</p>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold">{item.topic}</h4>
                    <p className="mt-1 text-sm text-slate-600">{item.task}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="mt-10 border-t border-slate-200 pt-5 text-sm text-slate-500">
          GapFinder AI · Personalized learning through measurable knowledge gaps.
        </footer>
      </section>
    </main>
  );
}
