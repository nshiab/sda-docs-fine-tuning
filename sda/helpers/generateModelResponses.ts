import promptFineTunedModel from "./promptFineTunedModel.ts";
import type { ModelResponse, TestQuestion } from "./loadCachedResponses.ts";

export default async function generateModelResponses(
  models: string[],
  questions: TestQuestion[],
  documentationChunks: string[],
  verbose: boolean = false,
): Promise<ModelResponse[]> {
  console.log("Generating responses from fine-tuned models...\n");

  const modelResponses: ModelResponse[] = [];

  for (const model of models) {
    const modelName = model.split("/").pop()!;
    const adapterPath = `adapters/${modelName}`;

    console.log(`Model: ${model}`);

    for (const question of questions) {
      const response = await promptFineTunedModel(
        model,
        adapterPath,
        question.question,
      );

      const documentation = documentationChunks.filter((chunk) =>
        question.keyword.some((kw) =>
          chunk.toLowerCase().includes(kw.toLowerCase())
        )
      ).join("\n\n");

      modelResponses.push({
        model,
        modelName,
        question: question.question,
        response,
        documentation,
      });

      if (verbose) {
        console.log(`   Question: ${question.question}`);
        console.log(`   Response: ${response}`);
      }
    }
  }

  return modelResponses;
}
