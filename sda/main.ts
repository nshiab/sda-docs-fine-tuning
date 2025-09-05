import { askAI, DurationTracker, prettyDuration } from "@nshiab/journalism";
import { existsSync } from "node:fs";

const models = ["qwen3:30b", "gemma3:27b", "deepseek-r1:32b"];
const nbQuestions = 10;
const sample = 0; // 0 for all

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
)[0].split("\n#### ").map((d) => "\n#### " + d.trim());

const SimpleTableIntro = "## class SimpleTable\n" +
  sdaDocs.split("## class SimpleTable")[1].split("### Methods")[0].trim();
const SimpleTableMethods = sdaDocs.split("## class SimpleTable")[1].split(
  "### Methods",
)[1].split(
  "## class SimpleView",
)[0].split("\n#### ").map((d) => "\n#### " + d.trim());

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
  models.length * documentationChunksSda.length,
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
    const startChunkModel = new Date();
    console.log(
      `\n${i} / ${models.length * documentationChunksSda.length} - ${model} `,
    );
    i++;
    tracker.start();
    const prompt =
      `Your task is to generate a set of up to ${nbQuestions} relevant questions and answers based on the provided section of documentation. The questions should be those a junior developer or data analyst might have.

For each question, you must provide a code example as the answer. You can add comments to the code to explain the steps. A brief, one-sentence explanation may be included in a comment if the code alone is not a sufficient answer.

The questions must be directly related to the documentation section provided below and must not ask about topics outside its scope. The answer should be grounded in the documentation provided. Do not make assumptions.

Write simple and straightforward code examples. Don't create functions to encapsulate your code.

Your answers should always be wrapped in triple backticks (\`\`\`ts at the beginning and \`\`\` at the end) for code blocks.

If the documentation section is about SimpleDB, make sure to wrap your answer with:
\`\`\`ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
[PUT THE CODE EXAMPLE HERE. IF THERE IS NO CODE TO ADD, JUST ADD A COMMENT SAYING "Do your magic here!"]
await sdb.done();
\`\`\`

If the documentation section is about SimpleTable, make sure to wrap your answer with:
\`\`\`ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv"); // Remove this line if not needed or change the file extension if relevant
[PUT THE CODE EXAMPLE HERE. IF THERE IS NO CODE TO ADD, JUST ADD A COMMENT SAYING "Do your magic here!"]
await sdb.done();
\`\`\`

If you need inspiration, here is a comprehensive example with comments.
\`\`\`ts
import { SimpleDB } from "@nshiab/simple-data-analysis";

// We start a SimpleDB instance.
const sdb = new SimpleDB();

// We create a new table
const fires = sdb.newTable("fires");
// We fetch the wildfires data. It's a csv.
await fires.loadData(
  "data/firesCanada2023.csv",
);

// We summarize to count the number of fires
// and sum up the area burnt in each province.
await fires.summarize({
  values: "hectares",
  categories: "province",
  summaries: ["count", "sum"],
  decimals: 0,
});
// We rename columns.
await fires.renameColumns({
  count: "nbFires",
  sum: "burntArea",
});
// We want the province with
// the greatest burnt area first.
await fires.sort({ burntArea: "desc" });

// We log the results. By default, the method
// logs the first 10 rows, but there is 13
// rows in our data. We also log the data types.
await fires.logTable({ nbRowsToLog: 13, types: true });

// And we can write the data to a parquet, json or csv file.
await fires.writeData("./fires.parquet");

// We close everything.
await sdb.done();
\`\`\`

Return your response as a JSON object with the following structure:
{
  "data": [
    { "question": "question1", "answer": "answer1" },
    { "question": "question2", "answer": "answer2" },
    ...
  ]
}

Here's the documentation section:

${chunk}`;

    try {
      const data = (await askAI(
        prompt,
        {
          //   verbose: true,
          cache: true,
          ollama: true,
          returnJson: true,
          contextWindow: 40_000,
          model,
        },
      )) as { data: { question: string; answer: string }[] };

      //   console.log(data.data);
      trainData.push(
        ...(data.data),
      );
    } catch (_error) {
      missingPrompts.push({ model, prompt });
    }
    prettyDuration(startChunkModel, {
      log: true,
      prefix: "Iteration took ",
    });
    tracker.log();
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

// Split: 90% train, 10% valid, 0% test
// No sure how to test for now
const total = trainDataMlX.length;
const trainCount = Math.floor(total * 0.9);
const validCount = Math.floor(total * 0.1);

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
