import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/pwc-prompt";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured. Add it to .env.local." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { profileText: string; lineOfService: string; subPracticeNote: string };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
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
    model: "claude-opus-4-6",
    max_tokens: 2048,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  };

  const stream = await anthropic.messages.stream(streamParams);

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
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
    "## Task\n\nGenerate a complete call prep brief for this prospect using the format specified in your instructions."
  );

  return sections.join("\n\n---\n\n");
}
