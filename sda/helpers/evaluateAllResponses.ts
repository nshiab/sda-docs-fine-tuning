import evaluateResponse from "./evaluateResponse.ts";
import type { ModelResponse } from "./loadCachedResponses.ts";

export interface TestResult {
  model: string;
  question: string;
  response: string;
  evaluation: {
    averageScore: number;
    evaluatedBy: string;
    details: Array<{
      evaluationModel: string;
      score: number;
      reasoning: string;
    }>;
  };
}

export default async function evaluateAllResponses(
  modelResponses: ModelResponse[],
  evaluationModels: string[],
  verbose: boolean = false,
): Promise<TestResult[]> {
  const evaluationResults = new Map<
    string,
    Array<{
      evaluationModel: string;
      score: number;
      reasoning: string;
    }>
  >();

  for (const evalModel of evaluationModels) {
    console.log(`\nEvaluating all responses with ${evalModel}...\n`);

    for (const responseData of modelResponses) {
      const key = `${responseData.model}:${responseData.question}`;

      const evaluation = await evaluateResponse(
        responseData.question,
        responseData.response,
        responseData.documentation,
        evalModel,
      );

      if (!evaluationResults.has(key)) {
        evaluationResults.set(key, []);
      }

      const current = evaluationResults.get(key)!;
      current.push({
        evaluationModel: evalModel,
        score: evaluation.score,
        reasoning: evaluation.reasoning,
      });

      if (verbose) {
        console.log(
          `${responseData.modelName} - ${responseData.question}`,
        );
        console.log(`Response: ${responseData.response}`);
        console.log(
          `Score: ${evaluation.score} - Reasoning: ${evaluation.reasoning}`,
        );
      }
    }
  }

  // Create final results with averaged scores
  const allResults: TestResult[] = [];

  for (const responseData of modelResponses) {
    const key = `${responseData.model}:${responseData.question}`;
    const evaluationDetails = evaluationResults.get(key) || [];

    const totalScore = evaluationDetails.reduce(
      (sum, detail) => sum + detail.score,
      0,
    );
    const averageScore = evaluationDetails.length > 0
      ? totalScore / evaluationDetails.length
      : 0;

    const result: TestResult = {
      model: responseData.modelName,
      question: responseData.question,
      response: responseData.response,
      evaluation: {
        averageScore: Math.round(averageScore * 100) / 100,
        evaluatedBy: evaluationModels.join(", "),
        details: evaluationDetails,
      },
    };

    allResults.push(result);
  }

  return allResults;
}
