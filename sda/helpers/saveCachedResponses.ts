import type { ModelResponse } from "./loadCachedResponses.ts";

/**
 * Save model responses to cache file
 */
export default async function saveCachedResponses(
  cacheFilePath: string,
  modelResponses: ModelResponse[],
): Promise<void> {
  await Deno.writeTextFile(
    cacheFilePath,
    JSON.stringify(modelResponses, null, 2),
  );
  console.log(`Saved ${modelResponses.length} responses to ${cacheFilePath}\n`);
}
