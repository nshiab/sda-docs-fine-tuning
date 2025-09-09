import trainModel from "./helpers/trainModel.ts";
import downloadModel from "./helpers/downloadModel.ts";
import { prettyDuration } from "@nshiab/journalism";
import { existsSync } from "node:fs";

const start = Date.now();

const models = [
  "mlx-community/gemma-3-270m-it-8bit",
  "mlx-community/gemma-3-1b-it-8bit",
  "mlx-community/gemma-3-4b-it-8bit",
  "mlx-community/gemma-3-12b-it-8bit",
];

// Load existing results if they exist
let trainingResults: { model: string; duration: number }[] = [];
let allIterationLosses: {
  iteration: number;
  trainLoss?: number;
  valLoss?: number;
  learningRate?: number;
  tokensPerSec?: number;
  trainedTokens?: number;
  model?: string;
}[] = [];

// Load existing durations
if (existsSync("results-data/durations.json")) {
  const existingDurations = JSON.parse(
    await Deno.readTextFile("results-data/durations.json"),
  );
  trainingResults = existingDurations;
  console.log("📚 Loaded existing duration results");
}

// Load existing losses
if (existsSync("results-data/trainLoss.json")) {
  const existingLosses = JSON.parse(
    await Deno.readTextFile("results-data/trainLoss.json"),
  );
  allIterationLosses = existingLosses;
  console.log("📊 Loaded existing training loss results");
}

// Check if any models need training before cleaning
const modelsNeedingTraining = models.filter((model) => {
  const adapterPath = `adapters/${model.split("/").pop()}`;
  const adaptersFile = `${adapterPath}/adapters.safetensors`;
  const configFile = `${adapterPath}/adapter_config.json`;
  return !(existsSync(adaptersFile) && existsSync(configFile));
});

console.log(
  `🧹 Found ${modelsNeedingTraining.length} models needing training. Cleaning adapters directory...`,
);

// Pre-download all models first
console.log("🚀 Pre-downloading models to ensure accurate timing...\n");
for (const model of modelsNeedingTraining) {
  try {
    await downloadModel(model);
  } catch (error) {
    console.error(`❌ Failed to download: ${model}`, error);
  }
}

console.log(
  "📚 All models downloaded. Starting training with accurate timing...\n",
);

for (const model of models) {
  const startTime = Date.now();

  try {
    const losses = await trainModel(model);
    const duration = Date.now() - startTime;

    // Only add results if the model was actually trained (losses not empty)
    if (losses.length > 0) {
      const lossesWithModel = losses.map((loss) => ({
        ...loss,
        model: model,
      }));
      allIterationLosses.push(...lossesWithModel);

      // Remove any existing entry for this model and add the new one
      const existingIndex = trainingResults.findIndex((r) => r.model === model);
      if (existingIndex >= 0) {
        trainingResults[existingIndex] = { model, duration };
      } else {
        trainingResults.push({ model, duration });
      }

      console.log(
        `✅ Completed training: ${model} (${
          (duration / 1000 / 60).toFixed(1)
        } minutes)\n`,
      );
    } else {
      console.log(`⏭️ Skipped: ${model} (already trained)\n`);
    }
  } catch (error) {
    console.error(`❌ Failed: ${model}`, error);
  }
}

await Deno.writeTextFile(
  "results-data/durations.json",
  JSON.stringify(trainingResults, null, 2),
);
console.log("\n📝 Training durations saved to results-data/durations.json");

await Deno.writeTextFile(
  "results-data/trainLoss.json",
  JSON.stringify(allIterationLosses, null, 2),
);
console.log("📊 All iteration losses saved to results-data/trainLoss.json");

console.log(
  `\n🎉 All training done! Total time: ${prettyDuration(start)}\n`,
);
