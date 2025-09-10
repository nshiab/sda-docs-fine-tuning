interface TestResult {
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

interface TestQuestion {
  question: string;
  keyword: string[];
}

/**
 * Generate markdown file with test results and rankings
 */
export default async function generateTestsMarkdown(
  results: TestResult[],
  testQuestions: TestQuestion[],
): Promise<void> {
  // Group results by question and model
  const resultsByQuestion = new Map<string, Map<string, TestResult>>();

  for (const result of results) {
    if (!resultsByQuestion.has(result.question)) {
      resultsByQuestion.set(result.question, new Map());
    }
    resultsByQuestion.get(result.question)!.set(result.model, result);
  }

  // Get unique models and sort them
  const models = Array.from(new Set(results.map((r) => r.model))).sort();

  // Calculate total points per model
  const modelTotals = new Map<string, number>();
  for (const model of models) {
    const modelResults = results.filter((r) => r.model === model);
    const total = modelResults.reduce(
      (sum, r) => sum + r.evaluation.averageScore,
      0,
    );
    modelTotals.set(model, Math.round(total * 100) / 100);
  }

  // Sort models by total score (descending)
  const sortedModels = models.sort((a, b) =>
    modelTotals.get(b)! - modelTotals.get(a)!
  );

  // Generate winners list
  const topScores = Array.from(new Set(Array.from(modelTotals.values()))).sort((
    a,
    b,
  ) => b - a);
  const winners: string[] = [];

  if (topScores[0]) {
    const goldWinners = sortedModels.filter((m) =>
      modelTotals.get(m) === topScores[0]
    );
    winners.push(...goldWinners.map((m) => `- Gold: ${m}`));
  }
  if (topScores[1]) {
    const silverWinners = sortedModels.filter((m) =>
      modelTotals.get(m) === topScores[1]
    );
    winners.push(...silverWinners.map((m) => `- Silver: ${m}`));
  }
  if (topScores[2]) {
    const bronzeWinners = sortedModels.filter((m) =>
      modelTotals.get(m) === topScores[2]
    );
    winners.push(...bronzeWinners.map((m) => `- Bronze: ${m}`));
  }

  let markdown = `# Fine-tuned Model Evaluation Results

All models were fine-tuned on SDA documentation and evaluated using multiple AI models.

## Winners:

${winners.join("\n")}

## Scoring:
- **1.0**: Perfect answer using documentation correctly
- **0.8**: Good answer with minor issues  
- **0.6**: Adequate but missing details
- **0.4**: Poor with significant issues
- **0.2**: Very poor, mostly incorrect
- **0.0**: Wrong or irrelevant

| Question | ${sortedModels.join(" | ")} |
|----------|${sortedModels.map(() => "---").join("|")}|
`;

  // Add each question row
  for (const question of testQuestions) {
    const questionResults = resultsByQuestion.get(question.question);
    if (!questionResults) continue;

    const scores = sortedModels.map((model) => {
      const result = questionResults.get(model);
      return result ? result.evaluation.averageScore.toFixed(1) : "N/A";
    });

    markdown += `| ${question.question} | ${scores.join(" | ")} |\n`;
  }

  // Add totals row
  const totals = sortedModels.map((model) =>
    modelTotals.get(model)?.toFixed(1) || "N/A"
  );
  markdown += `| **Total Score** | **${totals.join("** | **")}** |\n`;

  markdown += `\n## Detailed Results

The complete test results with individual responses and evaluations are available in \`results-data/tests.json\`.

## Individual Evaluation Details

`;

  // Add detailed evaluation breakdown
  for (const question of testQuestions) {
    markdown += `### ${question.question}\n\n`;

    const questionResults = resultsByQuestion.get(question.question);
    if (!questionResults) continue;

    for (const model of sortedModels) {
      const result = questionResults.get(model);
      if (!result) continue;

      markdown += `#### ${model} (Average: ${
        result.evaluation.averageScore.toFixed(1)
      })\n\n`;
      markdown += `**Response:**\n${result.response}\n\n`;

      if (result.evaluation.details.length > 0) {
        markdown += `**Individual Evaluations:**\n`;
        for (const detail of result.evaluation.details) {
          markdown += `- **${detail.evaluationModel}**: ${
            detail.score.toFixed(1)
          } - ${detail.reasoning}\n`;
        }
        markdown += `\n`;
      }

      markdown += `---\n\n`;
    }
  }

  markdown += `Generated on: ${new Date().toISOString()}
`;

  await Deno.writeTextFile("results-data/tests.md", markdown);
}
