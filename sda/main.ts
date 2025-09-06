import { askAI, DurationTracker, prettyDuration } from "@nshiab/journalism";
import { existsSync } from "node:fs";

const models = ["gpt-oss:20b", "qwen3:30b", "gemma3:27b", "deepseek-r1:32b"];
const sample = 0; // 0 for all
const roles = [
  "junior developer",
  "senior developer",
  "data analyst",
  "data journalist",
];

const verbose = true;

const start = new Date();

// First, we grab the latest documentation

let sdaDocs;
if (
  existsSync("sda/data/sdaDocs.md")
) {
  console.log("\n1 - Documentation already exists.");
  sdaDocs = Deno.readTextFileSync("sda/data/sdaDocs.md");
} else {
  console.log("\n1 - Fetching latest SDA and journalism documentation...");
  const sdaDocsResponse = await fetch(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/refs/heads/main/llm.md",
  );
  sdaDocs = await sdaDocsResponse.text();
  Deno.writeTextFileSync("sda/data/sdaDocs.md", sdaDocs);
}

// Then we break down the documentation
console.log("\n2 - Breaking down the documentation...");

let documentationChunksSda = [];

const sdaIntro = sdaDocs.split("## class SimpleDB")[0].trim();
const SimpleDBIntro = "## class SimpleDB\n" +
  sdaDocs.split("## class SimpleDB")[1].split("### Methods")[0].trim();
const SimpleDBMethods = sdaDocs.split("## class SimpleDB")[1].split(
  "### Methods",
)[1].split(
  "## class SimpleTable",
)[0].split("\n#### ").filter((d) => d.trim() !== "").map((d) =>
  "\n#### " + d.trim()
);

const SimpleTableIntro = "## class SimpleTable\n" +
  sdaDocs.split("## class SimpleTable")[1].split("### Methods")[0].trim();
const SimpleTableMethods = sdaDocs.split("## class SimpleTable")[1].split(
  "### Methods",
)[1].split(
  "## class SimpleView",
)[0].split("\n#### ").filter((d) => d.trim() !== "").map((d) =>
  "\n#### " + d.trim()
);

console.log("\nMethods for SDA");
console.log("SimpleDBMethods:", SimpleDBMethods.length);
console.log("SimpleTableMethods:", SimpleTableMethods.length);

documentationChunksSda.push(sdaIntro);
documentationChunksSda.push(SimpleDBIntro);
documentationChunksSda.push(...SimpleDBMethods);
documentationChunksSda.push(SimpleTableIntro);
documentationChunksSda.push(...SimpleTableMethods);

if (sample) {
  documentationChunksSda = documentationChunksSda.slice(0, sample);
}

console.log("\nAll chuncks for SDA:", documentationChunksSda.length);

// Now we generate the training data
console.log("\n3 - Generating the training data...");

const tracker = new DurationTracker(
  models.length * documentationChunksSda.length * roles.length,
  {
    prefix: "Estimated time remaining: ",
    suffix: " until completion.",
  },
);

let i = 1;
const trainData: { question: string; answer: string }[] = [];
const missingPrompts: { model: string; prompt: string }[] = [];
for (const model of models) {
  for (const chunk of documentationChunksSda) {
    for (const role of roles) {
      const startChunkModel = new Date();
      console.log(
        `\n${i} / ${
          models.length * documentationChunksSda.length * roles.length
        } - ${model} - ${role}`,
      );
      i++;
      tracker.start();
      const prompt =
        `Your task is to generate a list of relevant questions and answers based on the provided section of documentation. The documentation is for the Simple Data Analysis library, a TypeScript library. The questions should be those a ${role} might have.

The questions must be directly related to the documentation section provided and must not ask about topics outside its scope. Your list of questions should cover all key aspects of the documentation section.

For each question, you must provide a code example as your answer. You must add comments to the code to explain the steps. You must also add a brief, one-sentence explanation before the code example.

The answer should be grounded in the documentation provided. Do not make assumptions. Do not invent features or methods that do not exist.

Write simple and straightforward code examples. Don't create functions to encapsulate your code.

Your code examples should always be wrapped in triple backticks (\`\`\` at the beginning and \`\`\` at the end) for code blocks.

If the documentation section is about SimpleDB, make sure to wrap your code example with:
\`\`\`
import { SimpleDB } from "@nshiab/simple-data-analysis";
// We start a SimpleDB instance
const sdb = new SimpleDB();
[PUT YOUR CODE EXAMPLE HERE]
// We close everything
await sdb.done();
\`\`\`

If the documentation section is about SimpleTable, make sure to wrap your code example with:
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

If the example requires data, load it using \`await table.loadData("path/to/your/data.csv");\` or \`await table.loadGeoData("path/to/your/geodata.geojson");\` for geospatial data.

Do not forget to add \`await sdb.done();\` at the end of your code.

Here are a few complete question-and-answer examples.

Question: How can I open my file sales.csv and see the first few rows?
Answer example:
Here's how you can load a CSV file and log the first rows:
\`\`\`
import { SimpleDB } from "@nshiab/simple-data-analysis";
// We start a SimpleDB instance
const sdb = new SimpleDB();
// We create a new table
const table = sdb.newTable("myTable");
// We load data from the file
await table.loadData("./sales.csv");
// We log the first rows
await table.logTable();
// We close everything
await sdb.done();
\`\`\`

Question: I want to aggregate my data. Which method should I use?
Answer example:
You should use the \`summarize\` method. Here's an example:
\`\`\`
import { SimpleDB } from "@nshiab/simple-data-analysis";
// We start a SimpleDB instance
const sdb = new SimpleDB();
// We create a new table
const table = sdb.newTable("myTable");
// We load data from the file
// Let's assume the data has columns "price" and "product"
await table.loadData("./my-data.csv");
// We summarize to count the number of items sold
// and sum up the total sales for each product
await table.summarize({
  values: "price",
  categories: "product",
  summaries: ["count", "sum"],
  decimals: 2,
});
// We log the results
await table.logTable();
// We close everything
await sdb.done();
\`\`\`

Question: I want to simplify my geospatial data.
Answer example:
You can use the \`simplify\` method. Here's an example:
\`\`\`
import { SimpleDB } from "@nshiab/simple-data-analysis";
// We start a SimpleDB instance
const sdb = new SimpleDB();
// We create a new table
const table = sdb.newTable("geoTable");
// We load geospatial data from a file
await table.loadGeoData("./my-geodata.geojson");
// We simplify the geospatial data with a tolerance of 0.01
await table.simplify(0.01);
// We log the first rows to see the simplified data
await table.logTable();
// We close everything
await sdb.done();
\`\`\`

Return the questions and answers as a JSON object with the following structure:
{ "data": [ { "question": "question1", "answer": "answer1" }, { "question": "question2", "answer": "answer2" }, ... ] }

Make extra sure to return a valid JSON object. Return the JSON object only. Do not add any other text.

Keep it simple and straightforward. Do not think too much.

Here's the documentation section you need to work from:

${chunk}`;

      let data: { data: { question: string; answer: string }[] } = { data: [] };
      try {
        if (model.includes("gemma")) {
          // Non-thinking model
          data = (await askAI(
            prompt,
            {
              verbose,
              cache: true,
              ollama: true,
              contextWindow: 40_000,
              model,
              returnJson: true,
            },
          )) as { data: { question: string; answer: string }[] };
        } else {
          // Thinking model
          // For some reason, the JSON return doesn't work well with thinking
          data = await askAI(
            prompt,
            {
              verbose,
              cache: true,
              ollama: true,
              contextWindow: 40_000,
              model,
              thinkingBudget: 1,
              returnJson: false,
              parseJson: true,
            },
          ) as { data: { question: string; answer: string }[] };
        }

        console.log(`Received ${data.data.length} Q&A pairs.`);

        trainData.push(
          ...(data.data),
        );
      } catch (error) {
        console.log(error);
        missingPrompts.push({ model, prompt });
      }
      prettyDuration(startChunkModel, {
        log: true,
        prefix: "Iteration took ",
      });
      tracker.log();
    }
  }
}

Deno.writeTextFileSync(
  "sda/output/trainData.json",
  JSON.stringify(trainData, null, 2),
);
Deno.writeTextFileSync(
  "sda/output/missingPrompts.json",
  JSON.stringify(missingPrompts, null, 2),
);

// We restructure the training data and split it for mlx
console.log("\n4 - Restructuring and splitting the training data...");

// Shuffle function (Fisher-Yates)
function shuffleArray(array: { prompt: string; completion: string }[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const trainDataMlX = trainData.map(({ question, answer }) => ({
  prompt: question,
  completion: answer,
}));

// Shuffle the data
shuffleArray(trainDataMlX);

// Split: 95% train, 5% valid, 0% test
// No sure how to test for now
const total = trainDataMlX.length;
const trainCount = Math.floor(total * 0.95);
const validCount = Math.floor(total * 0.05);

const trainSet = trainDataMlX.slice(0, trainCount);
const validSet = trainDataMlX.slice(trainCount, trainCount + validCount);
const testSet = trainDataMlX.slice(trainCount + validCount);

function writeJsonlFile(
  path: string,
  data: { prompt: string; completion: string }[],
) {
  const lines = data.map((item) => JSON.stringify(item)).join("\n");
  Deno.writeTextFileSync(path, lines);
}

writeJsonlFile("sda/output/train.jsonl", trainSet);
writeJsonlFile("sda/output/valid.jsonl", validSet);
writeJsonlFile("sda/output/test.jsonl", testSet);

console.log("trainSet:", trainSet.length);
console.log("validSet:", validSet.length);
console.log("testSet:", testSet.length);

console.log("\n*** Done ***");
prettyDuration(start, { log: true, prefix: "Duration: " });
console.log(
  `${
    ((Date.now() - start.getTime()) / 1000 / trainDataMlX.length).toFixed(3)
  } seconds per question.`,
);
