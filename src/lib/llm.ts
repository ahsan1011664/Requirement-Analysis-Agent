import { ChatOpenAI } from "@langchain/openai";

export function hasOpenAIKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function createChatModel(temperature = 0.3) {
  if (!hasOpenAIKey()) {
    return null;
  }

  return new ChatOpenAI({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature,
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function invokeJson<T>(
  systemPrompt: string,
  userPrompt: string,
  fallback: T
): Promise<T> {
  const model = createChatModel();

  if (!model) {
    return fallback;
  }

  try {
    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    const text =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) {
      return fallback;
    }

    return JSON.parse(jsonMatch[0]) as T;
  } catch {
    return fallback;
  }
}
