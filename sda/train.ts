import trainModel from "./helpers/trainModel.ts";
import downloadModel from "./helpers/downloadModel.ts";
import cleanAdapters from "./helpers/cleanAdapters.ts";

const models = [
  "mlx-community/gemma-3-270m-it-8bit",
  "mlx-community/gemma-3-1b-it-8bit",
  "mlx-community/gemma-3-4b-it-8bit",
  "mlx-community/gemma-3-12b-it-8bit",
];

const trainingResults: { model: string; duration: number }[] = [];
const allIterationLosses: {
  iteration: number;
  trainLoss?: number;
  valLoss?: number;
  learningRate?: number;
  tokensPerSec?: number;
  trainedTokens?: number;
  model?: string;
}[] = [];

// Clean adapters directory before starting
await cleanAdapters();

// Pre-download all models first
console.log("🚀 Pre-downloading models to ensure accurate timing...\n");
for (const model of models) {
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

    const lossesWithModel = losses.map((loss) => ({
      ...loss,
      model: model,
    }));
    allIterationLosses.push(...lossesWithModel);

    trainingResults.push({ model, duration });

    console.log(
      `✅ Completed: ${model} (${(duration / 1000 / 60).toFixed(1)} minutes)\n`,
    );
  } catch (error) {
    console.error(`❌ Failed: ${model}`, error);
  }
}

await Deno.writeTextFile(
  "results-data/durations.json",
  JSON.stringify(trainingResults, null, 2),
);
console.log("\n📝 Training durations saved to results-data/durations.json");

// Save all iteration losses to trainLoss.json
await Deno.writeTextFile(
  "results-data/trainLoss.json",
  JSON.stringify(allIterationLosses, null, 2),
);
console.log("📊 All iteration losses saved to results-data/trainLoss.json");
