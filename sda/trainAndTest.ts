import { existsSync } from "node:fs";
import downloadModel from "./helpers/downloadModel.ts";
import trainModel from "./helpers/trainModel.ts";
import generateModelResponse from "./helpers/generateModelResponse.ts";
import evaluateAllResponses from "./helpers/evaluateAllResponses.ts";

const models = [
  {
    name: "gemma3-270m-lora",
    mlx: "mlx-community/gemma-3-270m-it-bf16",
    type: "lora",
  },
  {
    name: "gemma3-270m-dora",
    mlx: "mlx-community/gemma-3-270m-it-bf16",
    type: "dora",
  },
  {
    name: "gemma3-270m-full",
    mlx: "mlx-community/gemma-3-270m-it-bf16",
    type: "full",
  },
  {
    name: "gemma3-4b-lora",
    mlx: "mlx-community/gemma-3-4b-it-bf16",
    type: "lora",
  },
  {
    name: "gemma3-4b-dora",
    mlx: "mlx-community/gemma-3-4b-it-bf16",
    type: "dora",
  },
  {
    name: "gemma3-4b-full",
    mlx: "mlx-community/gemma-3-4b-it-bf16",
    type: "full",
  },
  {
    name: "gemma3-12b-lora",
    mlx: "mlx-community/gemma-3-12b-it-bf16",
    type: "lora",
  },
  {
    name: "gemma3-12b-8bit-dora",
    mlx: "mlx-community/gemma-3-12b-it-qat-8bit", // Not enough memory for dora bf16 training
    type: "dora",
  },
  {
    name: "gemma3-12b-8bit-full",
    mlx: "mlx-community/gemma-3-12b-it-qat-8bit", // Not enough memory for full bf16 training
    type: "full",
  },
  {
    name: "llama-3.2-1B-lora",
    mlx: "mlx-community/Llama-3.2-1B-Instruct-bf16",
    type: "lora",
  },
  {
    name: "llama-3.2-1B-dora",
    mlx: "mlx-community/Llama-3.2-1B-Instruct-bf16",
    type: "dora",
  },
  {
    name: "llama-3.2-1B-full",
    mlx: "mlx-community/Llama-3.2-1B-Instruct-bf16",
    type: "full",
  },
  {
    name: "llama-3.2-3B-lora",
    mlx: "mlx-community/Llama-3.2-3B-Instruct-bf16",
    type: "lora",
  },
  {
    name: "llama-3.2-3B-dora",
    mlx: "mlx-community/Llama-3.2-3B-Instruct-bf16",
    type: "dora",
  },
  {
    name: "llama-3.2-3B-full",
    mlx: "mlx-community/Llama-3.2-3B-Instruct-bf16",
    type: "full",
  },
  {
    name: "llama-3.1-8B-lora",
    mlx: "mlx-community/Meta-Llama-3.1-8B-Instruct-bf16",
    type: "lora",
  },
  {
    name: "llama-3.1-8B-dora",
    mlx: "mlx-community/Meta-Llama-3.1-8B-Instruct-bf16",
    type: "dora",
  },
  {
    name: "llama-3.1-8B-full",
    mlx: "mlx-community/Meta-Llama-3.1-8B-Instruct-bf16",
    type: "full",
  },
  // Not working?
  // {
  //   name: "mistral-7B-lora",
  //   mlx: "mlx-community/Mistral-7B-Instruct-v0.3",
  //   type: "lora",
  // },
  // {
  //   name: "mistral-7B-dora",
  //   mlx: "mlx-community/Mistral-7B-Instruct-v0.3",
  //   type: "dora",
  // },
  // {
  //   name: "mistral-7B-full",
  //   mlx: "mlx-community/Mistral-7B-Instruct-v0.3",
  //   type: "full",
  // },
];

const evaluationModels = [
  "gpt-oss:20b",
  "qwen3:30b",
  "gemma3:27b",
  "deepseek-r1:32b",
];

const testQuestions = [
  { question: "How can I open a CSV file?", keyword: ["#### `loadData`"] },
  {
    question:
      "I have a table with two columns: province and fireId. How can I count the number of fires per province?",
    keyword: ["#### `summarize`", "#### `loadData`"],
  },
  {
    question:
      "I would like to compute the mininimum, average and maximum of a column called 'grade', for each group indicated in a column 'classroom', with two decimal places.",
    keyword: ["#### `summarize`", "#### `loadData`"],
  },
  {
    question:
      "Show me how to quickly find the unique values in a column 'city'.",
    keyword: ["#### `getUniques`", "#### `logUniques`", "#### `loadData`"],
  },
  {
    question: "Tell me how to get the standard deviation of a column 'age'.",
    keyword: ["#### `summarize`", "#### `getStdDev`", "#### `loadData`"],
  },
  {
    question: "Is there an easy way to remove missing values?",
    keyword: ["#### `removeMissing`", "#### `loadData`"],
  },
  {
    question: "How can I unpivot my data?",
    keyword: ["#### `longer`", "#### `loadData`"],
  },
  {
    question: "I want to remove duplicates on the column 'email'.",
    keyword: ["#### `removeDuplicates`", "#### `loadData`"],
  },
  {
    question: "Is there a way to calculate correlations between columns?",
    keyword: ["#### `correlations`", "#### `loadData`"],
  },
  {
    question: "Give an example of a join between two tables.",
    keyword: ["#### `join`", "#### `loadData`"],
  },
  {
    question: "How to filter rows by a condition?",
    keyword: [
      "#### `filter`",
      "#### `keep`",
      "#### `remove`",
      "#### `loadData`",
    ],
  },
  {
    question: "How can I rename the column 'Temperature (°C)' to 'temp'?",
    keyword: ["#### `renameColumns`", "#### `loadData`"],
  },
  {
    question: "How to sort the data by the column 'date' in descending order?",
    keyword: ["#### `sort`", "#### `loadData`"],
  },
  {
    question:
      "How to calculate the moving average of the column 'sales' with a window of 7 days?",
    keyword: ["#### `rolling`", "#### `loadData`"],
  },
  {
    question:
      "How can I open a geojson file and fix the errors in its geometries?",
    keyword: ["#### `fixGeo`", "#### `loadGeoData`"],
  },
  {
    question:
      "I have a table with points and another one with polygons. How can I join the points with the polygons they fall into?",
    keyword: ["#### `joinGeo`", "#### `loadGeoData`"],
  },
  {
    question:
      "Show me how to simplify the geometries in the column 'location'.",
    keyword: ["#### `simplify`", "#### `loadGeoData`"],
  },
  {
    question:
      "Can I use an AI model to categorize the data in the column 'customer_complaints'?",
    keyword: ["#### `aiRowByRow`", "#### `loadData`"],
  },
  {
    question:
      "I want to create a simple chart in the terminal to visualize my data.",
    keyword: [
      "#### `logBarChart`",
      "#### `logLineChart`",
      "#### `logDotChart`",
      "#### `loadData`",
    ],
  },
  {
    question: "I want to write my data to a parquet file. How?",
    keyword: ["#### `writeData`", "#### `loadData`"],
  },
  {
    question: "I want to write my geospatial data to a geojson file. How?",
    keyword: ["#### `writeGeoData`", "#### `loadGeoData`"],
  },
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
