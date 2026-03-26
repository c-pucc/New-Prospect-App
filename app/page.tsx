"use client";

import { useState, useRef, useCallback } from "react";

type LineOfService = "Advisory" | "Assurance" | "Tax" | "IFS" | "Custom";

type SearchItem = { query: string; tool: string };

const LOS_OPTIONS: { value: LineOfService; label: string; description: string }[] = [
  { value: "Advisory", label: "Advisory", description: "Consulting, deals, risk, forensics" },
  { value: "Assurance", label: "Assurance", description: "External audit, ESG, CMAAS" },
  { value: "Tax", label: "Tax", description: "Compliance, Pillar Two, transfer pricing" },
  { value: "IFS", label: "Internal Firm Services", description: "ET, Finance, HR, Risk & Quality" },
  { value: "Custom", label: "Custom / Other", description: "Specify below" },
];

const SUB_PRACTICE_PLACEHOLDERS: Record<LineOfService, string> = {
  Advisory: "e.g. Technology Consulting > Oracle Practice, or Deals > M&A Advisory",
  Assurance: "e.g. ESG & Sustainability Assurance, or CMAAS",
  Tax: "e.g. International Tax > Pillar Two, or Tax Technology & Transformation",
  IFS: "e.g. Enterprise Technology (ET), or Human Capital",
  Custom: "Describe the practice or business unit",
};

export default function Page() {
  const [profileText, setProfileText] = useState("");
  const [lineOfService, setLineOfService] = useState<LineOfService>("Advisory");
  const [customLOS, setCustomLOS] = useState("");
  const [subPracticeNote, setSubPracticeNote] = useState("");

  const [briefContent, setBriefContent] = useState("");
  const [searchItems, setSearchItems] = useState<SearchItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const briefRef = useRef<HTMLDivElement>(null);
  // Buffer for incomplete NDJSON lines across chunks
  const lineBufferRef = useRef("");

  const effectiveLOS =
    lineOfService === "Custom" ? customLOS.trim() || "Custom" : lineOfService;

  const generate = useCallback(async () => {
    if (!profileText.trim() || isGenerating) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setBriefContent("");
    setSearchItems([]);
    setError(null);
    setIsComplete(false);
    setIsGenerating(true);
    lineBufferRef.current = "";

    try {
      const response = await fetch("/api/generate-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileText, lineOfService: effectiveLOS, subPracticeNote }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server error (${response.status})`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value, { stream: true });
        lineBufferRef.current += raw;

        // Process complete lines
        const lines = lineBufferRef.current.split("\n");
        // Keep the last (potentially incomplete) line in the buffer
        lineBufferRef.current = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);
            if (event.type === "text") {
              setBriefContent((prev) => prev + event.content);
              briefRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
            } else if (event.type === "status") {
              setSearchItems((prev) => {
                // deduplicate
                if (prev.some((s) => s.query === event.query)) return prev;
                return [...prev, { query: event.query, tool: event.tool }];
              });
            } else if (event.type === "done") {
              setIsComplete(true);
            } else if (event.type === "error") {
              throw new Error(event.message);
            }
          } catch (parseErr) {
            // Skip non-JSON lines (shouldn't happen but be safe)
            if (parseErr instanceof SyntaxError) continue;
            throw parseErr;
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  }, [profileText, effectiveLOS, subPracticeNote, isGenerating]);

  const copyBrief = () => navigator.clipboard.writeText(briefContent);

  const reset = () => {
    abortRef.current?.abort();
    setBriefContent("");
    setSearchItems([]);
    setError(null);
    setIsComplete(false);
    setIsGenerating(false);
    lineBufferRef.current = "";
  };

  const hasOutput = briefContent || searchItems.length > 0 || error;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-brand-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">Prospect Prep</h1>
              <p className="text-xs text-gray-500">Databricks × PwC Call Intelligence</p>
            </div>
          </div>
          <span className="text-xs text-gray-400 hidden sm:block">Claude Opus + Web Research</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ─── Input Panel ─── */}
        <aside className="lg:col-span-2 flex flex-col gap-4">
          {/* Profile Input */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <label className="block text-sm font-medium text-gray-900 mb-1.5">
              LinkedIn Profile
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Paste the prospect&apos;s LinkedIn profile text — name, title, About, Experience, and Skills work best.
            </p>
            <textarea
              value={profileText}
              onChange={(e) => setProfileText(e.target.value)}
              placeholder={"Name: Jane Smith\nTitle: Director, Technology Consulting\nCompany: PwC\n\nAbout:\n...\n\nExperience:\n...\n\nSkills:\n..."}
              rows={12}
              className="w-full text-sm text-gray-800 placeholder-gray-300 border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent font-mono leading-relaxed"
            />
          </div>

          {/* LoS Tagging */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Line of Service
            </label>
            <div className="space-y-2">
              {LOS_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer border transition-colors ${
                    lineOfService === opt.value
                      ? "border-brand-500 bg-brand-50"
                      : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="los"
                    value={opt.value}
                    checked={lineOfService === opt.value}
                    onChange={() => setLineOfService(opt.value)}
                    className="mt-0.5 accent-brand-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                    <span className="text-xs text-gray-500 block">{opt.description}</span>
                  </div>
                </label>
              ))}
            </div>
            {lineOfService === "Custom" && (
              <div className="mt-3">
                <input
                  type="text"
                  value={customLOS}
                  onChange={(e) => setCustomLOS(e.target.value)}
                  placeholder="Name this Line of Service"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Sub-practice Note */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <label className="block text-sm font-medium text-gray-900 mb-1.5">
              Sub-Practice Note
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Where do they sit within the LoS? Any context you already have.
            </p>
            <input
              type="text"
              value={subPracticeNote}
              onChange={(e) => setSubPracticeNote(e.target.value)}
              placeholder={SUB_PRACTICE_PLACEHOLDERS[lineOfService]}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={generate}
            disabled={!profileText.trim() || isGenerating}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
              !profileText.trim() || isGenerating
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-brand-500 hover:bg-brand-600 text-white shadow-sm active:scale-[0.99]"
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner />
                Researching &amp; generating...
              </span>
            ) : (
              "Generate Call Prep Brief"
            )}
          </button>

          {isComplete && (
            <button
              onClick={reset}
              className="w-full py-2.5 px-4 rounded-xl text-sm text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 transition-colors"
            >
              Clear &amp; Start Over
            </button>
          )}
        </aside>

        {/* ─── Output Panel ─── */}
        <section className="lg:col-span-3 flex flex-col">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col">

            {/* Output header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">Call Prep Brief</span>
                {isGenerating && searchItems.length === 0 && (
                  <span className="text-xs text-blue-500 font-medium animate-pulse">researching...</span>
                )}
                {isGenerating && searchItems.length > 0 && !briefContent && (
                  <span className="text-xs text-blue-500 font-medium animate-pulse">generating...</span>
                )}
                {isGenerating && briefContent && (
                  <span className="text-xs text-brand-500 font-medium animate-pulse">writing...</span>
                )}
                {isComplete && (
                  <span className="text-xs text-green-600 font-medium">✓ complete</span>
                )}
              </div>
              {briefContent && (
                <button
                  onClick={copyBrief}
                  className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
                >
                  <CopyIcon />
                  Copy
                </button>
              )}
            </div>

            {/* Output body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 min-h-[500px]">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
                  <strong>Error:</strong> {error}
                </div>
              )}

              {!hasOutput && <EmptyState />}

              {/* Research activity */}
              {searchItems.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1.5">
                    <span>🔍</span> Web research
                    {isGenerating && !briefContent && (
                      <span className="text-blue-400 animate-pulse">in progress...</span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {searchItems.map((item, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${
                          item.tool === "web_fetch"
                            ? "bg-purple-50 border-purple-200 text-purple-700"
                            : "bg-blue-50 border-blue-200 text-blue-700"
                        }`}
                      >
                        {item.tool === "web_fetch" ? "↗" : "⌕"}{" "}
                        <span className="max-w-[260px] truncate">{item.query}</span>
                      </span>
                    ))}
                  </div>
                  {briefContent && <div className="mt-4 border-t border-gray-100" />}
                </div>
              )}

              {/* Brief content */}
              {briefContent && (
                <div ref={briefRef} className="brief-section">
                  <BriefRenderer content={briefContent} />
                  {isGenerating && <span className="cursor-blink" />}
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mt-3 px-4">
            Brief is generated fresh each time and not stored. Copy it to Salesforce or your notes before navigating away.
          </p>
        </section>
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-6">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-sm font-medium text-gray-700 mb-1">No brief yet</h3>
      <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
        Paste a LinkedIn profile, tag the Line of Service, and hit Generate. Claude will research the prospect online before writing the brief.
      </p>
      <div className="mt-5 text-left bg-gray-50 rounded-lg p-4 w-full max-w-sm">
        <p className="text-xs font-medium text-gray-600 mb-2">Each brief includes:</p>
        <ul className="space-y-1">
          {[
            "🔍 Live web research on the prospect",
            "Organizational context & initiatives",
            "Metrics this persona cares about",
            "Individual challenges they're navigating",
            "Databricks conversation angles & questions",
          ].map((item) => (
            <li key={item} className="text-xs text-gray-500 flex items-start gap-2">
              <span className="text-brand-500 mt-0.5 flex-shrink-0">▸</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

// ─── Markdown Renderer ────────────────────────────────────────────

function BriefRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(<h2 key={i}>{parseInline(line.slice(3))}</h2>);
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      elements.push(<h3 key={i}>{parseInline(line.slice(4))}</h3>);
      i++;
      continue;
    }
    if (line.startsWith("- ")) {
      const bullets: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        bullets.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`}>
          {bullets.map((b, j) => (
            <li key={j}>
              <span className="text-brand-500 text-xs mt-0.5 flex-shrink-0">▸</span>
              <span>{parseInline(b)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }
    if (line === "---") {
      elements.push(<hr key={i} className="border-gray-100 my-2" />);
      i++;
      continue;
    }
    if (line.trim()) {
      elements.push(<p key={i}>{parseInline(line)}</p>);
    }
    i++;
  }

  return <>{elements}</>;
}

function parseInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**")
          ? <strong key={i}>{part.slice(2, -2)}</strong>
          : part || null
      )}
    </>
  );
}
