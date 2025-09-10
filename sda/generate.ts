import { prettyDuration } from "@nshiab/journalism";
import { existsSync } from "node:fs";
import fetchDocumentation from "./helpers/fetchDocumentation.ts";
import breakDownDocumentation from "./helpers/breakDownDocumentation.ts";
import generateTrainingData from "./helpers/generateTrainingData.ts";
import prepDataforMLX from "./helpers/prepDataforMLX.ts";

const models = ["gpt-oss:20b", "qwen3:30b", "gemma3:27b", "deepseek-r1:32b"];
const sample = 0; // 0 for all
const roles = [
  "junior developer",
  "senior developer",
  "data analyst",
  "data journalist",
];
const trainingDataPerc = 0.95;
const validationDataPerc = 0.05;
// const testDataPerc = 0.0; // We don't test with mlx-lm

const verbose = false;

const start = new Date();

// First, we grab the latest documentation
const sdaDocs = await fetchDocumentation();

// Then we break down the documentation
const documentationChunksSda = breakDownDocumentation(sdaDocs, sample);

const trainingDataPath = "./sda/output/trainingData.json";

// Check if training data already exists
if (existsSync(trainingDataPath)) {
  console.log("\nTraining data already exists. Skipping generation...");

  // Load existing training data
  const existingData = JSON.parse(await Deno.readTextFile(trainingDataPath));
  prepDataforMLX(
    existingData,
    trainingDataPerc,
    validationDataPerc,
  );

  console.log("\nDone (using existing data)");
  prettyDuration(start, { log: true, prefix: "Duration: " });

  Deno.exit(0);
} else {
  // Now we generate the training data
  const trainingData = await generateTrainingData(
    models,
    documentationChunksSda,
    roles,
    verbose,
  );

  // We restructure the training data and split it for mlx
  const trainingDataMLX = prepDataforMLX(
    trainingData,
    trainingDataPerc,
    validationDataPerc,
  );

  console.log("\nDone");
  prettyDuration(start, { log: true, prefix: "Duration: " });
  console.log(
    `${
      ((Date.now() - start.getTime()) / 1000 / trainingDataMLX.length).toFixed(
        3,
      )
    } seconds per question.`,
  );
}
