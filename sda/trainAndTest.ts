import { existsSync } from "node:fs";
import downloadModel from "./helpers/downloadModel.ts";
import trainModel from "./helpers/trainModel.ts";
import generateModelResponse from "./helpers/generateModelResponse.ts";
import evaluateAllResponses from "./helpers/evaluateAllResponses.ts";
import models from "./models.json" with { type: "json" };
import testQuestions from "./testQuestions.json" with { type: "json" };

const evaluationModels = [
  "gpt-oss:20b",
  "qwen3:30b",
  "gemma3:27b",
  "deepseek-r1:32b",
];

const iterations = 5000;

for (const model of models) {
  console.log("Checking path:");

  const pathSafetensors = `models/${model.name}/adapters/adapters.safetensors`;

  console.log("-", pathSafetensors, "=>", existsSync(pathSafetensors));

  const pathConfig = `models/${model.name}/adapters/adapter_config.json`;

  console.log("-", pathConfig, "=>", existsSync(pathConfig));

  const pathIteration = `models/${model.name}/adapters/${
    iterations.toString().padStart(7, "0")
  }_adapters.safetensors`;

  console.log("-", pathIteration, "=>", existsSync(pathIteration));

  if (
    existsSync(
      pathSafetensors,
    ) &&
    existsSync(
      pathConfig,
    ) &&
    existsSync(
      pathIteration,
    )
  ) {
    console.log(
      `Skipping ${model.name} as it is already trained.\n`,
    );
  } else {
    console.log(
      `Pre-downloading and testing model ${model.name}...\n`,
    );
    try {
      await downloadModel(model.mlx);
    } catch (error) {
      console.error(`Failed to download: ${model.name}`, error);
    }

    console.log(`Starting training for ${model.name}...\n`);

    try {
      await trainModel(
        model,
        iterations,
      );
    } catch (error) {
      console.error(
        `Training failed for ${model.mlx} (${model.type}):`,
        error,
      );
    }
  }

  if (
    existsSync(
      `models/${model.name}/responses.json`,
    )
  ) {
    console.log(
      `\nResponses for ${model.name} already exist. Skipping response generation.\n`,
    );
  } else {
    try {
      await generateModelResponse(model, testQuestions);
    } catch (error) {
      console.error(
        `Failed during post-training steps for ${model.name}:`,
        error,
      );
    }
  }

  if (existsSync(`models/${model.name}/validation.json`)) {
    console.log(
      `\nValidation for ${model.name} already exist. Skipping validation.\n`,
    );
  } else {
    try {
      console.log(`\nStarting validation for ${model.name}...\n`);

      const modelResponses = JSON.parse(Deno.readTextFileSync(
        `models/${model.name}/responses.json`,
      )) as {
        model: string;
        question: string;
        response: string;
      }[];

      await evaluateAllResponses(
        modelResponses,
        evaluationModels,
        testQuestions,
      );
    } catch (error) {
      console.error(
        `Failed during validation for ${model.name}:`,
        error,
      );
    }
  }
}
