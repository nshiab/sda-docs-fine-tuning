import { prettyDuration } from "@nshiab/journalism";
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

const verbose = false;

const start = new Date();

// First, we grab the latest documentation
const sdaDocs = await fetchDocumentation();

// Then we break down the documentation
const documentationChunksSda = breakDownDocumentation(sdaDocs, sample);

// Now we generate the training data
const trainingData = await generateTrainingData(
  models,
  documentationChunksSda,
  roles,
  verbose,
);

// We restructure the training data and split it for mlx
const trainingDataMLX = prepDataforMLX(trainingData);

console.log("\n*** Done ***");
prettyDuration(start, { log: true, prefix: "Duration: " });
console.log(
  `${
    ((Date.now() - start.getTime()) / 1000 / trainingDataMLX.length).toFixed(3)
  } seconds per question.`,
);
