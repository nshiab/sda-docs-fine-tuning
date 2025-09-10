import { askAI } from "@nshiab/journalism";

export default async function evaluateResponse(
  question: string,
  response: string,
  documentation: string,
  evaluationModel: string,
): Promise<{ score: number; reasoning: string }> {
  const evaluationPrompt =
    `You are an expert evaluator for documentation-based question answering systems. Your task is to evaluate how well the response answers the question based on the provided documentation. 

Score the response on a scale of 0-1:
- 1.0: Perfect answer that correctly uses the documentation and provides accurate, complete information
- 0.8: Good answer with minor issues or incomplete information
- 0.6: Adequate answer but missing some important details or has minor inaccuracies
- 0.4: Poor answer with significant issues or inaccuracies
- 0.2: Very poor answer that is mostly incorrect or unhelpful
- 0.0: Completely wrong, hallucinated, or irrelevant response

Respond in this exact JSON format:
{
  "score": 0.8,
  "reasoning": "Brief explanation of the score"
}

Return only the JSON object, no additional text.

Here are some extra instructions that were given to the model when generating the response you are evaluationg. Use these to guide your evaluation:
- For each question, you must provide a code example as your answer. You must add comments to the code to explain the steps. You must also add a brief, one-sentence explanation before the code example.
- The answer should be grounded in the documentation provided. Do not make assumptions. Do not invent features or methods that do not exist.
- Write simple and straightforward code examples. Don't create functions to encapsulate your code.
- Your code examples should always be wrapped in triple backticks (\`\`\` at the beginning and \`\`\` at the end) for code blocks.
- If the documentation section is about SimpleDB, make sure to wrap your code example with:
\`\`\`
import { SimpleDB } from "@nshiab/simple-data-analysis";
// We start a SimpleDB instance
const sdb = new SimpleDB();
[PUT YOUR CODE EXAMPLE HERE]
// We close everything
await sdb.done();
\`\`\`
- If the documentation section is about SimpleTable, make sure to wrap your code example with:
\`\`\`
// We start a SimpleDB instance
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
// We create a new table
const table = sdb.newTable();
[PUT YOUR CODE EXAMPLE HERE]
// We close everything
await sdb.done();
\`\`\`
- If the example requires data, load it using \`await table.loadData("path/to/your/data.csv");\` or \`await table.loadGeoData("path/to/your/geodata.geojson");\` for geospatial data.
- Do not forget to add \`await sdb.done();\` at the end of your code.

DOCUMENTATION:
${documentation}

QUESTION:
${question}

RESPONSE TO EVALUATE:
${response}
`;

  console.log(`Evaluating response with ${evaluationModel}...`);

  let evaluation: { score: number; reasoning: string };

  if (evaluationModel.includes("gemma")) {
    // Non-thinking model
    evaluation = await askAI(
      evaluationPrompt,
      {
        verbose: false,
        cache: true,
        ollama: true,
        contextWindow: 40_000,
        model: evaluationModel,
        returnJson: true,
      },
    ) as { score: number; reasoning: string };
  } else {
    // Thinking model
    evaluation = await askAI(
      evaluationPrompt,
      {
        verbose: false,
        cache: true,
        ollama: true,
        contextWindow: 40_000,
        model: evaluationModel,
        thinkingBudget: 1,
        returnJson: false,
        parseJson: true,
      },
    ) as { score: number; reasoning: string };
  }

  return {
    score: evaluation.score || 0,
    reasoning: evaluation.reasoning || "",
  };
}
