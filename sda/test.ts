import { prettyDuration } from "@nshiab/journalism";
import getFineTunedModels from "./helpers/getFineTunedModels.ts";
import loadCachedResponses from "./helpers/loadCachedResponses.ts";
import generateModelResponses from "./helpers/generateModelResponses.ts";
import saveCachedResponses from "./helpers/saveCachedResponses.ts";
import evaluateAllResponses from "./helpers/evaluateAllResponses.ts";
import generateTestsMarkdown from "./helpers/generateTestsMarkdown.ts";
import type { TestQuestion } from "./helpers/loadCachedResponses.ts";
import type { TestResult } from "./helpers/evaluateAllResponses.ts";
import documentationChunksSda from "./output/documentationChunksSda.json" with {
  type: "json",
};

const evaluationModels = [
  "gpt-oss:20b",
  "qwen3:30b",
  "gemma3:27b",
  "deepseek-r1:32b",
];

const testQuestions: TestQuestion[] = [
  { question: "How can I open a CSV file?", keyword: ["loadData"] },
  {
    question:
      "I have a table with two columns: province and fireId. How can I count the number of fires per province?",
    keyword: ["summarize"],
  },
  {
    question: "I want to remove duplicates on the column 'email'.",
    keyword: ["removeDuplicates"],
  },
  {
    question: "Is there a way to calculate correlations between columns?",
    keyword: ["correlations"],
  },
  {
    question: "Give an example of a join between two tables.",
    keyword: ["join"],
  },
  {
    question: "How to filter rows by a condition?",
    keyword: ["filter", "keep", "remove"],
  },
  {
    question: "How can I rename the column 'Temperature (°C)' to 'temp'?",
    keyword: ["renameColumns"],
  },
  {
    question: "How to sort the data by the column 'date' in descending order?",
    keyword: ["sort"],
  },
  {
    question:
      "How to calculate the moving average of the column 'sales' with a window of 7 days?",
    keyword: ["roll"],
  },
  {
    question:
      "How can I open a geojson file and fix the errors in its geometries?",
    keyword: ["fixGeo"],
  },
  {
    question:
      "I have a table with points and another one with polygons. How can I join the points with the polygons they fall into?",
    keyword: ["joinGeo"],
  },
  {
    question:
      "Show me how to simplify the geometries in the column 'location'.",
    keyword: ["simplify"],
  },
  {
    question:
      "Can I use an AI model to categorize the data in the column 'customer_complaints'?",
    keyword: ["aiRowByRow"],
  },
  {
    question:
      "I want to create a simple chart in the terminal to visualize my data.",
    keyword: ["logBarChart", "logLineChart", "logDotChart"],
  },
  {
    question: "I want to write my data to a parquet file. How?",
    keyword: ["writeData"],
  },
];

const verbose = true;
const fineTunedModels = getFineTunedModels();
const cacheFilePath = "results-data/fine-tuned-model-responses.json";

const start = new Date();
console.log("Starting fine-tuned model evaluation...\n");

console.log(`Found ${fineTunedModels.length} models with adapters:`);
fineTunedModels.forEach((model) => console.log(`   - ${model}`));

if (fineTunedModels.length === 0) {
  console.log(
    "No fine-tuned models found with complete adapters. Please train models first.",
  );
  Deno.exit(1);
}

// Load cached responses or generate new ones
let modelResponses = await loadCachedResponses(
  cacheFilePath,
  fineTunedModels,
  testQuestions,
);

// Generate responses only if not cached or cache is invalid
if (modelResponses.length === 0) {
  modelResponses = await generateModelResponses(
    fineTunedModels,
    testQuestions,
    documentationChunksSda,
    verbose,
  );

  // Save responses to cache
  await saveCachedResponses(cacheFilePath, modelResponses);
}

// Evaluate all responses and compile results
const allResults: TestResult[] = await evaluateAllResponses(
  modelResponses,
  evaluationModels,
  verbose,
);

// Save results to JSON
await Deno.writeTextFile(
  "results-data/tests.json",
  JSON.stringify(allResults, null, 2),
);
console.log("Test results saved to results-data/tests.json");

// Generate new tests.md file
await generateTestsMarkdown(allResults, testQuestions);
console.log("Updated results-data/tests.md");

console.log(`\nTesting complete! Total time: ${prettyDuration(start)}`);
