import { DurationTracker, prettyDuration } from "@nshiab/journalism";
import evaluateResponse from "./evaluateResponse.ts";

export default async function evaluateAllResponses(
  modelResponses: {
    model: string;
    question: string;
    response: string;
  }[],
  evaluationModels: string[],
  questions: {
    question: string;
    keyword: string[];
  }[],
) {
  console.log(`\nEvaluating responses from ${modelResponses[0].model}...`);

  const totalEvaluations = evaluationModels.length * modelResponses.length;
  const tracker = new DurationTracker(totalEvaluations, {
    prefix: "Estimated time remaining: ",
  });

  const evaluationResults = [];

  let evaluationCount = 1;

  const documentationChunks = JSON.parse(Deno.readTextFileSync(
    "sda/output/documentationChunksSda.json",
  )) as string[];

  const startEvaluation = new Date();
  for (const evalModel of evaluationModels) {
    console.log(`\nEvaluating responses with ${evalModel}...\n`);

    for (const responseData of modelResponses) {
      console.log(
        `\n${evaluationCount} / ${totalEvaluations} - ${evalModel} evaluating ${responseData.model} response`,
      );

      const keywords = questions.find((q) =>
        q.question === responseData.question
      )?.keyword || [];

      const documentation = documentationChunks.filter((chunk) =>
        keywords.some((kw) => chunk.toLowerCase().includes(kw.toLowerCase()))
      ).join("\n\n");

      tracker.start();

      try {
        const evaluation = await evaluateResponse(
          responseData.question,
          responseData.response,
          documentation,
          evalModel,
        );
        // console.log(`\nQuestion: ${responseData.question}`);
        // console.log(`Response: ${responseData.response}`);
        console.log(`Score: ${evaluation.score}`);
        // console.log(`Reasoning: ${evaluation.reasoning}`);

        evaluationResults.push(
          {
            model: responseData.model,
            question: responseData.question,
            response: responseData.response,
            evaluationModel: evalModel,
            score: evaluation.score,
            scoreReasoning: evaluation.reasoning,
          },
        );
      } catch (error) {
        console.error("Error during evaluation:", error);
      }

      evaluationCount++;
      tracker.log();
    }
  }

  Deno.writeTextFileSync(
    `models/${modelResponses[0].model}/validation.json`,
    JSON.stringify(evaluationResults, null, 2),
  );
  console.log(`\nEvaluation results saved for ${modelResponses[0].model}`);

  prettyDuration(startEvaluation, {
    log: true,
    prefix: "Evaluation took ",
  });
}
