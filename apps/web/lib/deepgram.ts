import "server-only";

const DEEPGRAM_URL =
  "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true";

export class DeepgramConfigError extends Error {
  constructor(message = "DEEPGRAM_API_KEY is not configured") {
    super(message);
    this.name = "DeepgramConfigError";
  }
}

export class DeepgramUpstreamError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "DeepgramUpstreamError";
    this.status = status;
  }
}

export type TaskSuggestion = {
  suggestedTitle: string;
  suggestedDescription?: string;
};

function getApiKey(): string {
  const key = process.env.DEEPGRAM_API_KEY;
  if (!key) {
    throw new DeepgramConfigError();
  }
  return key;
}

type DeepgramResponse = {
  results?: {
    channels?: Array<{
      alternatives?: Array<{ transcript?: string }>;
    }>;
  };
};

/**
 * Proxy audio to Deepgram prerecorded Listen (Nova-2).
 * Does not log audio bytes or transcripts.
 */
export async function transcribeAudio(
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const apiKey = getApiKey();
  const body = new Uint8Array(buffer);

  let response: Response;
  try {
    response = await fetch(DEEPGRAM_URL, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": contentType,
      },
      body,
    });
  } catch {
    throw new DeepgramUpstreamError("Failed to reach Deepgram", 502);
  }

  if (!response.ok) {
    throw new DeepgramUpstreamError("Deepgram transcription failed", 502);
  }

  const data = (await response.json()) as DeepgramResponse;
  const transcript =
    data.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ?? "";

  return transcript;
}

/**
 * Light post-processing: first sentence → title (≤80 chars); remainder → description.
 */
export function suggestTaskFromTranscript(transcript: string): TaskSuggestion {
  const cleaned = transcript.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return { suggestedTitle: "Untitled voice task" };
  }

  const sentenceMatch = cleaned.match(/^(.+?[.!?])(?:\s+|$)([\s\S]*)/);
  let titlePart = sentenceMatch?.[1]?.trim() ?? cleaned;
  let rest = sentenceMatch?.[2]?.trim() ?? "";

  if (!sentenceMatch && cleaned.length > 80) {
    const cut = cleaned.slice(0, 80);
    const lastSpace = cut.lastIndexOf(" ");
    titlePart = (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim();
    rest = cleaned.slice(titlePart.length).trim();
  }

  if (titlePart.length > 80) {
    titlePart = `${titlePart.slice(0, 77).trimEnd()}...`;
  }

  return {
    suggestedTitle: titlePart,
    ...(rest ? { suggestedDescription: rest } : {}),
  };
}
