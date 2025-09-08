import { askAI, DurationTracker, prettyDuration } from "@nshiab/journalism";

export default async function generateTrainingData(
  models: string[],
  documentationChunksSda: string[],
  roles: string[],
  verbose: boolean,
) {
  console.log("\n3 - Generating the training data...");

  const tracker = new DurationTracker(
    models.length * documentationChunksSda.length * roles.length,
    {
      prefix: "Estimated time remaining: ",
      suffix: " until completion.",
    },
  );

  let i = 1;
  const trainingData: { question: string; answer: string }[] = [];
  const missingPrompts: { model: string; prompt: string }[] = [];
  for (const model of models) {
    for (const chunk of documentationChunksSda) {
      for (const role of roles) {
        const startChunkModel = new Date();
        console.log(
          `\n${i} / ${
            models.length * documentationChunksSda.length * roles.length
          } - ${model} - ${role} - Chunk length: ${chunk.length} characters`,
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

        let data: { data: { question: string; answer: string }[] } = {
          data: [],
        };
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

          trainingData.push(
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
    "sda/output/trainingData.json",
    JSON.stringify(trainingData, null, 2),
  );
  Deno.writeTextFileSync(
    "sda/output/missingPrompts.json",
    JSON.stringify(missingPrompts, null, 2),
  );

  return trainingData;
}
