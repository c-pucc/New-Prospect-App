import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/pwc-prompt";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

type StreamChunk =
  | { type: "status"; query: string; tool: string }
  | { type: "text"; content: string }
  | { type: "done" }
  | { type: "error"; message: string };

function emit(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  chunk: StreamChunk
) {
  controller.enqueue(encoder.encode(JSON.stringify(chunk) + "\n"));
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "ANTHROPIC_API_KEY is not configured. Add it to .env.local.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { profileText: string; lineOfService: string; subPracticeNote: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { profileText, lineOfService, subPracticeNote } = body;
  if (!profileText?.trim()) {
    return new Response(
      JSON.stringify({ error: "LinkedIn profile text is required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const userMessage = buildUserMessage(profileText, lineOfService, subPracticeNote);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const streamParams: any = {
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    // Cache the large system prompt — counts far fewer tokens against rate limits
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    tools: [
      { type: "web_search_20260209", name: "web_search" },
      { type: "web_fetch_20260209", name: "web_fetch" },
    ],
    messages: [{ role: "user", content: userMessage }],
  };

  const stream = await anthropic.messages.stream(streamParams);

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      // Buffer tool input JSON as it streams in so we can show the search query
      let currentToolName = "";
      let currentToolInputBuffer = "";

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for await (const event of stream as any) {
          // New content block starting
          if (event.type === "content_block_start") {
            const block = event.content_block;
            if (block.type === "server_tool_use") {
              currentToolName = block.name;
              currentToolInputBuffer = "";
            } else {
              currentToolName = "";
              currentToolInputBuffer = "";
            }
          }

          // Content block delta
          if (event.type === "content_block_delta") {
            const delta = event.delta;

            // Accumulate tool input JSON to extract the query
            if (delta.type === "input_json_delta") {
              currentToolInputBuffer += delta.partial_json ?? "";
            }

            // Stream text output directly
            if (delta.type === "text_delta" && delta.text) {
              emit(controller, encoder, { type: "text", content: delta.text });
            }
          }

          // Content block finished — if it was a tool call, emit the status
          if (event.type === "content_block_stop" && currentToolName) {
            let queryLabel = currentToolName === "web_fetch" ? "Fetching page..." : "Searching...";
            try {
              const parsed = JSON.parse(currentToolInputBuffer);
              if (parsed.query) queryLabel = parsed.query;
              else if (parsed.url) queryLabel = parsed.url;
            } catch {
              // leave default label
            }
            emit(controller, encoder, {
              type: "status",
              query: queryLabel,
              tool: currentToolName,
            });
            currentToolName = "";
            currentToolInputBuffer = "";
          }
        }

        emit(controller, encoder, { type: "done" });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Generation failed.";
        emit(controller, encoder, { type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}

function buildUserMessage(
  profileText: string,
  lineOfService: string,
  subPracticeNote: string
): string {
  const sections = [
    `## LinkedIn Profile\n\n${profileText.trim()}`,
    `## Line of Service\n\n${lineOfService || "Not specified"}`,
  ];
  if (subPracticeNote?.trim()) {
    sections.push(`## Sub-Practice / Context Note\n\n${subPracticeNote.trim()}`);
  }
  sections.push(
    "## Task\n\nResearch this prospect online, then generate a complete call prep brief using the format in your instructions."
  );
  return sections.join("\n\n---\n\n");
}
