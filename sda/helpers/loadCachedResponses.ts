import { existsSync } from "node:fs";

export interface ModelResponse {
  model: string;
  modelName: string;
  question: string;
  response: string;
  documentation: string;
}

export interface TestQuestion {
  question: string;
  keyword: string[];
}

export default async function loadCachedResponses(
  cacheFilePath: string,
  models: string[],
  questions: TestQuestion[],
): Promise<ModelResponse[]> {
  if (!existsSync(cacheFilePath)) {
    return [];
  }

  console.log("Found cached model responses, loading from file...");

  try {
    const cachedData: ModelResponse[] = JSON.parse(
      await Deno.readTextFile(cacheFilePath),
    );

    // Verify that cached data matches current models and questions
    const currentKeys = new Set<string>();
    for (const model of models) {
      for (const question of questions) {
        currentKeys.add(`${model}:${question.question}`);
      }
    }

    const cachedKeys = new Set(
      cachedData.map((item: ModelResponse) => `${item.model}:${item.question}`),
    );

    if (
      currentKeys.size === cachedKeys.size &&
      [...currentKeys].every((key) => cachedKeys.has(key))
    ) {
      console.log(`Loaded ${cachedData.length} cached responses`);
      return cachedData;
    } else {
      console.log(
        "Cached data doesn't match current models/questions, regenerating...",
      );
      return [];
    }
  } catch (error) {
    console.error("Error loading cached responses:", error);
    return [];
  }
}
